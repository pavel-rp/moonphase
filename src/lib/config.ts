// ---------------------------------------------------------------------------
// Centralized adapter configuration constants
// ---------------------------------------------------------------------------

// -- CoinCap ------------------------------------------------------------------
export const COINCAP_REVALIDATE_S = 60;
export const COINCAP_TIMEOUT_MS = 10_000;
export const COINCAP_DEFAULT_LIMIT = 19; // 5× whitelist multiplier for filtered results

// -- Binance ------------------------------------------------------------------
export const BINANCE_TICKER_REVALIDATE_S = 30;
export const BINANCE_CANDLES_REVALIDATE_S = 60;
export const BINANCE_TIMEOUT_MS = 10_000;

// -- News (NewsAPI.ai) --------------------------------------------------------
export const NEWS_REVALIDATE_S = 300;
export const NEWS_DEFAULT_LIMIT = 5;

// -- AI / LangChain -----------------------------------------------------------
export const AI_PRICE_HISTORY_DAYS = 14;
export const AI_NEWS_LIMIT = 5;
export const AI_LLM_TEMPERATURE = 0.7;
