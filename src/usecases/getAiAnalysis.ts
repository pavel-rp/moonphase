import { AiAnalysisPort } from "@/ports/AiAnalysisPort";

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
