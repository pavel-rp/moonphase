import { MarketData } from '@/domain/marketData';
import { getMarketData as _getMarketData } from '@/usecases/getMarketData';
import { MockMarketDataAdapter } from '@/adapters/mock/MockMarketDataAdapter';

export type { MarketData };

export async function fetchMarketData(symbol: string): Promise<MarketData> {
  return _getMarketData({ marketData: new MockMarketDataAdapter() }, symbol);
}

