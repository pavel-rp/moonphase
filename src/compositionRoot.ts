import { CoinCapAdapter } from '@/adapters/coincap/CoinCapAdapter';
import { JsonWhitelistAdapter } from '@/adapters/whitelist/JsonWhitelistAdapter';
import whitelistData from '@/adapters/whitelist/whitelist.json';
import { BinanceAdapter } from '@/adapters/binance/BinanceAdapter';
import { MockMarketDataAdapter } from '@/adapters/mock/MockMarketDataAdapter';
import { MockTradingActivityAdapter } from '@/adapters/mock/MockTradingActivityAdapter';
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

// AI analysis deps are lazy with dynamic imports because LangChainAiAdapter
// pulls in ESM-only langchain dependencies that break Jest at import time.
// Using dynamic import ensures the langchain module tree is only loaded
// when AI analysis is actually needed.
//
// The initialization promise is stored to prevent concurrent calls from
// creating multiple instances (promise-based locking).
let _aiAnalysisInit: Promise<{ ai: AiAnalysisPort }> | null = null;

export function getAiAnalysisDeps(): Promise<{ ai: AiAnalysisPort }> {
  if (!_aiAnalysisInit) {
    _aiAnalysisInit = (async () => {
      try {
        const env = getEnv();
        const [
          { LangChainAiAdapter },
          { NewsAdapter },
          { MockNewsAdapter },
        ] = await Promise.all([
          import('@/adapters/langchain/LangChainAiAdapter'),
          import('@/adapters/news/NewsAdapter'),
          import('@/adapters/news/MockNewsAdapter'),
        ]);
        const news = env.NEWS_API_KEY ? new NewsAdapter() : new MockNewsAdapter();
        return { ai: new LangChainAiAdapter({ binance, news }) as AiAnalysisPort };
      } catch (error) {
        // Reset the cached promise on failure so that a later call can retry.
        _aiAnalysisInit = null;
        throw error;
      }
    })();
  }
  return _aiAnalysisInit;
}
