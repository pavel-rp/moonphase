import { TradingActivity } from '@/domain/tradingActivity';
import { TradingActivityPort } from '@/ports/TradingActivityPort';

type Dependencies = {
  tradingActivity: TradingActivityPort;
};

export async function getTradingActivity(
  deps: Dependencies,
  symbol: string
): Promise<TradingActivity> {
  return deps.tradingActivity.getBySymbol(symbol);
}