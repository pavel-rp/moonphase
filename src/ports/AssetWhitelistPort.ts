export interface AssetWhitelistPort {
  /**
   * Returns an allowlist of asset symbols (e.g., ["BTC", "ETH"]) that have Binance data.
   */
  listAllowedSymbols(): Promise<string[]>;
}

