import { PriceDataProvider, SparklineData, PricePoint, Exchange, PriceDataOptions } from '@/lib/types/price-data';
import { BinanceProviderRSC } from './exchanges/binance-rsc';
import { BybitProvider } from './exchanges/bybit';
import { CoinbaseProvider } from './exchanges/coinbase';
import { KrakenProvider } from './exchanges/kraken';
import { KucoinProvider } from './exchanges/kucoin';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// RSC-compatible price data service with proper caching
export class PriceDataServiceRSC {
  private providers: Map<Exchange, PriceDataProvider> = new Map();
  private fallbackOrder: Exchange[] = ['binance', 'bybit', 'coinbase', 'kraken', 'kucoin'];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    this.providers.set('binance', new BinanceProviderRSC());
    this.providers.set('bybit', new BybitProvider());
    this.providers.set('coinbase', new CoinbaseProvider());
    this.providers.set('kraken', new KrakenProvider());
    this.providers.set('kucoin', new KucoinProvider());
  }

  // Cached version of getSparklineData for RSC
  private getSparklineDataCached = cache(async (symbol: string, options: PriceDataOptions = {}): Promise<SparklineData> => {
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
      if (preferredExchange && exchange === preferredExchange) continue;
      
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
  });

  // Public method that uses Next.js unstable_cache for server-side caching
  async getSparklineData(symbol: string, options: PriceDataOptions = {}): Promise<SparklineData> {
    const cacheKey = `sparkline-${symbol}-${JSON.stringify(options)}`;
    
    const cachedFetch = unstable_cache(
      async () => this.getSparklineDataCached(symbol, options),
      [cacheKey],
      {
        revalidate: 60, // Cache for 1 minute
        tags: [`sparkline-${symbol}`],
      }
    );

    return cachedFetch();
  }

  // Cached version of getKlineData for RSC
  private getKlineDataCached = cache(async (symbol: string, options: PriceDataOptions = {}): Promise<PricePoint[]> => {
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
      if (preferredExchange && exchange === preferredExchange) continue;
      
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
  });

  // Public method that uses Next.js unstable_cache for server-side caching
  async getKlineData(symbol: string, options: PriceDataOptions = {}): Promise<PricePoint[]> {
    const cacheKey = `kline-${symbol}-${JSON.stringify(options)}`;
    
    const cachedFetch = unstable_cache(
      async () => this.getKlineDataCached(symbol, options),
      [cacheKey],
      {
        revalidate: 300, // Cache for 5 minutes
        tags: [`kline-${symbol}`],
      }
    );

    return cachedFetch();
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

// Singleton instance for RSC
export const priceDataServiceRSC = new PriceDataServiceRSC();

// Server-side function to get sparkline data with proper error handling
export async function getSparklineDataRSC(symbol: string, options: PriceDataOptions = {}): Promise<SparklineData | null> {
  try {
    return await priceDataServiceRSC.getSparklineData(symbol, options);
  } catch (error) {
    console.error(`RSC: Failed to fetch sparkline data for ${symbol}:`, error);
    return null;
  }
}

// Server-side function to get kline data with proper error handling
export async function getKlineDataRSC(symbol: string, options: PriceDataOptions = {}): Promise<PricePoint[] | null> {
  try {
    return await priceDataServiceRSC.getKlineData(symbol, options);
  } catch (error) {
    console.error(`RSC: Failed to fetch kline data for ${symbol}:`, error);
    return null;
  }
}