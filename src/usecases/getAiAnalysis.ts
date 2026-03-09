import { AiAnalysisPort } from "@/ports/AiAnalysisPort";

/**
 * AI analysis usecase — provides both one-shot and streaming analysis.
 *
 * Currently a thin delegation to the AiAnalysisPort. The exported
 * two-function surface (getAiAnalysis + getAiAnalysisStream) is the
 * primary value add, delegating to deps.ai.analyzeAsset /
 * deps.ai.analyzeAssetStream. Future business logic such as rate
 * limiting, caching, or input enrichment should be added here rather
 * than in the adapter or wiring layer.
 */
export async function getAiAnalysis(
  deps: {
    ai: AiAnalysisPort;
  },
  symbol: string
): Promise<string> {
  const analysis = await deps.ai.analyzeAsset(symbol);
  return analysis;
}

export function getAiAnalysisStream(
  deps: { ai: AiAnalysisPort },
  symbol: string
): AsyncIterable<string> {
  return deps.ai.analyzeAssetStream(symbol);
}
