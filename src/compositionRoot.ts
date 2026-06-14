import { CoinCapAdapter } from '@/adapters/coincap/CoinCapAdapter';
import { JsonWhitelistAdapter } from '@/adapters/whitelist/JsonWhitelistAdapter';
import whitelistData from '@/adapters/whitelist/whitelist.json';
import { BinanceAdapter } from '@/adapters/binance/BinanceAdapter';
import { MockMarketDataAdapter } from '@/adapters/mock/MockMarketDataAdapter';
import { MockTradingActivityAdapter } from '@/adapters/mock/MockTradingActivityAdapter';
import { OpenAiAnalysisAdapter } from '@/adapters/openai/OpenAiAnalysisAdapter';
import { NewsAdapter } from '@/adapters/news/NewsAdapter';
import { MockNewsAdapter } from '@/adapters/news/MockNewsAdapter';
import { getEnv } from '@/lib/env';

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

// AI analysis deps are memoized so concurrent callers share a single adapter
// instance (promise-based locking). The promise return type is kept so callers
// (the route, use case) stay unchanged; construction is now synchronous since
// the AI SDK imports cleanly under Jest — no dynamic-import workaround needed.
let _aiAnalysisInit: Promise<{ ai: AiAnalysisPort }> | null = null;

export function getAiAnalysisDeps(): Promise<{ ai: AiAnalysisPort }> {
  if (!_aiAnalysisInit) {
    const init = (async () => {
      const env = getEnv();
      const news = env.NEWS_API_KEY ? new NewsAdapter() : new MockNewsAdapter();
      return { ai: new OpenAiAnalysisAdapter({ binance, news }) as AiAnalysisPort };
    })();
    // Reset the cached promise on failure so a later call can retry. This runs
    // as a microtask after the assignment below, so it cannot be clobbered when
    // construction throws synchronously; the identity guard avoids discarding a
    // newer in-flight init.
    init.catch(() => {
      if (_aiAnalysisInit === init) _aiAnalysisInit = null;
    });
    _aiAnalysisInit = init;
  }
  return _aiAnalysisInit;
}
