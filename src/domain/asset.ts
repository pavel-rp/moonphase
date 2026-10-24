export interface Asset {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  supply: number;
  maxSupply: number | null;
  marketCapUsd: number;
  volumeUsd24Hr: number;
  priceUsd: number;
  /** null when CoinCap has no 24h change (thinly traded assets). */
  changePercent24Hr: number | null;
  vwap24Hr: number;
  explorer: string;
}