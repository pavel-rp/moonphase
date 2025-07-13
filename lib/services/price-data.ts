import { PriceDataProvider, SparklineData, PricePoint, Exchange, PriceDataOptions } from '@/lib/types/price-data';
import { BinanceProvider } from './exchanges/binance';
import { BybitProvider } from './exchanges/bybit';
import { CoinbaseProvider } from './exchanges/coinbase';
import { KrakenProvider } from './exchanges/kraken';
import { KucoinProvider } from './exchanges/kucoin';

export class PriceDataService {
  private providers: Map<Exchange, PriceDataProvider> = new Map();
  private fallbackOrder: Exchange[] = ['binance', 'bybit', 'coinbase', 'kraken', 'kucoin'];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    this.providers.set('binance', new BinanceProvider());
    this.providers.set('bybit', new BybitProvider());
    this.providers.set('coinbase', new CoinbaseProvider());
    this.providers.set('kraken', new KrakenProvider());
    this.providers.set('kucoin', new KucoinProvider());
  }

  async getSparklineData(symbol: string, options: PriceDataOptions = {}): Promise<SparklineData> {
    const { period = '24h', preferredExchange } = options;
    
    // Try preferred exchange first
    if (preferredExchange && this.providers.has(preferredExchange)) {
      const provider = this.providers.get(preferredExchange)!;
      if (provider.isAvailable()) {
        try {
          return await provider.fetchSparklineData(symbol, period);
        } catch (error) {
          console.warn(`Failed to fetch from ${preferredExchange}:`, error);
        }
      }
    }

    // Try fallback providers
    for (const exchange of this.fallbackOrder) {
      if (preferredExchange && exchange === preferredExchange) continue; // Skip if already tried
      
      const provider = this.providers.get(exchange);
      if (provider && provider.isAvailable()) {
        try {
          return await provider.fetchSparklineData(symbol, period);
        } catch (error) {
          console.warn(`Failed to fetch from ${exchange}:`, error);
          continue;
        }
      }
    }

    throw new Error(`Unable to fetch sparkline data for ${symbol} from any exchange`);
  }

  async getKlineData(symbol: string, options: PriceDataOptions = {}): Promise<PricePoint[]> {
    const { interval = '1h', limit = 100, preferredExchange } = options;
    
    // Try preferred exchange first
    if (preferredExchange && this.providers.has(preferredExchange)) {
      const provider = this.providers.get(preferredExchange)!;
      if (provider.isAvailable()) {
        try {
          return await provider.fetchKlineData(symbol, interval, limit);
        } catch (error) {
          console.warn(`Failed to fetch from ${preferredExchange}:`, error);
        }
      }
    }

    // Try fallback providers
    for (const exchange of this.fallbackOrder) {
      if (preferredExchange && exchange === preferredExchange) continue; // Skip if already tried
      
      const provider = this.providers.get(exchange);
      if (provider && provider.isAvailable()) {
        try {
          return await provider.fetchKlineData(symbol, interval, limit);
        } catch (error) {
          console.warn(`Failed to fetch from ${exchange}:`, error);
          continue;
        }
      }
    }

    throw new Error(`Unable to fetch kline data for ${symbol} from any exchange`);
  }

  getAvailableExchanges(): Exchange[] {
    return Array.from(this.providers.keys()).filter(exchange => 
      this.providers.get(exchange)?.isAvailable() || false
    );
  }

  isExchangeAvailable(exchange: Exchange): boolean {
    return this.providers.get(exchange)?.isAvailable() || false;
  }
}

// Singleton instance
export const priceDataService = new PriceDataService();