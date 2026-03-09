import { AiAnalysisPort } from "@/ports/AiAnalysisPort";
import { ChatOpenAI } from "@langchain/openai";
import { createPriceTools, type PriceTools } from "./tools/priceTools";
import { createNewsTool, type NewsTools } from "./tools/newsTool";
import { getEnv } from "@/lib/env";
import { logRequest, logError } from "@/lib/observability";
import { ExternalException } from "@/lib/errors";
import { toBinancePair } from "@/lib/symbolMeta";
import { AI_LLM_TEMPERATURE, AI_NEWS_LIMIT, AI_PRICE_HISTORY_DAYS } from "@/lib/config";
import { BinancePort, Candlestick } from "@/ports/BinancePort";
import { NewsPort } from "@/ports/NewsPort";
import { NewsArticle } from "@/domain/newsArticle";

interface PriceHistoryToolResult {
  success?: boolean;
  error?: string;
  symbol?: string;
  count?: number;
  data?: Candlestick[];
}

interface VWAPToolResult {
  success?: boolean;
  error?: string;
  symbol?: string;
  vwap?: number;
}

interface NewsToolResult {
  success?: boolean;
  error?: string;
  symbol?: string;
  count?: number;
  data?: NewsArticle[];
  message?: string;
}

/**
 * Safely parses a JSON string, returning null on failure.
 */
function safeParseJson<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}

/**
 * Formats price history data for LLM consumption.
 */
function formatPriceHistory(result: PriceHistoryToolResult): string {
  if (result.error) {
    return `Error fetching price data: ${result.error}`;
  }

  if (!result.data || result.data.length === 0) {
    return "No price history available.";
  }

  const candles = result.data;
  const latestCandle = candles[candles.length - 1];
  const oldestCandle = candles[0];

  // Calculate price change over period
  const priceChange = latestCandle.close - oldestCandle.close;
  const priceChangePercent = ((priceChange / oldestCandle.close) * 100).toFixed(2);
  const direction = priceChange >= 0 ? "up" : "down";

  // Find high and low over period
  const highPrice = Math.max(...candles.map((c) => c.high));
  const lowPrice = Math.min(...candles.map((c) => c.low));

  // Recent trend (last 3 candles)
  const recentCandles = candles.slice(-3);
  const recentTrend = recentCandles.every((c, i) =>
    i === 0 || c.close >= recentCandles[i - 1].close
  ) ? "bullish" : recentCandles.every((c, i) =>
    i === 0 || c.close <= recentCandles[i - 1].close
  ) ? "bearish" : "mixed";

  return `Price Summary (${candles.length} days):
- Current Price: $${latestCandle.close.toLocaleString()}
- Period Change: ${direction} ${Math.abs(priceChange).toLocaleString()} (${priceChangePercent}%)
- Period High: $${highPrice.toLocaleString()}
- Period Low: $${lowPrice.toLocaleString()}
- Recent Trend (3d): ${recentTrend}
- Latest Volume: ${latestCandle.volume.toLocaleString()}`;
}

/**
 * Formats VWAP data for LLM consumption.
 */
function formatVWAP(result: VWAPToolResult, currentPrice?: number): string {
  if (result.error) {
    return `Error fetching VWAP: ${result.error}`;
  }

  if (result.vwap === undefined || result.vwap === null) {
    return "VWAP data not available.";
  }

  let vwapContext = `24h VWAP: $${result.vwap.toLocaleString()}`;

  if (currentPrice !== undefined) {
    const deviation = ((currentPrice - result.vwap) / result.vwap) * 100;
    const position = currentPrice > result.vwap ? "above" : "below";
    vwapContext += `\n- Price is ${position} VWAP by ${Math.abs(deviation).toFixed(2)}%`;
    vwapContext += deviation > 2
      ? " (potentially overbought)"
      : deviation < -2
        ? " (potentially oversold)"
        : " (near fair value)";
  }

  return vwapContext;
}

/**
 * Formats news articles for LLM consumption.
 */
function formatNews(result: NewsToolResult): string {
  if (result.error) {
    return `Error fetching news: ${result.error}`;
  }

  if (result.message) {
    return result.message;
  }

  if (!result.data || result.data.length === 0) {
    return "No recent news articles found.";
  }

  let newsContext = `Recent News:\n`;

  result.data.slice(0, 5).forEach((article, idx) => {
    const date = new Date(article.publishedAt).toLocaleDateString();
    newsContext += `${idx + 1}. "${article.title}" - ${article.source.name} (${date})\n`;
    if (article.description) {
      newsContext += `   ${article.description.slice(0, 100)}...\n`;
    }
  });

  return newsContext;
}

/**
 * LangChain adapter for AI analysis of cryptocurrency assets.
 * Implements the AiAnalysisPort interface using LangChain agents and tools.
 */
export class LangChainAiAdapter implements AiAnalysisPort {
  private model: ChatOpenAI;
  private getPriceHistoryTool: PriceTools['getPriceHistoryTool'];
  private getVWAPTool: PriceTools['getVWAPTool'];
  private getNewsArticlesTool: NewsTools['getNewsArticlesTool'];

  constructor(deps: { binance: BinancePort; news: NewsPort }) {
    const env = getEnv();

    if (!env.OPENAI_API_KEY) {
      throw new ExternalException(
        { kind: 'InvalidRequest', details: { missingEnv: 'OPENAI_API_KEY' } },
        'OPENAI_API_KEY is required for AI analysis. Please set the environment variable.',
      );
    }

    this.model = new ChatOpenAI({
      model: "gpt-5.1",
      apiKey: env.OPENAI_API_KEY,
      temperature: AI_LLM_TEMPERATURE,
    });

    const { getPriceHistoryTool, getVWAPTool } = createPriceTools({
      getPriceHistory: (params) => deps.binance.getDailyCandles(params.symbol, params.limit),
      getVWAP: (symbol) => deps.binance.get24HrStats(symbol),
    });
    this.getPriceHistoryTool = getPriceHistoryTool;
    this.getVWAPTool = getVWAPTool;

    const { getNewsArticlesTool } = createNewsTool({ newsPort: deps.news });
    this.getNewsArticlesTool = getNewsArticlesTool;
  }

  /**
   * Analyze a cryptocurrency asset by symbol.
   * @param symbol - The asset symbol to analyze.
   * @returns The AI-generated analysis.
   */
  async analyzeAsset(symbol: string): Promise<string> {
    const systemPrompt = `You are a cryptocurrency market analyst providing concise, actionable insights.

Your role:
- Analyze price data, VWAP, and news sentiment
- Provide short-term bias (bullish/bearish/sideways)
- Identify key signals (trend, momentum, volatility)
- Keep analysis brief and focused (3-4 paragraphs max)

Format your response with:
1. **Market Bias**: Current short-term direction
2. **Price Analysis**: Key levels and VWAP context
3. **News Sentiment**: Recent developments impact
4. **Key Takeaway**: One clear actionable insight

Do not provide financial advice. Focus on data-driven observations.`;

    try {
      // Gather data from tools first
      const binanceSymbol = toBinancePair(symbol);
      logRequest({ url: `openai/chat (${symbol})`, method: 'POST' });

      const [priceHistoryResult, vwapResult, newsResult] = await Promise.allSettled([
        this.getPriceHistoryTool.invoke({ symbol: binanceSymbol, limit: AI_PRICE_HISTORY_DAYS }),
        this.getVWAPTool.invoke({ symbol: binanceSymbol }),
        this.getNewsArticlesTool.invoke({ symbol: symbol.toUpperCase(), limit: AI_NEWS_LIMIT }),
      ]);

      // Parse and format tool results for LLM consumption
      let context = `Market Data for ${symbol}:\n\n`;

      // Parse price history and extract current price for VWAP context
      let currentPrice: number | undefined;
      if (priceHistoryResult.status === 'fulfilled') {
        const priceData = safeParseJson<PriceHistoryToolResult>(priceHistoryResult.value);
        if (priceData) {
          context += `${formatPriceHistory(priceData)}\n\n`;
          // Extract current price for VWAP comparison
          if (priceData.data && priceData.data.length > 0) {
            currentPrice = priceData.data[priceData.data.length - 1].close;
          }
        }
      }

      if (vwapResult.status === 'fulfilled') {
        const vwapData = safeParseJson<VWAPToolResult>(vwapResult.value);
        if (vwapData) {
          context += `${formatVWAP(vwapData, currentPrice)}\n\n`;
        }
      }

      if (newsResult.status === 'fulfilled') {
        const newsData = safeParseJson<NewsToolResult>(newsResult.value);
        if (newsData) {
          context += `${formatNews(newsData)}\n\n`;
        }
      }

      // Get analysis from model
      const response = await this.model.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: `${context}\n\nBased on the above data, provide a comprehensive analysis of ${symbol}.` },
      ]);

      return response.content as string;
    } catch (error) {
      logError(error, { adapter: 'LangChainAiAdapter', method: 'analyzeAsset', symbol });
      if (error instanceof ExternalException) throw error;
      throw new ExternalException(
        { kind: 'Unavailable', details: { symbol, originalError: error instanceof Error ? error.message : String(error) } },
        `Failed to analyze ${symbol}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Analyze a cryptocurrency asset by symbol and stream the AI-generated analysis chunks.
   * @param symbol - The asset symbol to analyze.
   * @returns An async iterable of string chunks.
   */
  async *analyzeAssetStream(symbol: string): AsyncIterable<string> {
    // For MVP, just yield the complete analysis
    const analysis = await this.analyzeAsset(symbol);
    yield analysis;
  }
}
