import { TradingActivity } from '@/domain/tradingActivity';

/**
 * Port for fetching per-symbol trading activity (volume, liquidity, exchanges, CEX/DEX split).
 *
 * Currently backed by {@link MockTradingActivityAdapter} which returns deterministic
 * data for UI development. A real adapter (e.g. CoinGecko or aggregated exchange APIs)
 * can be swapped in via the composition root without changing downstream use cases.
 */
export interface TradingActivityPort {
  getBySymbol(symbol: string): Promise<TradingActivity>;
}