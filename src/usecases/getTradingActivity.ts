import { TradingActivity } from '@/domain/tradingActivity';
import { TradingActivityPort } from '@/ports/TradingActivityPort';

type Dependencies = {
  tradingActivity: TradingActivityPort;
};

/**
 * Usecase for fetching trading activity by symbol.
 *
 * Currently a passthrough to the port — business logic (validation, caching,
 * enrichment) will be added here when a real adapter replaces the mock.
 */
export async function getTradingActivity(
  deps: Dependencies,
  symbol: string
): Promise<TradingActivity> {
  return deps.tradingActivity.getBySymbol(symbol);
}