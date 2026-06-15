import { getAiAnalysis, getAiAnalysisStream } from '@/usecases/getAiAnalysis';
import { getAiAnalysisDeps } from '@/compositionRoot';

export async function analyzeAsset(symbol: string): Promise<string> {
  const deps = await getAiAnalysisDeps();
  return getAiAnalysis(deps, symbol);
}

/**
 * Streaming counterpart to `analyzeAsset`. Resolves the AI deps, then yields
 * the analysis as incremental string chunks from the usecase. Kept as an async
 * generator so the dependency resolution happens lazily on first iteration and
 * any construction error surfaces from the first `next()` (letting the route map
 * it to an HTTP status before the stream has started).
 */
export async function* analyzeAssetStream(symbol: string): AsyncIterable<string> {
  const deps = await getAiAnalysisDeps();
  yield* getAiAnalysisStream(deps, symbol);
}
