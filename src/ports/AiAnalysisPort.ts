export interface AiAnalysisPort {
  /**
   * Analyze a cryptocurrency asset by symbol.
   * @param symbol - The symbol of the asset to analyze (e.g., "BTC").
   * @returns The analysis of the asset.
   */
  analyzeAsset(symbol: string): Promise<string>;

  /**
   * Analyze a cryptocurrency asset by symbol and stream the result.
   * @param symbol - The symbol of the asset to analyze (e.g., "BTC").
   * @returns An async iterable of analysis chunks.
   */
  analyzeAssetStream(symbol: string): AsyncIterable<string>;
}
