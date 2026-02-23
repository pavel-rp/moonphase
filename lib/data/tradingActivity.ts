import { TradingActivity } from '@/domain/tradingActivity';
import { getTradingActivity as _getTradingActivity } from '@/usecases/getTradingActivity';
import { tradingActivityDeps } from '@/compositionRoot';

export type { TradingActivity };

export async function fetchTradingActivity(symbol: string): Promise<TradingActivity> {
  return _getTradingActivity(tradingActivityDeps, symbol);
}