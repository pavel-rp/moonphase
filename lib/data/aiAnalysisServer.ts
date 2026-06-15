import { getAiAnalysis, getAiAnalysisStream } from '@/usecases/getAiAnalysis';
import { getAiAnalysisDeps } from '@/compositionRoot';
import { getEnv } from '@/lib/env';
import { resolveAiAnalysisMode, type AiAnalysisMode } from '@/lib/aiAnalysisMode';

export interface AnalyzeOptions {
  /** Client-requested mode (e.g. from the gated `x-ai-analysis-mode` header). */
  requestedMode?: AiAnalysisMode;
}

export async function analyzeAsset(symbol: string, opts: AnalyzeOptions = {}): Promise<string> {
  const mode = resolveAiAnalysisMode(getEnv(), opts.requestedMode);
  const deps = await getAiAnalysisDeps(mode);
  return getAiAnalysis(deps, symbol);
}

/**
 * Streaming counterpart to `analyzeAsset`. Resolves the effective mode (honoring
 * a permitted client override), resolves the AI deps for that mode, then yields
 * the analysis as incremental string chunks from the usecase. Kept as an async
 * generator so the dependency resolution happens lazily on first iteration and
 * any construction error surfaces from the first `next()` (letting the route map
 * it to an HTTP status before the stream has started).
 */
export async function* analyzeAssetStream(
  symbol: string,
  opts: AnalyzeOptions = {},
): AsyncIterable<string> {
  const mode = resolveAiAnalysisMode(getEnv(), opts.requestedMode);
  const deps = await getAiAnalysisDeps(mode);
  yield* getAiAnalysisStream(deps, symbol);
}
