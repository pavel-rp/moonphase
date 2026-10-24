// AI analysis usecase — delegation to the AiAnalysisPort, gated on the asset
// whitelist. Future business logic (rate limiting, caching, input enrichment)
// should be added here rather than in the adapter or wiring layer.

import { AiAnalysisOptions, AiAnalysisPort } from "@/ports/AiAnalysisPort";
import { AssetWhitelistPort } from "@/ports/AssetWhitelistPort";
import { ExternalException } from "@/lib/errors";

type AiAnalysisDeps = {
  ai: AiAnalysisPort;
  whitelist: AssetWhitelistPort;
};

/**
 * Rejects symbols outside the asset whitelist before any model call, so the
 * (unauthenticated) analysis endpoint can't be driven to spend LLM and news
 * quota on arbitrary strings — it serves exactly the assets the app lists.
 */
async function assertAllowedSymbol(
  whitelist: AssetWhitelistPort,
  symbol: string
): Promise<void> {
  const allowed = await whitelist.listAllowedSymbols();
  const normalized = symbol.trim().toUpperCase();
  if (!allowed.some((s) => s.toUpperCase() === normalized)) {
    throw new ExternalException(
      { kind: "InvalidRequest", details: { symbol } },
      `Unsupported symbol: ${symbol}`
    );
  }
}

/** One-shot AI analysis, delegates to deps.ai.analyzeAsset. */
export async function getAiAnalysis(
  deps: AiAnalysisDeps,
  symbol: string,
  opts: AiAnalysisOptions = {}
): Promise<string> {
  await assertAllowedSymbol(deps.whitelist, symbol);
  const analysis = await deps.ai.analyzeAsset(symbol, opts);
  return analysis;
}

/**
 * Streaming AI analysis, delegates to deps.ai.analyzeAssetStream. An async
 * generator so the whitelist check surfaces from the first `next()`, before
 * any chunk (and before the route commits to streaming headers).
 */
export async function* getAiAnalysisStream(
  deps: AiAnalysisDeps,
  symbol: string,
  opts: AiAnalysisOptions = {}
): AsyncIterable<string> {
  await assertAllowedSymbol(deps.whitelist, symbol);
  yield* deps.ai.analyzeAssetStream(symbol, opts);
}
