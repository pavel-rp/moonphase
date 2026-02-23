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
  stringChain.min = jest.fn(() => stringChain);
  stringChain.max = jest.fn(() => stringChain);
  stringChain.trim = jest.fn(() => stringChain);
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
        describe: jest.fn(() => ({
          optional: jest.fn(() => ({})),
        })),
      })),
    },
  };
});

import { createPriceTools } from '../priceTools';
import type { Candlestick } from '@/ports/BinancePort';

const mockGetPriceHistory = jest.fn();
const mockGetVWAP = jest.fn();

const { getPriceHistoryTool, getVWAPTool } = createPriceTools({
  getPriceHistory: mockGetPriceHistory,
  getVWAP: mockGetVWAP,
});

describe('priceTools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPriceHistoryTool', () => {
    describe('successful requests', () => {
      it('should return price history data for a valid symbol', async () => {
        const mockCandles: Candlestick[] = [
          {
            openTime: 1700000000000,
            open: 100,
            high: 110,
            low: 90,
            close: 105,
            volume: 1000,
            closeTime: 1700086400000,
          },
          {
            openTime: 1700086400000,
            open: 105,
            high: 120,
            low: 100,
            close: 118,
            volume: 1500,
            closeTime: 1700172800000,
          },
        ];

        mockGetPriceHistory.mockResolvedValue(mockCandles);

        const result = await getPriceHistoryTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.success).toBe(true);
        expect(parsed.symbol).toBe('BTCUSDT');
        expect(parsed.count).toBe(2);
        expect(parsed.data).toEqual(mockCandles);
        expect(mockGetPriceHistory).toHaveBeenCalledWith(
          { symbol: 'BTCUSDT', limit: undefined }
        );
      });

      it('should pass limit parameter when provided', async () => {
        const mockCandles: Candlestick[] = [
          {
            openTime: 1700000000000,
            open: 100,
            high: 110,
            low: 90,
            close: 105,
            volume: 1000,
            closeTime: 1700086400000,
          },
        ];

        mockGetPriceHistory.mockResolvedValue(mockCandles);

        const result = await getPriceHistoryTool.invoke({ symbol: 'ETHUSDT', limit: 10 });
        const parsed = JSON.parse(result);

        expect(parsed.success).toBe(true);
        expect(parsed.count).toBe(1);
        expect(mockGetPriceHistory).toHaveBeenCalledWith(
          { symbol: 'ETHUSDT', limit: 10 }
        );
      });

      it('should handle multiple different symbols', async () => {
        const mockCandles: Candlestick[] = [
          {
            openTime: 1700000000000,
            open: 50,
            high: 55,
            low: 48,
            close: 52,
            volume: 500,
            closeTime: 1700086400000,
          },
        ];

        mockGetPriceHistory.mockResolvedValue(mockCandles);

        await getPriceHistoryTool.invoke({ symbol: 'SOLUSDT' });
        expect(mockGetPriceHistory).toHaveBeenCalledWith(
          expect.objectContaining({ symbol: 'SOLUSDT' })
        );
      });
    });

    describe('validation errors', () => {
      it('should return error for empty symbol', async () => {
        const result = await getPriceHistoryTool.invoke({ symbol: '' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Invalid symbol parameter');
        expect(mockGetPriceHistory).not.toHaveBeenCalled();
      });

      it('should return error for invalid symbol type', async () => {
        const result = await getPriceHistoryTool.invoke({ symbol: null as unknown as string });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Invalid symbol parameter');
        expect(mockGetPriceHistory).not.toHaveBeenCalled();
      });
    });

    describe('empty results', () => {
      it('should return error when no candles are found', async () => {
        mockGetPriceHistory.mockResolvedValue([]);

        const result = await getPriceHistoryTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('No price history found');
        expect(parsed.error).toContain('BTCUSDT');
      });
    });

    describe('API errors', () => {
      it('should handle 404 errors with meaningful message', async () => {
        mockGetPriceHistory.mockRejectedValue(new Error('404 not found'));

        const result = await getPriceHistoryTool.invoke({ symbol: 'INVALIDUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('not found on Binance');
        expect(parsed.error).toContain('INVALIDUSDT');
      });

      it('should handle rate limit errors', async () => {
        mockGetPriceHistory.mockRejectedValue(new Error('rate limit exceeded'));

        const result = await getPriceHistoryTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Rate limit exceeded');
      });

      it('should handle 429 status errors', async () => {
        mockGetPriceHistory.mockRejectedValue(new Error('HTTP 429 Too Many Requests'));

        const result = await getPriceHistoryTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Rate limit exceeded');
      });

      it('should handle timeout errors', async () => {
        mockGetPriceHistory.mockRejectedValue(new Error('Request timeout'));

        const result = await getPriceHistoryTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Unable to connect to Binance API');
      });

      it('should handle connection refused errors', async () => {
        mockGetPriceHistory.mockRejectedValue(new Error('ECONNREFUSED'));

        const result = await getPriceHistoryTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Unable to connect to Binance API');
      });

      it('should handle generic errors with context', async () => {
        mockGetPriceHistory.mockRejectedValue(new Error('Something went wrong'));

        const result = await getPriceHistoryTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Failed to fetch price history');
        expect(parsed.error).toContain('BTCUSDT');
        expect(parsed.error).toContain('Something went wrong');
      });

      it('should handle non-Error objects', async () => {
        mockGetPriceHistory.mockRejectedValue('string error');

        const result = await getPriceHistoryTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Unknown error occurred');
      });
    });
  });

  describe('getVWAPTool', () => {
    describe('successful requests', () => {
      it('should return VWAP data for a valid symbol', async () => {
        mockGetVWAP.mockResolvedValue(50000.123456);

        const result = await getVWAPTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.success).toBe(true);
        expect(parsed.symbol).toBe('BTCUSDT');
        expect(parsed.vwap).toBe(50000.123456);
        expect(mockGetVWAP).toHaveBeenCalledWith(
          'BTCUSDT'
        );
      });

      it('should handle different symbols', async () => {
        mockGetVWAP.mockResolvedValue(3200.5);

        const result = await getVWAPTool.invoke({ symbol: 'ETHUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.success).toBe(true);
        expect(parsed.symbol).toBe('ETHUSDT');
        expect(parsed.vwap).toBe(3200.5);
      });

      it('should handle zero VWAP value', async () => {
        mockGetVWAP.mockResolvedValue(0);

        const result = await getVWAPTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.success).toBe(true);
        expect(parsed.vwap).toBe(0);
      });
    });

    describe('validation errors', () => {
      it('should return error for empty symbol', async () => {
        const result = await getVWAPTool.invoke({ symbol: '' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Invalid symbol parameter');
        expect(mockGetVWAP).not.toHaveBeenCalled();
      });

      it('should return error for invalid symbol type', async () => {
        const result = await getVWAPTool.invoke({ symbol: undefined as unknown as string });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Invalid symbol parameter');
        expect(mockGetVWAP).not.toHaveBeenCalled();
      });
    });

    describe('invalid results', () => {
      it('should return error for null VWAP', async () => {
        mockGetVWAP.mockResolvedValue(null as unknown as number);

        const result = await getVWAPTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('No VWAP data found');
        expect(parsed.error).toContain('BTCUSDT');
      });

      it('should return error for undefined VWAP', async () => {
        mockGetVWAP.mockResolvedValue(undefined as unknown as number);

        const result = await getVWAPTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('No VWAP data found');
      });

      it('should return error for NaN VWAP', async () => {
        mockGetVWAP.mockResolvedValue(NaN);

        const result = await getVWAPTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('No VWAP data found');
      });
    });

    describe('API errors', () => {
      it('should handle 404 errors with meaningful message', async () => {
        mockGetVWAP.mockRejectedValue(new Error('404 not found'));

        const result = await getVWAPTool.invoke({ symbol: 'INVALIDUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('not found on Binance');
        expect(parsed.error).toContain('INVALIDUSDT');
      });

      it('should handle rate limit errors', async () => {
        mockGetVWAP.mockRejectedValue(new Error('rate limit exceeded'));

        const result = await getVWAPTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Rate limit exceeded');
      });

      it('should handle 429 status errors', async () => {
        mockGetVWAP.mockRejectedValue(new Error('HTTP 429 Too Many Requests'));

        const result = await getVWAPTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Rate limit exceeded');
      });

      it('should handle timeout errors', async () => {
        mockGetVWAP.mockRejectedValue(new Error('Request timeout'));

        const result = await getVWAPTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Unable to connect to Binance API');
      });

      it('should handle connection refused errors', async () => {
        mockGetVWAP.mockRejectedValue(new Error('ECONNREFUSED'));

        const result = await getVWAPTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Unable to connect to Binance API');
      });

      it('should handle generic errors with context', async () => {
        mockGetVWAP.mockRejectedValue(new Error('Something went wrong'));

        const result = await getVWAPTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Failed to fetch VWAP');
        expect(parsed.error).toContain('BTCUSDT');
        expect(parsed.error).toContain('Something went wrong');
      });

      it('should handle non-Error objects', async () => {
        mockGetVWAP.mockRejectedValue({ message: 'custom error' });

        const result = await getVWAPTool.invoke({ symbol: 'BTCUSDT' });
        const parsed = JSON.parse(result);

        expect(parsed.error).toContain('Unknown error occurred');
      });
    });
  });
});
