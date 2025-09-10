import { TradingActivity } from '@/domain/tradingActivity';
import { TradingActivityPort } from '@/ports/TradingActivityPort';

/**
 * Mock adapter returning deterministic TradingActivity for UI development.
 */
export class MockTradingActivityAdapter implements TradingActivityPort {
  async getBySymbol(symbol: string): Promise<TradingActivity> {
    const upper = symbol.toUpperCase();
    
    // Provide some hardcoded values per symbol with reasonable defaults
    if (upper === 'BTC') {
      return {
        symbol: 'BTC',
        volume24hUsd: 22_000_000_000, // $22B
        liquidityScore: 95,
        topExchanges: [
          { name: 'Binance', percentage: 48 },
          { name: 'Coinbase', percentage: 28 },
          { name: 'Kraken', percentage: 24 },
        ],
        cexDexSplit: {
          cex: 85,
          dex: 15,
        },
      };
    }

    if (upper === 'ETH') {
      return {
        symbol: 'ETH',
        volume24hUsd: 18_500_000_000, // $18.5B
        liquidityScore: 87,
        topExchanges: [
          { name: 'Uniswap', percentage: 42 },
          { name: 'Binance', percentage: 35 },
          { name: 'Coinbase', percentage: 23 },
        ],
        cexDexSplit: {
          cex: 60,
          dex: 40,
        },
      };
    }

    // Fallback generic mock
    return {
      symbol: upper,
      volume24hUsd: 1_200_000_000, // $1.2B
      liquidityScore: 72,
      topExchanges: [
        { name: 'Binance', percentage: 52 },
        { name: 'Gate.io', percentage: 31 },
        { name: 'KuCoin', percentage: 17 },
      ],
      cexDexSplit: {
        cex: 78,
        dex: 22,
      },
    };
  }
}