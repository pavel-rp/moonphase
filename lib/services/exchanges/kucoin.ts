import axios from 'axios';
import { PriceDataProvider, SparklineData, PricePoint } from '@/lib/types/price-data';

export class KucoinProvider implements PriceDataProvider {
  public readonly name = 'kucoin';
  private readonly baseUrl = 'https://api.kucoin.com';
  private readonly rateLimit = 1000; // 1 second between requests
  private lastRequestTime = 0;

  async fetchSparklineData(symbol: string, period: string = '24h'): Promise<SparklineData> {
    await this.waitForRateLimit();
    
    const formattedSymbol = this.formatSymbol(symbol);
    const type = this.getTypeFromPeriod(period);
    
    try {
      const endAt = Math.floor(Date.now() / 1000);
      const startAt = endAt - this.getPeriodSeconds(period);
      
      const response = await axios.get(`${this.baseUrl}/api/v1/market/candles`, {
        params: {
          symbol: formattedSymbol,
          type: type,
          startAt: startAt,
          endAt: endAt,
        },
        timeout: 10000,
      });

      if (response.data.code !== '200000') {
        throw new Error(`KuCoin API error: ${response.data.msg}`);
      }

      const candles = response.data.data;
      const prices = candles.map((candle: any[]) => parseFloat(candle[4])); // Close prices
      const timestamps = candles.map((candle: any[]) => parseInt(candle[0]) * 1000); // Convert to milliseconds
      
      const firstPrice = prices[prices.length - 1]; // KuCoin returns in reverse order
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
      console.error(`KuCoin API error for ${symbol}:`, error);
      throw new Error(`Failed to fetch KuCoin data for ${symbol}`);
    }
  }

  async fetchKlineData(symbol: string, interval: string, limit: number = 100): Promise<PricePoint[]> {
    await this.waitForRateLimit();
    
    const formattedSymbol = this.formatSymbol(symbol);
    const type = this.mapIntervalToKucoin(interval);
    
    try {
      const endAt = Math.floor(Date.now() / 1000);
      const intervalSeconds = this.getIntervalSeconds(interval);
      const startAt = endAt - (limit * intervalSeconds);
      
      const response = await axios.get(`${this.baseUrl}/api/v1/market/candles`, {
        params: {
          symbol: formattedSymbol,
          type: type,
          startAt: startAt,
          endAt: endAt,
        },
        timeout: 10000,
      });

      if (response.data.code !== '200000') {
        throw new Error(`KuCoin API error: ${response.data.msg}`);
      }

      const candles = response.data.data;
      
      return candles.map((candle: any[]) => ({
        timestamp: parseInt(candle[0]) * 1000, // Convert to milliseconds
        open: parseFloat(candle[1]),
        close: parseFloat(candle[2]),
        high: parseFloat(candle[3]),
        low: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
      })).reverse(); // KuCoin returns in reverse chronological order
    } catch (error) {
      console.error(`KuCoin API error for ${symbol}:`, error);
      throw new Error(`Failed to fetch KuCoin kline data for ${symbol}`);
    }
  }

  isAvailable(): boolean {
    return true; // KuCoin public API is generally available
  }

  private formatSymbol(symbol: string): string {
    // Convert symbol to KuCoin format (e.g., BTC -> BTC-USDT)
    if (symbol.includes('-')) {
      return symbol.toUpperCase();
    }
    return `${symbol.toUpperCase()}-USDT`;
  }

  private getTypeFromPeriod(period: string): string {
    switch (period) {
      case '1h': return '1min';
      case '24h': return '15min';
      case '7d': return '1hour';
      case '30d': return '4hour';
      default: return '15min';
    }
  }

  private getPeriodSeconds(period: string): number {
    switch (period) {
      case '1h': return 60 * 60;
      case '24h': return 24 * 60 * 60;
      case '7d': return 7 * 24 * 60 * 60;
      case '30d': return 30 * 24 * 60 * 60;
      default: return 24 * 60 * 60;
    }
  }

  private mapIntervalToKucoin(interval: string): string {
    const mapping: { [key: string]: string } = {
      '1m': '1min',
      '5m': '5min',
      '15m': '15min',
      '1h': '1hour',
      '4h': '4hour',
      '1d': '1day',
    };
    return mapping[interval] || '1hour';
  }

  private getIntervalSeconds(interval: string): number {
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