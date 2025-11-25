import { Asset } from "@/domain/asset";
import { MarketData } from "@/domain/marketData";

export interface AiAnalysisPort {
  /**
   * Analyze an asset by its symbol.
   * @param symbol - The symbol of the asset to analyze.
   * @returns The analysis of the asset.
   */
  analyzeAsset(asset: Asset, marketData: MarketData[]): Promise<string>;

  /**
   * Analyze an asset by its symbol and stream the result.
   * @param symbol - The symbol of the asset to analyze.
   * @returns The analysis of the asset.
   */
  analyzeAssetStream(asset: Asset, marketData: MarketData[]): AsyncIterable<string>;
}
