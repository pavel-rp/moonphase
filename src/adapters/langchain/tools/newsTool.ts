import { tool } from 'langchain';
import { z } from 'zod';
import { NewsPort } from '@/ports/NewsPort';
import { NewsAdapter } from '@/adapters/news/NewsAdapter';
import { MockNewsAdapter } from '@/adapters/news/MockNewsAdapter';
import { getEnv } from '@/lib/env';

// Use mock adapter if NEWS_API_KEY not available
function getNewsAdapter(): NewsPort {
  try {
    const env = getEnv();
    return env.NEWS_API_KEY ? new NewsAdapter() : new MockNewsAdapter();
  } catch {
    // Fallback to mock if env parsing fails
    return new MockNewsAdapter();
  }
}

const newsAdapter = getNewsAdapter();

/**
 * Validates symbol parameter.
 */
function validateSymbol(symbol: unknown): string | null {
  if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
    return JSON.stringify({
      error: 'Invalid symbol parameter. Symbol must be a non-empty string (e.g., "BTC", "ETH").',
    });
  }
  return null;
}

/**
 * Handles errors from news fetching.
 */
function handleNewsToolError(error: unknown, symbol: string): string {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

  if (errorMessage.includes('NEWS_API_KEY')) {
    return JSON.stringify({
      error: 'News API is not configured. Please set NEWS_API_KEY environment variable.',
      fallback: 'Mock data may be returned instead.',
    });
  }

  if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
    return JSON.stringify({
      error: 'Rate limit exceeded for News API. Please wait before trying again.',
    });
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
    return JSON.stringify({
      error: 'Unable to connect to News API. The service may be temporarily unavailable.',
    });
  }

  return JSON.stringify({
    error: `Failed to fetch news for "${symbol}": ${errorMessage}`,
  });
}

export const getNewsArticlesTool = tool(
  async ({ symbol, limit }: { symbol: string; limit?: number }) => {
    try {
      const validationError = validateSymbol(symbol);
      if (validationError) {
        return validationError;
      }

      const upperSymbol = symbol.toUpperCase();
      const requestLimit = limit ?? 5;
      let articles: Awaited<ReturnType<NewsPort['fetchNews']>> = [];
      let usedMockFallback = false;
      let source: 'live' | 'mock' = newsAdapter instanceof MockNewsAdapter ? 'mock' : 'live';

      // Try the primary adapter first
      if (newsAdapter instanceof NewsAdapter) {
        try {
          articles = await newsAdapter.fetchNews({
            symbol: upperSymbol,
            limit: requestLimit,
          });
        } catch {
          // Real adapter threw an error, fall back to mock
          usedMockFallback = true;
        }

        // If real adapter returned empty (which can happen on internal errors due to graceful degradation),
        // fall back to mock for better UX
        if (!articles || articles.length === 0) {
          usedMockFallback = true;
        }

        if (usedMockFallback) {
          const mockAdapter = new MockNewsAdapter();
          articles = await mockAdapter.fetchNews({
            symbol: upperSymbol,
            limit: requestLimit,
          });
          source = 'mock';
        }
      } else {
        // Already using mock adapter
        articles = await newsAdapter.fetchNews({
          symbol: upperSymbol,
          limit: requestLimit,
        });
      }

      if (!articles || articles.length === 0) {
        return JSON.stringify({
          success: true,
          symbol,
          count: 0,
          message: 'No recent news articles found for this symbol.',
          data: [],
        });
      }

      return JSON.stringify({
        success: true,
        symbol,
        count: articles.length,
        data: articles,
        source,
        fallback: usedMockFallback,
      });
    } catch (error) {
      return handleNewsToolError(error, symbol);
    }
  },
  {
    name: 'get_news_articles',
    description:
      'Fetches recent cryptocurrency news articles for sentiment analysis and market context. Input: symbol (e.g., BTC, ETH), optional limit (default 5, max 10). Returns JSON array of news articles with title, description, url, publishedAt, source, and content.',
    schema: z.object({
      symbol: z.string().describe('The cryptocurrency symbol (e.g., BTC, ETH).'),
      limit: z
        .number()
        .min(1)
        .max(10)
        .optional()
        .describe('Number of articles to fetch (default 5, max 10).'),
    }),
  }
);
