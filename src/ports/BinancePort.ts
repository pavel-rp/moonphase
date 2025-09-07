export interface Candlestick {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface BinancePort {
  /**
   * Returns 24h weighted average price (VWAP) for the given symbol.
   * Symbol format follows Binance, e.g., "BTCUSDT".
   */
  get24HrStats(symbol: string): Promise<number>;

  /**
   * Returns daily OHLCV candles (interval = 1d) for the given symbol.
   * Optional limit can be provided to cap the number of candles.
   */
  getDailyCandles(symbol: string, limit?: number): Promise<Candlestick[]>;
}

