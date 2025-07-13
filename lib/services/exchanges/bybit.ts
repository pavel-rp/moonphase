import axios from 'axios';
import { PriceDataProvider, SparklineData, PricePoint } from '@/lib/types/price-data';

export class BybitProvider implements PriceDataProvider {
  public readonly name = 'bybit';
  private readonly baseUrl = 'https://api.bybit.com';
  private readonly rateLimit = 1000; // 1 second between requests
  private lastRequestTime = 0;

  async fetchSparklineData(symbol: string, period: string = '24h'): Promise<SparklineData> {
    await this.waitForRateLimit();
    
    const formattedSymbol = this.formatSymbol(symbol);
    const interval = this.getIntervalFromPeriod(period);
    const limit = this.getLimitFromPeriod(period);
    
    try {
      const response = await axios.get(`${this.baseUrl}/v5/market/kline`, {
        params: {
          category: 'spot',
          symbol: formattedSymbol,
          interval: interval,
          limit: limit,
        },
        timeout: 10000,
      });

      if (response.data.retCode !== 0) {
        throw new Error(`Bybit API error: ${response.data.retMsg}`);
      }

      const klines = response.data.result.list;
      const prices = klines.map((kline: any[]) => parseFloat(kline[4])); // Close prices
      const timestamps = klines.map((kline: any[]) => parseInt(kline[0])); // Timestamps
      
      const firstPrice = prices[0];
      const lastPrice = prices[prices.length - 1];
      const change24h = lastPrice - firstPrice;
      const changePercent24h = (change24h / firstPrice) * 100;

      return {
        symbol,
        prices: prices.reverse(), // Bybit returns in reverse chronological order
        timestamps: timestamps.reverse(),
        change24h,
        changePercent24h,
      };
    } catch (error) {
      console.error(`Bybit API error for ${symbol}:`, error);
      throw new Error(`Failed to fetch Bybit data for ${symbol}`);
    }
  }

  async fetchKlineData(symbol: string, interval: string, limit: number = 100): Promise<PricePoint[]> {
    await this.waitForRateLimit();
    
    const formattedSymbol = this.formatSymbol(symbol);
    const bybitInterval = this.mapIntervalToBybit(interval);
    
    try {
      const response = await axios.get(`${this.baseUrl}/v5/market/kline`, {
        params: {
          category: 'spot',
          symbol: formattedSymbol,
          interval: bybitInterval,
          limit: Math.min(limit, 1000), // Bybit max is 1000
        },
        timeout: 10000,
      });

      if (response.data.retCode !== 0) {
        throw new Error(`Bybit API error: ${response.data.retMsg}`);
      }

      const klines = response.data.result.list;
      
      return klines.map((kline: any[]) => ({
        timestamp: parseInt(kline[0]),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
      })).reverse(); // Bybit returns in reverse chronological order
    } catch (error) {
      console.error(`Bybit API error for ${symbol}:`, error);
      throw new Error(`Failed to fetch Bybit kline data for ${symbol}`);
    }
  }

  isAvailable(): boolean {
    return true; // Bybit public API is generally available
  }

  private formatSymbol(symbol: string): string {
    // Convert symbol to Bybit format (e.g., BTC -> BTCUSDT)
    if (symbol.includes('USDT')) {
      return symbol.toUpperCase();
    }
    return `${symbol.toUpperCase()}USDT`;
  }

  private getIntervalFromPeriod(period: string): string {
    switch (period) {
      case '1h': return '1';
      case '24h': return '15';
      case '7d': return '60';
      case '30d': return '240';
      default: return '15';
    }
  }

  private getLimitFromPeriod(period: string): number {
    switch (period) {
      case '1h': return 60; // 60 minutes
      case '24h': return 96; // 24 hours * 4 (15-minute intervals)
      case '7d': return 168; // 7 days * 24 hours
      case '30d': return 180; // 30 days * 6 (4-hour intervals)
      default: return 96;
    }
  }

  private mapIntervalToBybit(interval: string): string {
    const mapping: { [key: string]: string } = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '1h': '60',
      '4h': '240',
      '1d': 'D',
    };
    return mapping[interval] || '60';
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