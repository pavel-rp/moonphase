import { BinanceAdapter } from '@/adapters/binance/BinanceAdapter';

const binance = new BinanceAdapter();

function toBinanceSymbol(symbol: string): string {
  // Map CoinCap symbols (e.g., BTC) to Binance trading pairs (e.g., BTCUSDT)
  return `${symbol.toUpperCase()}USDT`;
}

export async function fetchPrices(symbol: string) {
  const pair = toBinanceSymbol(symbol);
  const candles = await binance.getDailyCandles(pair, 60);
  return candles.map((c) => c.close);
}

export async function fetchVWAP(symbol: string) {
  const pair = toBinanceSymbol(symbol);
  return binance.get24HrStats(pair);
}
