export interface TradingActivity {
  symbol: string;
  volume24hUsd: number;
  liquidityScore: number; // 0-100
  topExchanges: ExchangeShare[];
  cexDexSplit: {
    cex: number; // percentage 0-100
    dex: number; // percentage 0-100
  };
}

export interface ExchangeShare {
  name: string;
  percentage: number; // percentage 0-100
}