import axios from 'axios';
import { PriceDataProvider, SparklineData, PricePoint } from '@/lib/types/price-data';

export class CoinbaseProvider implements PriceDataProvider {
  public readonly name = 'coinbase';
  private readonly baseUrl = 'https://api.exchange.coinbase.com';
  private readonly rateLimit = 1000; // 1 second between requests
  private lastRequestTime = 0;

  async fetchSparklineData(symbol: string, period: string = '24h'): Promise<SparklineData> {
    await this.waitForRateLimit();
    
    const formattedSymbol = this.formatSymbol(symbol);
    const granularity = this.getGranularityFromPeriod(period);
    
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - this.getPeriodMs(period));
      
      const response = await axios.get(`${this.baseUrl}/products/${formattedSymbol}/candles`, {
        params: {
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          granularity: granularity,
        },
        timeout: 10000,
      });

      const candles = response.data;
      const prices = candles.map((candle: any[]) => candle[4]); // Close prices
      const timestamps = candles.map((candle: any[]) => candle[0] * 1000); // Convert to milliseconds
      
      const firstPrice = prices[prices.length - 1]; // Coinbase returns in reverse order
      const lastPrice = prices[0];
      const change24h = lastPrice - firstPrice;
      const changePercent24h = (change24h / firstPrice) * 100;

      return {
        symbol,
        prices: prices.reverse(), // Reverse to get chronological order
        timestamps: timestamps.reverse(),
        change24h,
        changePercent24h,
      };
    } catch (error) {
      console.error(`Coinbase API error for ${symbol}:`, error);
      throw new Error(`Failed to fetch Coinbase data for ${symbol}`);
    }
  }

  async fetchKlineData(symbol: string, interval: string, limit: number = 100): Promise<PricePoint[]> {
    await this.waitForRateLimit();
    
    const formattedSymbol = this.formatSymbol(symbol);
    const granularity = this.mapIntervalToGranularity(interval);
    
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - (limit * granularity * 1000));
      
      const response = await axios.get(`${this.baseUrl}/products/${formattedSymbol}/candles`, {
        params: {
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          granularity: granularity,
        },
        timeout: 10000,
      });

      const candles = response.data;
      
      return candles.map((candle: any[]) => ({
        timestamp: candle[0] * 1000, // Convert to milliseconds
        low: candle[1],
        high: candle[2],
        open: candle[3],
        close: candle[4],
        volume: candle[5],
      })).reverse(); // Coinbase returns in reverse chronological order
    } catch (error) {
      console.error(`Coinbase API error for ${symbol}:`, error);
      throw new Error(`Failed to fetch Coinbase kline data for ${symbol}`);
    }
  }

  isAvailable(): boolean {
    return true; // Coinbase public API is generally available
  }

  private formatSymbol(symbol: string): string {
    // Convert symbol to Coinbase format (e.g., BTC -> BTC-USD)
    if (symbol.includes('-')) {
      return symbol.toUpperCase();
    }
    return `${symbol.toUpperCase()}-USD`;
  }

  private getGranularityFromPeriod(period: string): number {
    switch (period) {
      case '1h': return 60; // 1 minute
      case '24h': return 900; // 15 minutes
      case '7d': return 3600; // 1 hour
      case '30d': return 14400; // 4 hours
      default: return 900;
    }
  }

  private getPeriodMs(period: string): number {
    switch (period) {
      case '1h': return 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  private mapIntervalToGranularity(interval: string): number {
    const mapping: { [key: string]: number } = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400,
    };
    return mapping[interval] || 3600;
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimit) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimit - timeSinceLastRequest));
    }
    
    this.lastRequestTime = Date.now();
  }
}