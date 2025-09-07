import { MarketData } from '@/domain/marketData';

export interface MarketDataPort {
  getBySymbol(symbol: string): Promise<MarketData>;
}

