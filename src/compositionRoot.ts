import { CoinCapAdapter } from '@/adapters/coincap/CoinCapAdapter';
import { JsonWhitelistAdapter } from '@/adapters/whitelist/JsonWhitelistAdapter';
import whitelistData from '@/adapters/whitelist/whitelist.json';
import { BinanceAdapter } from '@/adapters/binance/BinanceAdapter';
import { MockMarketDataAdapter } from '@/adapters/mock/MockMarketDataAdapter';
import { MockTradingActivityAdapter } from '@/adapters/mock/MockTradingActivityAdapter';
import { OpenAiAnalysisAdapter } from '@/adapters/openai/OpenAiAnalysisAdapter';
import { MockAiAnalysisAdapter } from '@/adapters/mock/MockAiAnalysisAdapter';
import { CachingAiAnalysisAdapter } from '@/adapters/cache/CachingAiAnalysisAdapter';
import { NewsAdapter } from '@/adapters/news/NewsAdapter';
import { MockNewsAdapter } from '@/adapters/news/MockNewsAdapter';
import { getEnv } from '@/lib/env';
import { AI_LLM_MODEL } from '@/lib/config';
import type { AiAnalysisMode } from '@/lib/aiAnalysisMode';

import type { CoinCapPort } from '@/ports/CoinCapPort';
import type { AssetWhitelistPort } from '@/ports/AssetWhitelistPort';
import type { BinancePort } from '@/ports/BinancePort';
import type { MarketDataPort } from '@/ports/MarketDataPort';
import type { TradingActivityPort } from '@/ports/TradingActivityPort';
import type { AiAnalysisPort } from '@/ports/AiAnalysisPort';

// Singleton adapter instances (eagerly created — no env requirements)
const coinCap: CoinCapPort = new CoinCapAdapter();
const whitelist: AssetWhitelistPort = new JsonWhitelistAdapter(whitelistData);
const binance: BinancePort = new BinanceAdapter();
const marketData: MarketDataPort = new MockMarketDataAdapter();
const tradingActivity: TradingActivityPort = new MockTradingActivityAdapter();

// Dependency bundles keyed by use-case
export const assetsDeps = { coinCap, whitelist } as const;
export const pricesDeps = { binance } as const;
export const marketDataDeps = { marketData } as const;
export const tradingActivityDeps = { tradingActivity } as const;

// AI analysis deps are memoized per mode so concurrent callers share a single
// adapter instance (promise-based locking). `live` builds the OpenAI adapter
// (with the news swap); `mock` builds the inference-free stub, which needs no
// API key. The promise return type is kept so callers stay unchanged.
const _aiAnalysisInit = new Map<AiAnalysisMode, Promise<{ ai: AiAnalysisPort }>>();

export function getAiAnalysisDeps(mode: AiAnalysisMode): Promise<{ ai: AiAnalysisPort }> {
  const cached = _aiAnalysisInit.get(mode);
  if (cached) return cached;

  const init = (async () => {
    const env = getEnv();
    // Treat a blank OPENAI_MODEL as unset, matching the OpenAI adapter, so the
    // cache key tracks the model that actually answers the request.
    const model = env.OPENAI_MODEL?.trim() || AI_LLM_MODEL;

    // The caching decorator wraps both modes (keyed separately by mode + model)
    // so duplicate/concurrent requests are deduped and replayed identically
    // whether running live or mock. The route and use case stay unchanged.
    if (mode === 'mock') {
      const inner = new MockAiAnalysisAdapter();
      return { ai: new CachingAiAnalysisAdapter(inner, { mode, model }) as AiAnalysisPort };
    }
    const news = env.NEWS_API_KEY ? new NewsAdapter() : new MockNewsAdapter();
    const inner = new OpenAiAnalysisAdapter({ binance, news });
    return { ai: new CachingAiAnalysisAdapter(inner, { mode, model }) as AiAnalysisPort };
  })();

  // Reset the cached promise on failure so a later call can retry. The adapter
  // is constructed synchronously inside the async IIFE, so a constructor throw
  // rejects `init` in the same tick; running the reset in this `.catch`
  // microtask (after the set below) keeps it from clobbering the assignment, and
  // the identity guard avoids discarding a newer in-flight init for this mode.
  init.catch(() => {
    if (_aiAnalysisInit.get(mode) === init) _aiAnalysisInit.delete(mode);
  });
  _aiAnalysisInit.set(mode, init);
  return init;
}
