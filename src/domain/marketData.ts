export interface MarketData {
  symbol: string;
  marketCapUsd: number;
  circulatingSupply: number;
  maxSupply: number | null;
  vwap24hUsd: number;
  dominancePercent: number;
}

