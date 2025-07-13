import axios from 'axios';
import { PriceDataProvider, SparklineData, PricePoint } from '@/lib/types/price-data';

export class BinanceProviderRSC implements PriceDataProvider {
  public readonly name = 'binance';
  private readonly baseUrl = 'https://api.binance.com';

  async fetchSparklineData(symbol: string, period: string = '24h'): Promise<SparklineData> {
    const formattedSymbol = this.formatSymbol(symbol);
    const interval = this.getIntervalFromPeriod(period);
    const limit = this.getLimitFromPeriod(period);
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/klines`, {
        params: {
          symbol: formattedSymbol,
          interval: interval,
          limit: limit,
        },
        timeout: 8000, // Reduced timeout for server components
      });

      const klines = response.data;
      const prices = klines.map((kline: any[]) => parseFloat(kline[4])); // Close prices
      const timestamps = klines.map((kline: any[]) => kline[0]); // Timestamps
      
      const firstPrice = prices[0];
      const lastPrice = prices[prices.length - 1];
      const change24h = lastPrice - firstPrice;
      const changePercent24h = (change24h / firstPrice) * 100;

      return {
        symbol,
        prices,
        timestamps,
        change24h,
        changePercent24h,
      };
    } catch (error) {
      throw new Error(`Failed to fetch Binance data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchKlineData(symbol: string, interval: string, limit: number = 100): Promise<PricePoint[]> {
    const formattedSymbol = this.formatSymbol(symbol);
    const binanceInterval = this.mapIntervalToBinance(interval);
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/klines`, {
        params: {
          symbol: formattedSymbol,
          interval: binanceInterval,
          limit: Math.min(limit, 1000), // Binance max is 1000
        },
        timeout: 8000, // Reduced timeout for server components
      });

      const klines = response.data;
      
      return klines.map((kline: any[]) => ({
        timestamp: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch Binance kline data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isAvailable(): boolean {
    return true; // Binance public API is generally available
  }

  private formatSymbol(symbol: string): string {
    // Convert symbol to Binance format (e.g., BTC -> BTCUSDT)
    if (symbol.includes('USDT')) {
      return symbol.toUpperCase();
    }
    return `${symbol.toUpperCase()}USDT`;
  }

  private getIntervalFromPeriod(period: string): string {
    switch (period) {
      case '1h': return '1m';
      case '24h': return '15m';
      case '7d': return '1h';
      case '30d': return '4h';
      default: return '15m';
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

  private mapIntervalToBinance(interval: string): string {
    const mapping: { [key: string]: string } = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
    };
    return mapping[interval] || '1h';
  }
}