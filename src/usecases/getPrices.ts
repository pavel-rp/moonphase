import { BinancePort, Candlestick } from '@/ports/BinancePort';

/**
 * Fetches historical daily candlestick data for a given symbol.
 * Returns an array of candlesticks limited by the optional limit parameter.
 */
export async function getPriceHistory(
  deps: { binance: BinancePort },
  params: { symbol: string; limit?: number },
): Promise<Candlestick[]> {
  const { symbol, limit } = params;
  return deps.binance.getDailyCandles(symbol, limit);
}

/**
 * Fetches the 24-hour volume-weighted average price (VWAP) for a given symbol.
 */
export async function getVWAP(
  deps: { binance: BinancePort },
  symbol: string,
): Promise<number> {
  return deps.binance.get24HrStats(symbol);
}
