export interface AiAnalysisOptions {
  /**
   * Aborts the analysis, e.g. when the requesting client disconnects. An
   * aborted call rejects with the signal's reason rather than an
   * ExternalException, since nothing went wrong upstream.
   */
  signal?: AbortSignal;
}

export interface AiAnalysisPort {
  /**
   * Analyze a cryptocurrency asset by symbol.
   * @param symbol - The symbol of the asset to analyze (e.g., "BTC").
   * @param opts - Optional call options (e.g. an abort signal).
   * @returns The analysis of the asset.
   */
  analyzeAsset(symbol: string, opts?: AiAnalysisOptions): Promise<string>;

  /**
   * Analyze a cryptocurrency asset by symbol and stream the result.
   * @param symbol - The symbol of the asset to analyze (e.g., "BTC").
   * @param opts - Optional call options (e.g. an abort signal).
   * @returns An async iterable of analysis chunks.
   */
  analyzeAssetStream(symbol: string, opts?: AiAnalysisOptions): AsyncIterable<string>;
}
