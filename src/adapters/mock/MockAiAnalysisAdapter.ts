import { AiAnalysisPort } from '@/ports/AiAnalysisPort';
import { ExternalException } from '@/lib/errors';

/**
 * Reserved symbols that make the mock simulate a failure, so QA can exercise the
 * error UI and the regenerate flow without waiting on a real upstream failure.
 * Both pass `symbolSchema` (length 1–20), so they reach the adapter through the
 * real route.
 */
export const MOCK_PRE_STREAM_ERROR_SYMBOL = '__ERROR_PRE__';
export const MOCK_MID_STREAM_ERROR_SYMBOL = '__ERROR_MID__';

// Group several "tokens" per yielded chunk and pause briefly between them so the
// shimmer → streaming → reveal UI is exercised the same way real token streaming
// drives it.
const TOKENS_PER_CHUNK = 4;
const CHUNK_DELAY_MS = 50;

/**
 * Builds a deterministic, symbol-templated analysis mirroring the real adapter's
 * sections (Market Bias / Price Analysis / News Sentiment / Key Takeaway).
 */
function buildAnalysis(symbol: string): string {
  const s = symbol.toUpperCase();
  return [
    `## AI Analysis for ${s}`,
    ``,
    `**Market Bias**: ${s} is showing a mildly bullish short-term bias as momentum stabilizes above recent support.`,
    ``,
    `**Price Analysis**: ${s} is trading near its 24h VWAP, with the period high acting as immediate resistance and dip buyers defending the lower range. Volume is steady rather than climactic.`,
    ``,
    `**News Sentiment**: Recent ${s} headlines skew constructive — continued ecosystem development and steady inflows outweigh routine profit-taking chatter.`,
    ``,
    `**Key Takeaway**: Watch the VWAP reclaim on ${s}; holding above it keeps the short-term bias constructive, while losing the recent range low would neutralize it.`,
    ``,
    `_Mock analysis — generated without live inference. Not financial advice._`,
  ].join('\n');
}

/** Splits text into streamed chunks on word boundaries, preserving whitespace. */
function toChunks(text: string): string[] {
  const tokens = text.match(/\S+\s*/g) ?? [text];
  const chunks: string[] = [];
  for (let i = 0; i < tokens.length; i += TOKENS_PER_CHUNK) {
    chunks.push(tokens.slice(i, i + TOKENS_PER_CHUNK).join(''));
  }
  return chunks;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Inference-free implementation of the AiAnalysisPort. Streams a deterministic,
 * symbol-templated analysis chunk-by-chunk so the streaming UI runs identically
 * to live inference, with reserved symbols to simulate pre- and mid-stream
 * failures.
 */
export class MockAiAnalysisAdapter implements AiAnalysisPort {
  async analyzeAsset(symbol: string): Promise<string> {
    if (symbol === MOCK_PRE_STREAM_ERROR_SYMBOL || symbol === MOCK_MID_STREAM_ERROR_SYMBOL) {
      throw new ExternalException(
        { kind: 'Unavailable', details: { symbol, simulated: true } },
        `Simulated analysis failure for ${symbol}.`,
      );
    }
    return buildAnalysis(symbol);
  }

  async *analyzeAssetStream(symbol: string): AsyncIterable<string> {
    // Pre-stream failure: throw before yielding anything, so the route maps it to
    // a JSON HTTP error before streaming headers are sent.
    if (symbol === MOCK_PRE_STREAM_ERROR_SYMBOL) {
      throw new ExternalException(
        { kind: 'Unavailable', details: { symbol, simulated: true, phase: 'pre-stream' } },
        `Simulated pre-stream analysis failure for ${symbol}.`,
      );
    }

    const chunks = toChunks(buildAnalysis(symbol));

    for (let i = 0; i < chunks.length; i++) {
      await delay(CHUNK_DELAY_MS);
      yield chunks[i];

      // Mid-stream failure: throw after the first chunk so the client reader
      // rejects rather than receiving a silently truncated analysis.
      if (symbol === MOCK_MID_STREAM_ERROR_SYMBOL) {
        throw new ExternalException(
          { kind: 'Unavailable', details: { symbol, simulated: true, phase: 'mid-stream' } },
          `Simulated mid-stream analysis failure for ${symbol}.`,
        );
      }
    }
  }
}
