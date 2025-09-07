import { MarketData } from '@/domain/marketData';
import { MarketDataPort } from '@/ports/MarketDataPort';

export async function getMarketData(
  deps: { marketData: MarketDataPort },
  symbol: string,
): Promise<MarketData> {
  return deps.marketData.getBySymbol(symbol);
}

