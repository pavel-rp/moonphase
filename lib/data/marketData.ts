import { MarketData } from '@/domain/marketData';
import { getMarketData as _getMarketData } from '@/usecases/getMarketData';
import { marketDataDeps } from '@/compositionRoot';

export type { MarketData };

export async function fetchMarketData(symbol: string): Promise<MarketData> {
  return _getMarketData(marketDataDeps, symbol);
}

