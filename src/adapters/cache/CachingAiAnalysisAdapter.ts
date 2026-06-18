import { AiAnalysisPort } from '@/ports/AiAnalysisPort';
import type { AiAnalysisMode } from '@/lib/aiAnalysisMode';
import {
  AI_ANALYSIS_CACHE_MAX_ENTRIES,
  AI_ANALYSIS_CACHE_TTL_S,
  AI_ANALYSIS_REPLAY_MIN_CHUNK_MS,
  AI_ANALYSIS_REPLAY_TOTAL_MS,
} from '@/lib/config';
import {
  createStreamBroadcaster,
  type StreamBroadcaster,
} from '@/lib/http/streamBroadcaster';

/**
 * Stream-aware caching decorator over {@link AiAnalysisPort}.
 *
 * Wraps an inner adapter (the live OpenAI adapter or the mock) and adds three
 * behaviors without changing the port contract — the route and use case stay
 * unchanged:
 *
 * 1. **TTL cache hit** — a repeat request within {@link AI_ANALYSIS_CACHE_TTL_S}
 *    re-emits the stored text as a *paced* stream (see {@link pacedReplay}), so
 *    the card's `useCompletion` (`streamProtocol: "text"`) renders it as typing
 *    just like a fresh generation. No model call is made.
 * 2. **In-flight dedup** — concurrent requests for the same key share ONE
 *    upstream call via a {@link StreamBroadcaster}: the first drives the model,
 *    later callers replay the buffered prefix then subscribe to live chunks.
 * 3. **Miss** — forward live chunks while accumulating; store the full text on
 *    successful, non-empty completion only.
 *
 * State (the cache and in-flight registries) is module-level so it is shared
 * across the per-mode memoized instances created in the composition root. The
 * key includes mode and model id, so a mock blob is never served as live and a
 * model bump invalidates stale entries.
 *
 * Store is in-memory and per-instance (team decision). The decorator interface
 * lets a shared store (Redis/Upstash) slot in later with no route/use-case
 * change.
 */

interface CacheEntry {
  text: string;
  expiresAt: number;
}

// Module-level so all per-mode adapter instances share one cache/registry.
const cache = new Map<string, CacheEntry>();
const inflightStreams = new Map<string, StreamBroadcaster>();
const inflightTexts = new Map<string, Promise<string>>();

const TTL_MS = AI_ANALYSIS_CACHE_TTL_S * 1000;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Reads a non-expired entry, refreshing its LRU recency. Lazy-expires on read. */
function readFresh(key: string): string | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  // Re-insert to mark most-recently-used (Map preserves insertion order).
  cache.delete(key);
  cache.set(key, entry);
  return entry.text;
}

/** Stores a successful result and evicts the least-recently-used over the cap. */
function writeCache(key: string, text: string): void {
  cache.delete(key);
  cache.set(key, { text, expiresAt: Date.now() + TTL_MS });
  while (cache.size > AI_ANALYSIS_CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

/** Splits text into word-boundary chunks, preserving whitespace. */
function toTokens(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

/**
 * Re-emit stored text as a paced "typed" stream. Groups tokens so the whole
 * replay lands near {@link AI_ANALYSIS_REPLAY_TOTAL_MS}, never faster than
 * {@link AI_ANALYSIS_REPLAY_MIN_CHUNK_MS} per chunk. If the consumer stops
 * pulling (client disconnect), the generator suspends and replay stops.
 */
async function* pacedReplay(text: string): AsyncIterable<string> {
  const tokens = toTokens(text);
  // Cap chunk count so per-chunk delay stays at/above the floor.
  const maxChunks = Math.max(1, Math.floor(AI_ANALYSIS_REPLAY_TOTAL_MS / AI_ANALYSIS_REPLAY_MIN_CHUNK_MS));
  const groupSize = Math.max(1, Math.ceil(tokens.length / maxChunks));

  const chunks: string[] = [];
  for (let i = 0; i < tokens.length; i += groupSize) {
    chunks.push(tokens.slice(i, i + groupSize).join(''));
  }

  const perChunkMs = Math.max(
    AI_ANALYSIS_REPLAY_MIN_CHUNK_MS,
    Math.round(AI_ANALYSIS_REPLAY_TOTAL_MS / chunks.length),
  );

  // Emit the first chunk immediately so the route's eager first-chunk pull is
  // not stalled (a fresh stream's first token also arrives without delay);
  // pace the gaps between subsequent chunks to mimic typing.
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await delay(perChunkMs);
    yield chunks[i];
  }
}

/** Clears all cache and in-flight state. Test-only. */
export function resetAiAnalysisCache(): void {
  cache.clear();
  inflightStreams.clear();
  inflightTexts.clear();
}

export class CachingAiAnalysisAdapter implements AiAnalysisPort {
  private readonly inner: AiAnalysisPort;
  private readonly mode: AiAnalysisMode;
  private readonly model: string;

  constructor(inner: AiAnalysisPort, opts: { mode: AiAnalysisMode; model: string }) {
    this.inner = inner;
    this.mode = opts.mode;
    this.model = opts.model;
  }

  /**
   * Canonical cache form for a symbol: trimmed + uppercased. Used for BOTH the
   * cache key and the inner-adapter call so a cached result never depends on the
   * first caller's casing/whitespace (e.g. `btc`, `BTC`, and ` BTC ` all map to
   * the same key AND drive the same upstream prompt).
   */
  private normalizeSymbol(symbol: string): string {
    return symbol.trim().toUpperCase();
  }

  /** Cache key (symbol already normalized): mode and model guard against cross-mode/stale-model bleed. */
  private key(normalizedSymbol: string): string {
    return `${this.mode}:${this.model}:${normalizedSymbol}`;
  }

  async analyzeAsset(symbol: string): Promise<string> {
    const normalized = this.normalizeSymbol(symbol);
    const key = this.key(normalized);

    const cached = readFresh(key);
    if (cached !== undefined) return cached;

    const existing = inflightTexts.get(key);
    if (existing) return existing;

    const promise = this.inner.analyzeAsset(normalized).then((text) => {
      if (text.trim().length > 0) writeCache(key, text);
      return text;
    });
    inflightTexts.set(key, promise);
    const cleanup = () => {
      if (inflightTexts.get(key) === promise) inflightTexts.delete(key);
    };
    // Both handlers provided, so a rejection here is handled (no unhandled
    // rejection); the original promise is returned to the caller to await.
    promise.then(cleanup, cleanup);

    return promise;
  }

  async *analyzeAssetStream(symbol: string): AsyncIterable<string> {
    const normalized = this.normalizeSymbol(symbol);
    const key = this.key(normalized);

    const cached = readFresh(key);
    if (cached !== undefined) {
      yield* pacedReplay(cached);
      return;
    }

    // Join an in-flight computation if one exists and is still joinable.
    // subscribe() returns null for a canceled broadcaster (its source was
    // stopped when the last consumer left) — in that case fall through and
    // start a fresh upstream call.
    const existing = inflightStreams.get(key)?.subscribe();
    if (existing) {
      yield* existing;
      return;
    }

    const broadcaster = createStreamBroadcaster(this.inner.analyzeAssetStream(normalized), {
      onComplete: (fullText) => {
        if (fullText.trim().length > 0) writeCache(key, fullText);
      },
    });
    // Overwrite any canceled predecessor; its identity-guarded cleanup will
    // then no-op and leave this fresh entry in place.
    inflightStreams.set(key, broadcaster);
    const cleanup = () => {
      if (inflightStreams.get(key) === broadcaster) inflightStreams.delete(key);
    };
    broadcaster.settled.then(cleanup, cleanup);

    // A freshly created broadcaster is never canceled, so subscribe() is
    // non-null; `?? []` only satisfies the type narrowing.
    yield* broadcaster.subscribe() ?? [];
  }
}
