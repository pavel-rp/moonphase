/** @jest-environment node */
import {
  CachingAiAnalysisAdapter,
  resetAiAnalysisCache,
} from '@/adapters/cache/CachingAiAnalysisAdapter';
import { AI_ANALYSIS_CACHE_MAX_ENTRIES, AI_ANALYSIS_CACHE_TTL_S } from '@/lib/config';
import type { AiAnalysisPort } from '@/ports/AiAnalysisPort';

async function collect(stream: AsyncIterable<string>): Promise<string[]> {
  const out: string[] = [];
  for await (const chunk of stream) out.push(chunk);
  return out;
}

async function* gen(chunks: string[]): AsyncGenerator<string> {
  for (const c of chunks) {
    await Promise.resolve();
    yield c;
  }
}

async function* genThenThrow(chunks: string[], err: unknown): AsyncGenerator<string> {
  for (const c of chunks) {
    await Promise.resolve();
    yield c;
  }
  throw err;
}

function makeInner(): jest.Mocked<AiAnalysisPort> {
  return {
    analyzeAsset: jest.fn(),
    analyzeAssetStream: jest.fn(),
  };
}

const OPTS = { mode: 'live' as const, model: 'gpt-5.5' };

describe('CachingAiAnalysisAdapter', () => {
  beforeEach(() => {
    resetAiAnalysisCache();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('analyzeAssetStream', () => {
    it('re-emits a cache hit as a multi-chunk paced stream without calling the model again', async () => {
      const inner = makeInner();
      inner.analyzeAssetStream.mockReturnValue(gen(['The ', 'quick ', 'brown ', 'fox ', 'jumps']));
      const adapter = new CachingAiAnalysisAdapter(inner, OPTS);

      const first = await collect(adapter.analyzeAssetStream('BTC'));
      expect(first.join('')).toBe('The quick brown fox jumps');

      const second = await collect(adapter.analyzeAssetStream('BTC'));
      expect(inner.analyzeAssetStream).toHaveBeenCalledTimes(1);
      expect(second.length).toBeGreaterThan(1);
      expect(second.join('')).toBe('The quick brown fox jumps');
    });

    it('shares ONE upstream call across concurrent same-key requests', async () => {
      const inner = makeInner();
      inner.analyzeAssetStream.mockReturnValue(gen(['a', 'b', 'c']));
      const adapter = new CachingAiAnalysisAdapter(inner, OPTS);

      const [r1, r2] = await Promise.all([
        collect(adapter.analyzeAssetStream('BTC')),
        collect(adapter.analyzeAssetStream('BTC')),
      ]);

      expect(inner.analyzeAssetStream).toHaveBeenCalledTimes(1);
      expect(r1.join('')).toBe('abc');
      expect(r2.join('')).toBe('abc');
    });

    it('does not cache a mid-stream error and re-calls the model on the next request', async () => {
      const inner = makeInner();
      inner.analyzeAssetStream
        .mockReturnValueOnce(genThenThrow(['part', 'ial'], new Error('mid')))
        .mockReturnValueOnce(gen(['fresh']));
      const adapter = new CachingAiAnalysisAdapter(inner, OPTS);

      await expect(collect(adapter.analyzeAssetStream('BTC'))).rejects.toThrow('mid');

      const second = await collect(adapter.analyzeAssetStream('BTC'));
      expect(second.join('')).toBe('fresh');
      expect(inner.analyzeAssetStream).toHaveBeenCalledTimes(2);
    });

    it('does not cache an empty result', async () => {
      const inner = makeInner();
      inner.analyzeAssetStream
        .mockReturnValueOnce(gen(['   ']))
        .mockReturnValueOnce(gen(['real analysis']));
      const adapter = new CachingAiAnalysisAdapter(inner, OPTS);

      await collect(adapter.analyzeAssetStream('BTC'));
      const second = await collect(adapter.analyzeAssetStream('BTC'));

      expect(inner.analyzeAssetStream).toHaveBeenCalledTimes(2);
      expect(second.join('')).toBe('real analysis');
    });
  });

  describe('analyzeAsset', () => {
    it('caches a successful result and serves repeats without re-calling the model', async () => {
      const inner = makeInner();
      inner.analyzeAsset.mockResolvedValue('analysis text');
      const adapter = new CachingAiAnalysisAdapter(inner, OPTS);

      expect(await adapter.analyzeAsset('BTC')).toBe('analysis text');
      expect(await adapter.analyzeAsset('BTC')).toBe('analysis text');
      expect(inner.analyzeAsset).toHaveBeenCalledTimes(1);
    });

    it('does not cache a rejected result', async () => {
      const inner = makeInner();
      inner.analyzeAsset
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValueOnce('ok');
      const adapter = new CachingAiAnalysisAdapter(inner, OPTS);

      await expect(adapter.analyzeAsset('BTC')).rejects.toThrow('boom');
      expect(await adapter.analyzeAsset('BTC')).toBe('ok');
      expect(inner.analyzeAsset).toHaveBeenCalledTimes(2);
    });

    it('does not cache an empty result', async () => {
      const inner = makeInner();
      inner.analyzeAsset.mockResolvedValueOnce('  ').mockResolvedValueOnce('real');
      const adapter = new CachingAiAnalysisAdapter(inner, OPTS);

      expect(await adapter.analyzeAsset('BTC')).toBe('  ');
      expect(await adapter.analyzeAsset('BTC')).toBe('real');
      expect(inner.analyzeAsset).toHaveBeenCalledTimes(2);
    });

    it('re-calls the model after the TTL expires', async () => {
      jest.useFakeTimers();
      const inner = makeInner();
      inner.analyzeAsset.mockResolvedValue('analysis text');
      const adapter = new CachingAiAnalysisAdapter(inner, OPTS);

      await adapter.analyzeAsset('BTC');
      await adapter.analyzeAsset('BTC');
      expect(inner.analyzeAsset).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(AI_ANALYSIS_CACHE_TTL_S * 1000 + 1);

      await adapter.analyzeAsset('BTC');
      expect(inner.analyzeAsset).toHaveBeenCalledTimes(2);
    });
  });

  describe('cache key', () => {
    it('keys mock and live modes separately', async () => {
      const liveInner = makeInner();
      liveInner.analyzeAsset.mockResolvedValue('LIVE');
      const mockInner = makeInner();
      mockInner.analyzeAsset.mockResolvedValue('MOCK');

      const live = new CachingAiAnalysisAdapter(liveInner, { mode: 'live', model: 'gpt-5.5' });
      const mock = new CachingAiAnalysisAdapter(mockInner, { mode: 'mock', model: 'gpt-5.5' });

      expect(await live.analyzeAsset('BTC')).toBe('LIVE');
      // Same symbol, different mode → must NOT be served the live entry.
      expect(await mock.analyzeAsset('BTC')).toBe('MOCK');
      expect(mockInner.analyzeAsset).toHaveBeenCalledTimes(1);
    });

    it('keys distinct models separately', async () => {
      const innerA = makeInner();
      innerA.analyzeAsset.mockResolvedValue('A');
      const innerB = makeInner();
      innerB.analyzeAsset.mockResolvedValue('B');

      const a = new CachingAiAnalysisAdapter(innerA, { mode: 'live', model: 'gpt-5.5' });
      const b = new CachingAiAnalysisAdapter(innerB, { mode: 'live', model: 'gpt-5.4' });

      expect(await a.analyzeAsset('BTC')).toBe('A');
      expect(await b.analyzeAsset('BTC')).toBe('B');
      expect(innerB.analyzeAsset).toHaveBeenCalledTimes(1);
    });

    it('normalizes symbol case so BTC and btc share an entry', async () => {
      const inner = makeInner();
      inner.analyzeAsset.mockResolvedValue('shared');
      const adapter = new CachingAiAnalysisAdapter(inner, OPTS);

      await adapter.analyzeAsset('BTC');
      await adapter.analyzeAsset('btc');
      expect(inner.analyzeAsset).toHaveBeenCalledTimes(1);
    });
  });

  describe('LRU eviction', () => {
    it('evicts the least-recently-used entry over the cap and keeps refreshed entries', async () => {
      const inner = makeInner();
      inner.analyzeAsset.mockImplementation((s: string) => Promise.resolve(`v-${s}`));
      const adapter = new CachingAiAnalysisAdapter(inner, OPTS);

      // Fill the cache to capacity: S0 .. S{MAX-1}.
      for (let i = 0; i < AI_ANALYSIS_CACHE_MAX_ENTRIES; i++) {
        await adapter.analyzeAsset(`S${i}`);
      }
      expect(inner.analyzeAsset).toHaveBeenCalledTimes(AI_ANALYSIS_CACHE_MAX_ENTRIES);

      // Touch S0 so it becomes most-recently-used (cache hit — no new call).
      await adapter.analyzeAsset('S0');
      expect(inner.analyzeAsset).toHaveBeenCalledTimes(AI_ANALYSIS_CACHE_MAX_ENTRIES);

      // One more distinct entry pushes over the cap, evicting S1 (now LRU).
      await adapter.analyzeAsset('Sx');
      expect(inner.analyzeAsset).toHaveBeenCalledTimes(AI_ANALYSIS_CACHE_MAX_ENTRIES + 1);

      // S0 was refreshed → survived → still a hit.
      await adapter.analyzeAsset('S0');
      expect(inner.analyzeAsset).toHaveBeenCalledTimes(AI_ANALYSIS_CACHE_MAX_ENTRIES + 1);

      // S1 was evicted → re-fetched.
      await adapter.analyzeAsset('S1');
      expect(inner.analyzeAsset).toHaveBeenCalledTimes(AI_ANALYSIS_CACHE_MAX_ENTRIES + 2);
    });
  });

  describe('cross-method cache sharing', () => {
    it('serves analyzeAsset from a value cached by a completed stream', async () => {
      const inner = makeInner();
      inner.analyzeAssetStream.mockReturnValue(gen(['Hel', 'lo']));
      const adapter = new CachingAiAnalysisAdapter(inner, OPTS);

      await collect(adapter.analyzeAssetStream('BTC'));

      expect(await adapter.analyzeAsset('BTC')).toBe('Hello');
      expect(inner.analyzeAsset).not.toHaveBeenCalled();
    });
  });
});
