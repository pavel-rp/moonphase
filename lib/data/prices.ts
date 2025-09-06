import { BinanceAdapter } from '@/adapters/binance/BinanceAdapter';
import { generateRandomWalk } from '../utils/random-walk';

const binance = new BinanceAdapter();

function toBinanceSymbol(symbol: string): string {
  // Map CoinCap symbols (e.g., BTC) to Binance trading pairs (e.g., BTCUSDT)
  return `${symbol.toUpperCase()}USDT`;
}

export async function fetchPrices(symbol: string) {
  const pair = toBinanceSymbol(symbol);
  try {
    const candles = await binance.getDailyCandles(pair, 60);
    return candles.map((c) => c.close);
  } catch (err) {
    // Fallback to synthetic data to keep UI responsive during upstream errors
    return generateRandomWalk({ length: 60, S0: 1, mu: 0, sigma: 0.03 });
  }
}

export async function fetchVWAP(symbol: string) {
  const pair = toBinanceSymbol(symbol);
  try {
    return await binance.get24HrStats(pair);
  } catch (err) {
    return 0;
  }
}
