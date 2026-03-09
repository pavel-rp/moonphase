import { MarketData } from '@/domain/marketData';

/**
 * Port for fetching per-symbol market data (market cap, supply, VWAP, dominance).
 *
 * Currently backed by {@link MockMarketDataAdapter} which returns deterministic
 * data for UI development. A real adapter (e.g. CoinGecko or CoinCap v3) can be
 * swapped in via the composition root without changing downstream use cases.
 */
export interface MarketDataPort {
  getBySymbol(symbol: string): Promise<MarketData>;
}

