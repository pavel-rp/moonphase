export interface Candlestick {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface BinanceRequestOptions {
  /**
   * Cancels the request, e.g. when the client that needs it disconnects. An
   * aborted call rejects with the signal's reason. Concurrent identical
   * requests share one upstream fetch, which is cancelled only once every
   * caller sharing it has aborted.
   */
  signal?: AbortSignal;
}

export interface BinancePort {
  /**
   * Returns 24h weighted average price (VWAP) for the given symbol.
   * Symbol format follows Binance, e.g., "BTCUSDT".
   */
  get24HrStats(symbol: string, opts?: BinanceRequestOptions): Promise<number>;

  /**
   * Returns daily OHLCV candles (interval = 1d) for the given symbol.
   * Optional limit can be provided to cap the number of candles.
   */
  getDailyCandles(symbol: string, limit?: number, opts?: BinanceRequestOptions): Promise<Candlestick[]>;
}

