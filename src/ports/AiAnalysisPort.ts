export interface AiAnalysisPort {
  /**
   * Analyze an asset by its symbol.
   * @param symbol - The symbol of the asset to analyze.
   * @returns The analysis of the asset.
   */
  analyzeAsset(symbol: string): Promise<string>;

  /**
   * Analyze an asset by its symbol and stream the result.
   * @param symbol - The symbol of the asset to analyze.
   * @returns The analysis of the asset.
   */
  analyzeAssetStream(symbol: string): AsyncIterable<string>;
}
