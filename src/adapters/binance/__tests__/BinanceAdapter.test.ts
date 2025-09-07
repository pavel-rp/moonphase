/** @jest-environment node */
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { BinanceAdapter } from '@/adapters/binance/BinanceAdapter';

const API_BASE = 'https://api.binance.com/api/v3';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('BinanceAdapter', () => {
  const adapter = new BinanceAdapter();
  const symbol = 'BTCUSDT';

  test('get24HrStats returns weighted average price as number', async () => {
    server.use(
      http.get(`${API_BASE}/ticker/24hr`, ({ request }) => {
        const url = new URL(request.url);
        const qSymbol = url.searchParams.get('symbol');
        if (qSymbol !== symbol) return HttpResponse.json({ message: 'bad symbol' }, { status: 400 });
        return HttpResponse.json({ weightedAvgPrice: '50000.123456', lastPrice: '50100.00' });
      }),
    );

    const vwap = await adapter.get24HrStats(symbol);
    expect(typeof vwap).toBe('number');
    expect(vwap).toBeCloseTo(50000.123456);
  });

  test('getDailyCandles maps raw kline tuples to Candlestick objects', async () => {
    const klines = [
      [1700000000000, '100.0', '110.0', '90.0', '105.5', '1000', 1700086400000, 'ignored'],
      [1700086400000, '105.5', '120.0', '100.0', '118.0', '1500', 1700172800000, 'ignored'],
    ];
    server.use(
      http.get(`${API_BASE}/klines`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('symbol') !== symbol || url.searchParams.get('interval') !== '1d') {
          return HttpResponse.json({ message: 'bad query' }, { status: 400 });
        }
        return HttpResponse.json(klines);
      }),
    );

    const candles = await adapter.getDailyCandles(symbol, 2);
    expect(candles).toHaveLength(2);
    expect(candles[0]).toEqual({
      openTime: 1700000000000,
      open: 100,
      high: 110,
      low: 90,
      close: 105.5,
      volume: 1000,
      closeTime: 1700086400000,
    });
    expect(candles[1].close).toBe(118);
  });

  test('throws on HTTP error responses', async () => {
    server.use(
      http.get(`${API_BASE}/ticker/24hr`, () => HttpResponse.json({ message: 'error' }, { status: 500 })),
    );
    await expect(adapter.get24HrStats(symbol)).rejects.toThrow(/Binance API error 500/);
  });

  test('throws on invalid JSON shape', async () => {
    server.use(
      http.get(`${API_BASE}/ticker/24hr`, () => HttpResponse.json({ weightedAvgPrice: null })),
    );
    await expect(adapter.get24HrStats(symbol)).rejects.toBeInstanceOf(Error);
  });
});

