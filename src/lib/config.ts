// ---------------------------------------------------------------------------
// Centralized adapter configuration constants
// ---------------------------------------------------------------------------

// -- CoinCap ------------------------------------------------------------------
export const COINCAP_REVALIDATE_S = 60;
export const COINCAP_TIMEOUT_MS = 10_000;
export const COINCAP_DEFAULT_LIMIT = 19; // Default number of assets to request from CoinCap

// -- Binance ------------------------------------------------------------------
export const BINANCE_TICKER_REVALIDATE_S = 30;
export const BINANCE_CANDLES_REVALIDATE_S = 60;
export const BINANCE_TIMEOUT_MS = 10_000;

// -- News (NewsAPI.ai) --------------------------------------------------------
export const NEWS_REVALIDATE_S = 300;
export const NEWS_DEFAULT_LIMIT = 5;

// -- AI / LLM -----------------------------------------------------------------
export const AI_PRICE_HISTORY_DAYS = 14;
export const AI_NEWS_LIMIT = 5;
// Per-field character caps for untrusted news text. News titles, descriptions,
// and source names are attacker-influenceable (a crafted headline is a
// prompt-injection vector), so each field is sanitized and length-capped before
// it enters the analyst prompt.
export const AI_NEWS_TITLE_MAX_CHARS = 200;
export const AI_NEWS_DESCRIPTION_MAX_CHARS = 100;
export const AI_NEWS_SOURCE_MAX_CHARS = 100;
// Default OpenAI model. Override per-environment with the OPENAI_MODEL env var.
// gpt-5.5 is the current flagship reasoning model; switch to gpt-5.4 or
// gpt-5.4-mini via OPENAI_MODEL for lower cost/latency if needed. Overrides must
// stay GPT-5.x reasoning models — the adapter always sends `reasoning_effort`,
// which non-reasoning models reject.
export const AI_LLM_MODEL = "gpt-5.5";
// GPT-5.x are reasoning models and use `reasoning_effort` instead of `temperature`.
// "low" keeps latency close to the <10s target for these short analyses.
export const AI_LLM_REASONING_EFFORT = "low";
// Default request timeout for the model call. Override per-environment with the
// AI_ANALYSIS_TIMEOUT_MS env var; the adapter falls back to this default when
// the env var is unset or not a positive integer.
export const AI_LLM_TIMEOUT_MS = 30_000;
