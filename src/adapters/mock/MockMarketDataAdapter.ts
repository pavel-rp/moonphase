import { MarketData } from '@/domain/marketData';
import { MarketDataPort } from '@/ports/MarketDataPort';

/**
 * Mock adapter returning deterministic MarketData for UI development.
 */
export class MockMarketDataAdapter implements MarketDataPort {
  async getBySymbol(symbol: string): Promise<MarketData> {
    const upper = symbol.toUpperCase();
    // Provide some hardcoded values per symbol with reasonable defaults
    if (upper === 'BTC') {
      return {
        symbol: 'BTC',
        marketCapUsd: 2_300_000_000_000, // $2.3T
        circulatingSupply: 20_000_000, // 20M BTC
        maxSupply: 21_000_000, // 21M BTC
        vwap24hUsd: 112_197,
        dominancePercent: 52,
      };
    }

    if (upper === 'ETH') {
      return {
        symbol: 'ETH',
        marketCapUsd: 1_100_000_000_000,
        circulatingSupply: 120_000_000,
        maxSupply: null,
        vwap24hUsd: 3_600,
        dominancePercent: 17,
      };
    }

    // Fallback generic mock
    return {
      symbol: upper,
      marketCapUsd: 100_000_000_000,
      circulatingSupply: 500_000_000,
      maxSupply: null,
      vwap24hUsd: 100,
      dominancePercent: 1.2,
    };
  }
}

