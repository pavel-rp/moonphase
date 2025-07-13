export interface PricePoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SparklineData {
  symbol: string;
  prices: number[];
  timestamps: number[];
  change24h: number;
  changePercent24h: number;
}

export interface ExchangeConfig {
  name: string;
  baseUrl: string;
  rateLimit: number; // milliseconds between requests
  symbolFormat: (symbol: string) => string;
}

export interface PriceDataProvider {
  name: string;
  fetchSparklineData(symbol: string, period?: string): Promise<SparklineData>;
  fetchKlineData(symbol: string, interval: string, limit?: number): Promise<PricePoint[]>;
  isAvailable(): boolean;
}

export type Exchange = 'binance' | 'bybit' | 'coinbase' | 'kraken' | 'kucoin';

export interface PriceDataOptions {
  period?: '1h' | '24h' | '7d' | '30d';
  interval?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  limit?: number;
  preferredExchange?: Exchange;
}