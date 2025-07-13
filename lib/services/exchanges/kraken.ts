import axios from 'axios';
import { PriceDataProvider, SparklineData, PricePoint } from '@/lib/types/price-data';

export class KrakenProvider implements PriceDataProvider {
  public readonly name = 'kraken';
  private readonly baseUrl = 'https://api.kraken.com';
  private readonly rateLimit = 1000; // 1 second between requests
  private lastRequestTime = 0;

  async fetchSparklineData(symbol: string, period: string = '24h'): Promise<SparklineData> {
    await this.waitForRateLimit();
    
    const formattedSymbol = this.formatSymbol(symbol);
    const interval = this.getIntervalFromPeriod(period);
    
    try {
      const response = await axios.get(`${this.baseUrl}/0/public/OHLC`, {
        params: {
          pair: formattedSymbol,
          interval: interval,
        },
        timeout: 10000,
      });

      if (response.data.error && response.data.error.length > 0) {
        throw new Error(`Kraken API error: ${response.data.error.join(', ')}`);
      }

      const pairKey = Object.keys(response.data.result)[0];
      const ohlcData = response.data.result[pairKey];
      
      const prices = ohlcData.map((candle: any[]) => parseFloat(candle[4])); // Close prices
      const timestamps = ohlcData.map((candle: any[]) => parseInt(candle[0]) * 1000); // Convert to milliseconds
      
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
      console.error(`Kraken API error for ${symbol}:`, error);
      throw new Error(`Failed to fetch Kraken data for ${symbol}`);
    }
  }

  async fetchKlineData(symbol: string, interval: string, limit: number = 100): Promise<PricePoint[]> {
    await this.waitForRateLimit();
    
    const formattedSymbol = this.formatSymbol(symbol);
    const krakenInterval = this.mapIntervalToKraken(interval);
    
    try {
      const response = await axios.get(`${this.baseUrl}/0/public/OHLC`, {
        params: {
          pair: formattedSymbol,
          interval: krakenInterval,
        },
        timeout: 10000,
      });

      if (response.data.error && response.data.error.length > 0) {
        throw new Error(`Kraken API error: ${response.data.error.join(', ')}`);
      }

      const pairKey = Object.keys(response.data.result)[0];
      const ohlcData = response.data.result[pairKey];
      
      // Limit the results to the requested amount
      const limitedData = ohlcData.slice(-limit);
      
      return limitedData.map((candle: any[]) => ({
        timestamp: parseInt(candle[0]) * 1000, // Convert to milliseconds
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[6]),
      }));
    } catch (error) {
      console.error(`Kraken API error for ${symbol}:`, error);
      throw new Error(`Failed to fetch Kraken kline data for ${symbol}`);
    }
  }

  isAvailable(): boolean {
    return true; // Kraken public API is generally available
  }

  private formatSymbol(symbol: string): string {
    // Convert symbol to Kraken format (e.g., BTC -> XBTUSD)
    const krakenSymbolMap: { [key: string]: string } = {
      'BTC': 'XBTUSD',
      'ETH': 'ETHUSD',
      'ADA': 'ADAUSD',
      'DOT': 'DOTUSD',
      'SOL': 'SOLUSD',
      'AVAX': 'AVAXUSD',
      'MATIC': 'MATICUSD',
      'LINK': 'LINKUSD',
      'UNI': 'UNIUSD',
      'LTC': 'LTCUSD',
      'XRP': 'XRPUSD',
      'DOGE': 'DOGEUSD',
      'SHIB': 'SHIBUSD',
      'TRX': 'TRXUSD',
      'BNB': 'BNBUSD',
    };
    
    return krakenSymbolMap[symbol.toUpperCase()] || `${symbol.toUpperCase()}USD`;
  }

  private getIntervalFromPeriod(period: string): number {
    switch (period) {
      case '1h': return 1; // 1 minute
      case '24h': return 15; // 15 minutes
      case '7d': return 60; // 1 hour
      case '30d': return 240; // 4 hours
      default: return 15;
    }
  }

  private mapIntervalToKraken(interval: string): number {
    const mapping: { [key: string]: number } = {
      '1m': 1,
      '5m': 5,
      '15m': 15,
      '1h': 60,
      '4h': 240,
      '1d': 1440,
    };
    return mapping[interval] || 60;
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