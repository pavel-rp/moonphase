/**
 * AI-analysis mode policy.
 *
 * The streaming AI-analysis feature can run against the real LLM (`live`) or a
 * deterministic, inference-free stub (`mock`). This module is the single source
 * of truth for which mode a request resolves to. It is intentionally free of
 * server-only imports so it can be shared by the client component that sends the
 * override header.
 */

export type AiAnalysisMode = 'live' | 'mock';

/** Request header a gated client uses to request a specific mode. */
export const AI_ANALYSIS_MODE_HEADER = 'x-ai-analysis-mode';

/** localStorage key the per-browser override toggle persists its preference to. */
export const AI_ANALYSIS_MODE_STORAGE_KEY = 'ai-analysis-mode';

/** The subset of environment values the mode policy depends on. */
export interface AiAnalysisEnv {
  AI_ANALYSIS_MODE?: AiAnalysisMode;
  AI_ANALYSIS_ALLOW_CLIENT_OVERRIDE?: string;
  OPENAI_API_KEY?: string;
  VERCEL_ENV?: 'production' | 'preview' | 'development';
}

/** Narrows an arbitrary header/string value to a valid mode, or `undefined`. */
export function parseRequestedMode(raw: string | null | undefined): AiAnalysisMode | undefined {
  return raw === 'live' || raw === 'mock' ? raw : undefined;
}

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

/**
 * Whether a per-browser override is permitted for this deployment. An explicit
 * `AI_ANALYSIS_MODE` kill-switch is absolute and disables overrides entirely
 * (so the UI toggle is only shown where it would actually take effect).
 * Otherwise allowed in any non-production environment, or in production only
 * when explicitly enabled via `AI_ANALYSIS_ALLOW_CLIENT_OVERRIDE`.
 */
export function isClientOverrideAllowed(env: AiAnalysisEnv): boolean {
  if (env.AI_ANALYSIS_MODE) return false;
  if (isTruthyFlag(env.AI_ANALYSIS_ALLOW_CLIENT_OVERRIDE)) return true;
  return env.VERCEL_ENV !== 'production';
}

/**
 * Resolve the effective analysis mode. Precedence:
 *
 * 1. Explicit `AI_ANALYSIS_MODE` wins (the central kill-switch — it beats any
 *    client override). A forced `live` with no API key degrades to `mock`
 *    rather than erroring.
 * 2. A client-requested mode, but only when override is permitted. A requested
 *    `live` with no key degrades to `mock`.
 * 3. No `OPENAI_API_KEY` ⇒ `mock` (graceful, mirrors the news adapter swap).
 * 4. Environment default: `VERCEL_ENV === 'production'` ⇒ `live`, else `mock`.
 */
export function resolveAiAnalysisMode(
  env: AiAnalysisEnv,
  requested?: AiAnalysisMode,
): AiAnalysisMode {
  const hasKey = Boolean(env.OPENAI_API_KEY);

  if (env.AI_ANALYSIS_MODE) {
    return env.AI_ANALYSIS_MODE === 'live' && !hasKey ? 'mock' : env.AI_ANALYSIS_MODE;
  }

  if (requested && isClientOverrideAllowed(env)) {
    return requested === 'live' && !hasKey ? 'mock' : requested;
  }

  if (!hasKey) return 'mock';

  return env.VERCEL_ENV === 'production' ? 'live' : 'mock';
}
