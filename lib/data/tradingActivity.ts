import { TradingActivity } from '@/domain/tradingActivity';
import { getTradingActivity as _getTradingActivity } from '@/usecases/getTradingActivity';
import { MockTradingActivityAdapter } from '@/adapters/mock/MockTradingActivityAdapter';

export type { TradingActivity };

export async function fetchTradingActivity(symbol: string): Promise<TradingActivity> {
  return _getTradingActivity({ tradingActivity: new MockTradingActivityAdapter() }, symbol);
}