// AI analysis usecase — thin delegation to the AiAnalysisPort.
// Future business logic (rate limiting, caching, input enrichment)
// should be added here rather than in the adapter or wiring layer.

import { AiAnalysisPort } from "@/ports/AiAnalysisPort";

/** One-shot AI analysis, delegates to deps.ai.analyzeAsset. */
export async function getAiAnalysis(
  deps: {
    ai: AiAnalysisPort;
  },
  symbol: string
): Promise<string> {
  const analysis = await deps.ai.analyzeAsset(symbol);
  return analysis;
}

/** Streaming AI analysis, delegates to deps.ai.analyzeAssetStream. */
export function getAiAnalysisStream(
  deps: { ai: AiAnalysisPort },
  symbol: string
): AsyncIterable<string> {
  return deps.ai.analyzeAssetStream(symbol);
}
