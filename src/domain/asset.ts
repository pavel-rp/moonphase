export interface Asset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: number;
  maxSupply: number | null;
  marketCapUsd: number;
  volumeUsd24Hr: number;
  priceUsd: number;
  changePercent24Hr: number;
  vwap24Hr: number;
  explorer: string;
}