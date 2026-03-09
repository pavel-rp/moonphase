/**
 * Centralised symbol lookups — single source of truth for
 * Binance trading-pair mapping and human-readable display names.
 */

const BINANCE_PAIRS: Record<string, string> = {
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
};

const DISPLAY_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  BNB: 'BNB',
  SOL: 'Solana',
  XRP: 'Ripple',
  ADA: 'Cardano',
  DOGE: 'Dogecoin',
  AVAX: 'Avalanche',
  DOT: 'Polkadot',
  MATIC: 'Polygon',
  LINK: 'Chainlink',
};

/** Returns the Binance trading pair for a symbol (e.g. `BTC` → `BTCUSDT`). */
export function toBinancePair(symbol: string): string {
  const upper = symbol.toUpperCase();
  return BINANCE_PAIRS[upper] ?? `${upper}USDT`;
}

/** Returns the human-readable name for a symbol (e.g. `BTC` → `Bitcoin`). */
export function toDisplayName(symbol: string): string {
  const upper = symbol.toUpperCase();
  return DISPLAY_NAMES[upper] ?? upper;
}
