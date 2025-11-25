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
        status: 'ok',
        totalResults: 2,
        articles: [
          {
            title: 'BTC News',
            description: 'Bitcoin update',
            url: 'https://example.com/1',
            publishedAt: '2025-01-01T00:00:00Z',
            source: { name: 'Test Source' },
            content: 'Full content',
          },
          {
            title: 'BTC Analysis',
            description: 'Market analysis',
            url: 'https://example.com/2',
            publishedAt: '2025-01-02T00:00:00Z',
            source: { name: 'Crypto Daily' },
            content: 'Analysis content',
          },
        ],
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
        expect.stringContaining('q=BTC'),
        expect.objectContaining({ next: { revalidate: 300 } })
      );
    });

    it('should use default limit of 5 when not specified', async () => {
      mockGet.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'ok', totalResults: 0, articles: [] }),
      } as Response);

      await adapter.fetchNews({ symbol: 'ETH' });

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('pageSize=5'),
        expect.any(Object)
      );
    });

    it('should use custom limit when provided', async () => {
      mockGet.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'ok', totalResults: 0, articles: [] }),
      } as Response);

      await adapter.fetchNews({ symbol: 'BTC', limit: 10 });

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('pageSize=10'),
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
        status: 'ok',
        totalResults: 1,
        articles: [
          {
            title: 'BTC News',
            description: 'Test',
            url: 'https://example.com/1',
            publishedAt: '2025-01-01T00:00:00Z',
            source: { name: 'Test' },
            content: null,
          },
        ],
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
        json: async () => ({ status: 'ok', totalResults: 0, articles: [] }),
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
        json: async () => ({ status: 'ok', totalResults: 0, articles: [] }),
      } as Response);

      await adapter.fetchNews({ symbol: 'BTC', limit: 3 });

      const callArg = mockGet.mock.calls[0][0];
      expect(callArg).toContain('q=BTC');
      expect(callArg).toContain('sortBy=publishedAt');
      expect(callArg).toContain('language=en');
      expect(callArg).toContain('pageSize=3');
    });
  });
});
