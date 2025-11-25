/** @jest-environment node */

jest.mock('../client');

import { NewsAdapter } from '../NewsAdapter';
import { get } from '../client';

const mockGet = get as jest.MockedFunction<typeof get>;

describe('NewsAdapter', () => {
  let adapter: NewsAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new NewsAdapter();
  });

  describe('fetchNews', () => {
    it('should fetch and parse news articles successfully', async () => {
      const mockResponse = {
        articles: {
          results: [
            {
              uri: 'uri1',
              title: 'BTC News',
              body: 'Bitcoin update content',
              url: 'https://example.com/1',
              dateTime: '2025-01-01T00:00:00Z',
              source: {
                uri: 'source1',
                title: 'Test Source',
              },
              image: null,
            },
            {
              uri: 'uri2',
              title: 'BTC Analysis',
              body: 'Market analysis content',
              url: 'https://example.com/2',
              dateTime: '2025-01-02T00:00:00Z',
              source: {
                uri: 'source2',
                title: 'Crypto Daily',
              },
              image: null,
            },
          ],
          totalResults: 2,
        },
      };

      mockGet.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await adapter.fetchNews({ symbol: 'BTC' });

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('BTC News');
      expect(result[1].title).toBe('BTC Analysis');
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('keyword=Bitcoin+cryptocurrency'),
        expect.objectContaining({ next: { revalidate: 300 } })
      );
    });

    it('should use default limit of 5 when not specified', async () => {
      mockGet.mockResolvedValue({
        ok: true,
        json: async () => ({
          articles: {
            results: [],
            totalResults: 0,
          },
        }),
      } as Response);

      await adapter.fetchNews({ symbol: 'ETH' });

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('articlesCount=5'),
        expect.any(Object)
      );
    });

    it('should use custom limit when provided', async () => {
      mockGet.mockResolvedValue({
        ok: true,
        json: async () => ({
          articles: {
            results: [],
            totalResults: 0,
          },
        }),
      } as Response);

      await adapter.fetchNews({ symbol: 'BTC', limit: 10 });

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('articlesCount=10'),
        expect.any(Object)
      );
    });

    it('should handle API errors gracefully by returning empty array', async () => {
      mockGet.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const result = await adapter.fetchNews({ symbol: 'BTC' });

      expect(result).toEqual([]);
    });

    it('should handle network errors gracefully by returning empty array', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));

      const result = await adapter.fetchNews({ symbol: 'BTC' });

      expect(result).toEqual([]);
    });

    it('should handle invalid JSON response gracefully', async () => {
      mockGet.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      const result = await adapter.fetchNews({ symbol: 'BTC' });

      expect(result).toEqual([]);
    });

    it('should deduplicate concurrent requests for same symbol and limit', async () => {
      const mockResponse = {
        articles: {
          results: [
            {
              uri: 'uri1',
              title: 'BTC News',
              body: 'Test content',
              url: 'https://example.com/1',
              dateTime: '2025-01-01T00:00:00Z',
              source: {
                uri: 'source1',
                title: 'Test',
              },
              image: null,
            },
          ],
          totalResults: 1,
        },
      };

      mockGet.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const [result1, result2] = await Promise.all([
        adapter.fetchNews({ symbol: 'BTC', limit: 5 }),
        adapter.fetchNews({ symbol: 'BTC', limit: 5 }),
      ]);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('should not deduplicate requests for different symbols', async () => {
      mockGet.mockResolvedValue({
        ok: true,
        json: async () => ({
          articles: {
            results: [],
            totalResults: 0,
          },
        }),
      } as Response);

      await Promise.all([
        adapter.fetchNews({ symbol: 'BTC' }),
        adapter.fetchNews({ symbol: 'ETH' }),
      ]);

      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it('should include correct query parameters', async () => {
      mockGet.mockResolvedValue({
        ok: true,
        json: async () => ({
          articles: {
            results: [],
            totalResults: 0,
          },
        }),
      } as Response);

      await adapter.fetchNews({ symbol: 'BTC', limit: 3 });

      const callArg = mockGet.mock.calls[0][0];
      expect(callArg).toContain('keyword=Bitcoin+cryptocurrency');
      expect(callArg).toContain('articlesSortBy=date');
      expect(callArg).toContain('lang=eng');
      expect(callArg).toContain('articlesCount=3');
    });
  });
});
