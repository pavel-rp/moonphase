import { TradingActivity } from '@/domain/tradingActivity';

export interface TradingActivityPort {
  getBySymbol(symbol: string): Promise<TradingActivity>;
}