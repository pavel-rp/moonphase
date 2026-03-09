import { MarketData } from '@/domain/marketData';
import { MarketDataPort } from '@/ports/MarketDataPort';

/**
 * Usecase for fetching market data by symbol.
 *
 * Currently a passthrough to the port — business logic (validation, caching,
 * enrichment) will be added here when a real adapter replaces the mock.
 */
export async function getMarketData(
  deps: { marketData: MarketDataPort },
  symbol: string,
): Promise<MarketData> {
  return deps.marketData.getBySymbol(symbol);
}

