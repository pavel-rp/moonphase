/** @jest-environment node */

// Mock langchain before any imports
jest.mock('langchain', () => ({
  tool: jest.fn((func, config) => ({
    invoke: func,
    name: config.name,
    description: config.description,
    schema: config.schema,
  })),
}));

// Mock zod
jest.mock('zod', () => {
  const stringChain: Record<string, jest.Mock> = {};
  stringChain.describe = jest.fn(() => stringChain);
  stringChain.trim = jest.fn(() => stringChain);
  stringChain.min = jest.fn(() => stringChain);
  stringChain.max = jest.fn(() => stringChain);
  stringChain.safeParse = jest.fn((val: unknown) => {
    if (typeof val === 'string' && val.trim().length > 0 && val.trim().length <= 20) {
      return { success: true, data: val.trim() };
    }
    return { success: false, error: { issues: [{ message: 'Invalid' }] } };
  });

  return {
    z: {
      object: jest.fn(() => ({})),
      string: jest.fn(() => stringChain),
      number: jest.fn(() => ({
        min: jest.fn(() => ({
          max: jest.fn(() => ({
            optional: jest.fn(() => ({
              describe: jest.fn(() => ({})),
            })),
          })),
        })),
      })),
    },
  };
});

import { createNewsTool } from '../newsTool';
import type { NewsPort } from '@/ports/NewsPort';
import type { NewsArticle } from '@/domain/newsArticle';

const mockFetchNews = jest.fn();

const mockNewsPort: NewsPort = {
  fetchNews: mockFetchNews,
};

const { getNewsArticlesTool } = createNewsTool({ newsPort: mockNewsPort });

const mockArticle: NewsArticle = {
  title: 'Bitcoin hits new high',
  description: 'BTC surges past resistance levels',
  url: 'https://example.com/btc-news',
  publishedAt: '2026-02-22T12:00:00Z',
  source: { name: 'CryptoNews' },
  content: 'Full article content here.',
};

describe('newsTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('dependency injection', () => {
    it('should accept a NewsPort and create a tool', () => {
      const tool = createNewsTool({ newsPort: mockNewsPort });
      expect(tool.getNewsArticlesTool).toBeDefined();
      expect(tool.getNewsArticlesTool.name).toBe('get_news_articles');
    });

    it('should call the injected newsPort, not a concrete adapter', async () => {
      await getNewsArticlesTool.invoke({ symbol: 'BTC' });
      expect(mockFetchNews).toHaveBeenCalled();
    });
  });

  describe('successful requests', () => {
    it('should return articles for a valid symbol', async () => {
      mockFetchNews.mockResolvedValue([mockArticle]);

      const result = await getNewsArticlesTool.invoke({ symbol: 'BTC' });
      const parsed = JSON.parse(result);

      expect(parsed.success).toBe(true);
      expect(parsed.symbol).toBe('BTC');
      expect(parsed.count).toBe(1);
      expect(parsed.data).toEqual([mockArticle]);
    });

    it('should trim and uppercase the symbol before calling the port', async () => {
      mockFetchNews.mockResolvedValue([mockArticle]);

      await getNewsArticlesTool.invoke({ symbol: 'btc' });

      expect(mockFetchNews).toHaveBeenCalledWith({ symbol: 'BTC', limit: 5 });
    });

    it('should normalize whitespace-padded symbols', async () => {
      mockFetchNews.mockResolvedValue([mockArticle]);

      const result = await getNewsArticlesTool.invoke({ symbol: '  eth  ' });
      const parsed = JSON.parse(result);

      expect(mockFetchNews).toHaveBeenCalledWith({ symbol: 'ETH', limit: 5 });
      expect(parsed.symbol).toBe('ETH');
    });

    it('should use default limit of 5 when not provided', async () => {
      mockFetchNews.mockResolvedValue([]);

      await getNewsArticlesTool.invoke({ symbol: 'ETH' });

      expect(mockFetchNews).toHaveBeenCalledWith({ symbol: 'ETH', limit: 5 });
    });

    it('should pass custom limit when provided', async () => {
      mockFetchNews.mockResolvedValue([mockArticle]);

      await getNewsArticlesTool.invoke({ symbol: 'ETH', limit: 3 });

      expect(mockFetchNews).toHaveBeenCalledWith({ symbol: 'ETH', limit: 3 });
    });

    it('should handle multiple articles', async () => {
      const articles = [
        mockArticle,
        { ...mockArticle, title: 'Ethereum update' },
        { ...mockArticle, title: 'Crypto market recap' },
      ];
      mockFetchNews.mockResolvedValue(articles);

      const result = await getNewsArticlesTool.invoke({ symbol: 'BTC' });
      const parsed = JSON.parse(result);

      expect(parsed.count).toBe(3);
      expect(parsed.data).toHaveLength(3);
    });
  });

  describe('validation errors', () => {
    it('should return error for empty symbol', async () => {
      const result = await getNewsArticlesTool.invoke({ symbol: '' });
      const parsed = JSON.parse(result);

      expect(parsed.error).toContain('Invalid symbol parameter');
      expect(mockFetchNews).not.toHaveBeenCalled();
    });

    it('should return error for null symbol', async () => {
      const result = await getNewsArticlesTool.invoke({ symbol: null as unknown as string });
      const parsed = JSON.parse(result);

      expect(parsed.error).toContain('Invalid symbol parameter');
      expect(mockFetchNews).not.toHaveBeenCalled();
    });

    it('should return error for whitespace-only symbol', async () => {
      const result = await getNewsArticlesTool.invoke({ symbol: '   ' });
      const parsed = JSON.parse(result);

      expect(parsed.error).toContain('Invalid symbol parameter');
      expect(mockFetchNews).not.toHaveBeenCalled();
    });
  });

  describe('empty results', () => {
    it('should return empty data message when no articles found', async () => {
      mockFetchNews.mockResolvedValue([]);

      const result = await getNewsArticlesTool.invoke({ symbol: 'BTC' });
      const parsed = JSON.parse(result);

      expect(parsed.success).toBe(true);
      expect(parsed.count).toBe(0);
      expect(parsed.message).toContain('No recent news articles found');
      expect(parsed.data).toEqual([]);
    });

    it('should handle null response from port', async () => {
      mockFetchNews.mockResolvedValue(null);

      const result = await getNewsArticlesTool.invoke({ symbol: 'BTC' });
      const parsed = JSON.parse(result);

      expect(parsed.success).toBe(true);
      expect(parsed.count).toBe(0);
    });
  });

  describe('API errors', () => {
    it('should handle NEWS_API_KEY errors', async () => {
      mockFetchNews.mockRejectedValue(new Error('Missing NEWS_API_KEY'));

      const result = await getNewsArticlesTool.invoke({ symbol: 'BTC' });
      const parsed = JSON.parse(result);

      expect(parsed.error).toContain('News API is not configured');
      expect(parsed.fallback).toBeUndefined();
    });

    it('should handle rate limit errors', async () => {
      mockFetchNews.mockRejectedValue(new Error('rate limit exceeded'));

      const result = await getNewsArticlesTool.invoke({ symbol: 'BTC' });
      const parsed = JSON.parse(result);

      expect(parsed.error).toContain('Rate limit exceeded');
    });

    it('should handle 429 status errors', async () => {
      mockFetchNews.mockRejectedValue(new Error('HTTP 429 Too Many Requests'));

      const result = await getNewsArticlesTool.invoke({ symbol: 'BTC' });
      const parsed = JSON.parse(result);

      expect(parsed.error).toContain('Rate limit exceeded');
    });

    it('should handle timeout errors', async () => {
      mockFetchNews.mockRejectedValue(new Error('Request timeout'));

      const result = await getNewsArticlesTool.invoke({ symbol: 'BTC' });
      const parsed = JSON.parse(result);

      expect(parsed.error).toContain('Unable to connect to News API');
    });

    it('should handle connection refused errors', async () => {
      mockFetchNews.mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await getNewsArticlesTool.invoke({ symbol: 'BTC' });
      const parsed = JSON.parse(result);

      expect(parsed.error).toContain('Unable to connect to News API');
    });

    it('should handle generic errors with context', async () => {
      mockFetchNews.mockRejectedValue(new Error('Something went wrong'));

      const result = await getNewsArticlesTool.invoke({ symbol: 'BTC' });
      const parsed = JSON.parse(result);

      expect(parsed.error).toContain('Failed to fetch news');
      expect(parsed.error).toContain('BTC');
      expect(parsed.error).toContain('Something went wrong');
    });

    it('should handle non-Error objects', async () => {
      mockFetchNews.mockRejectedValue('string error');

      const result = await getNewsArticlesTool.invoke({ symbol: 'BTC' });
      const parsed = JSON.parse(result);

      expect(parsed.error).toContain('Unknown error occurred');
    });
  });
});
