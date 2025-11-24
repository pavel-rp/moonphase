import { Asset } from "@/domain/asset";
import { MarketData } from "@/domain/marketData";
import { AiAnalysisPort } from "@/ports/AiAnalysisPort";

export async function getAiAnalysis(
  deps: {
    ai: AiAnalysisPort;
  },
  asset: Asset,
  marketData: MarketData[]
): Promise<string> {
  const analysis = await deps.ai.analyzeAsset(asset, marketData);
  return analysis;
}

export function getAiAnalysisStream(
  deps: { ai: AiAnalysisPort },
  asset: Asset,
  marketData: MarketData[]
): AsyncIterable<string> {
  return deps.ai.analyzeAssetStream(asset, marketData);
}
