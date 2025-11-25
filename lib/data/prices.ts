import { BinanceAdapter } from '@/adapters/binance/BinanceAdapter';
import { getPriceHistory, getVWAP } from '@/usecases/getPrices';

// Explicit mapping table for known symbols; defaults to USDT pair otherwise
const BINANCE_PAIR_MAP: Record<string, string> = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  SOL: 'SOLUSDT',
  BNB: 'BNBUSDT',
  XRP: 'XRPUSDT',
  DOGE: 'DOGEUSDT',
  ADA: 'ADAUSDT',
  AVAX: 'AVAXUSDT',
  LINK: 'LINKUSDT',
  TON: 'TONUSDT',
  TEST: 'TESTUSDT',
};

function toBinanceSymbol(symbol: string): string {
  const upper = symbol.toUpperCase();
  return BINANCE_PAIR_MAP[upper] ?? `${upper}USDT`;
}

export async function fetchPrices(symbol: string) {
  const pair = toBinanceSymbol(symbol);
  const candles = await getPriceHistory(
    { binance: new BinanceAdapter() },
    { symbol: pair, limit: 60 },
  );
  return candles.map((c) => c.close);
}

export async function fetchVWAP(symbol: string) {
  const pair = toBinanceSymbol(symbol);
  return getVWAP({ binance: new BinanceAdapter() }, pair);
}
