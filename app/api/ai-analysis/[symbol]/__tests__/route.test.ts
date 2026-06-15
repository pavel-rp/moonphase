/** @jest-environment node */

import { ExternalException } from '@/lib/errors';

jest.mock('@/lib/data/aiAnalysisServer');

import { POST } from '../route';
import { analyzeAssetStream } from '@/lib/data/aiAnalysisServer';

const mockAnalyzeAssetStream = analyzeAssetStream as jest.MockedFunction<
  typeof analyzeAssetStream
>;

function makeRequest(symbol: string) {
  return [
    new Request('http://localhost/api/ai-analysis/' + symbol, { method: 'POST' }),
    { params: Promise.resolve({ symbol }) },
  ] as const;
}

/** An async iterable that yields the given chunks then completes. */
function iterableOf(chunks: string[]): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) yield chunk;
    },
  };
}

/** An async iterable whose first `next()` rejects (pre-stream failure). */
function rejectingIterable(error: unknown): AsyncIterable<string> {
  return {
    [Symbol.asyncIterator]() {
      return {
        next: () => Promise.reject(error),
        return: () => Promise.resolve({ done: true as const, value: undefined }),
      };
    },
  };
}

/** Yields one chunk, then rejects on the second `next()` (mid-stream failure). */
function failAfterFirst(first: string, error: unknown): AsyncIterable<string> {
  return {
    [Symbol.asyncIterator]() {
      let sent = false;
      return {
        next: () =>
          sent
            ? Promise.reject(error)
            : ((sent = true), Promise.resolve({ done: false as const, value: first })),
        return: () => Promise.resolve({ done: true as const, value: undefined }),
      };
    },
  };
}

describe('POST /api/ai-analysis/[symbol]', () => {
  beforeEach(() => jest.clearAllMocks());

  it('streams a text/plain response that concatenates the chunks', async () => {
    mockAnalyzeAssetStream.mockReturnValue(iterableOf(['Bullish ', 'momentum ', 'building.']));
    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(await res.text()).toBe('Bullish momentum building.');
  });

  it('returns an empty 200 stream when the analysis produces no chunks', async () => {
    mockAnalyzeAssetStream.mockReturnValue(iterableOf([]));
    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('');
  });

  it('stops generation by calling iterator.return when the client cancels', async () => {
    const returnSpy = jest
      .fn()
      .mockResolvedValue({ done: true as const, value: undefined });
    let count = 0;
    const iterable: AsyncIterable<string> = {
      [Symbol.asyncIterator]() {
        return {
          next: () => Promise.resolve({ done: false as const, value: `chunk${count++}` }),
          return: returnSpy,
        };
      },
    };
    mockAnalyzeAssetStream.mockReturnValue(iterable);

    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);
    await res.body!.cancel();

    expect(returnSpy).toHaveBeenCalled();
  });

  it('forwards a valid x-ai-analysis-mode header as requestedMode', async () => {
    mockAnalyzeAssetStream.mockReturnValue(iterableOf(['ok']));
    const req = new Request('http://localhost/api/ai-analysis/BTC', {
      method: 'POST',
      headers: { 'x-ai-analysis-mode': 'mock' },
    });
    const ctx = { params: Promise.resolve({ symbol: 'BTC' }) };

    await POST(req, ctx);

    expect(mockAnalyzeAssetStream).toHaveBeenCalledWith('BTC', { requestedMode: 'mock' });
  });

  it('passes requestedMode undefined when the header is absent or invalid', async () => {
    mockAnalyzeAssetStream.mockReturnValue(iterableOf(['ok']));
    const req = new Request('http://localhost/api/ai-analysis/BTC', {
      method: 'POST',
      headers: { 'x-ai-analysis-mode': 'bogus' },
    });
    const ctx = { params: Promise.resolve({ symbol: 'BTC' }) };

    await POST(req, ctx);

    expect(mockAnalyzeAssetStream).toHaveBeenCalledWith('BTC', { requestedMode: undefined });
  });

  it('returns 400 for an invalid symbol without invoking the stream', async () => {
    const [req, ctx] = makeRequest('A'.repeat(21));
    const res = await POST(req, ctx);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid symbol parameter');
    expect(mockAnalyzeAssetStream).not.toHaveBeenCalled();
  });

  it('returns 429 for RateLimited errors thrown before the first chunk', async () => {
    mockAnalyzeAssetStream.mockReturnValue(
      rejectingIterable(new ExternalException({ kind: 'RateLimited' }, 'Too many requests')),
    );
    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);

    expect(res.status).toBe(429);
    expect((await res.json()).error).toBe('Too many requests');
  });

  it('returns 400 for InvalidRequest errors thrown before the first chunk', async () => {
    mockAnalyzeAssetStream.mockReturnValue(
      rejectingIterable(new ExternalException({ kind: 'InvalidRequest' }, 'Missing API key')),
    );
    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Missing API key');
  });

  it('returns 502 for Unavailable errors thrown before the first chunk', async () => {
    mockAnalyzeAssetStream.mockReturnValue(
      rejectingIterable(new ExternalException({ kind: 'Unavailable' }, 'OpenAI down')),
    );
    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);

    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe('OpenAI down');
  });

  it('returns 502 for untyped errors thrown before the first chunk', async () => {
    mockAnalyzeAssetStream.mockReturnValue(rejectingIterable(new Error('Something broke')));
    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);

    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe('Upstream unavailable');
  });

  it('surfaces a mid-stream error by failing the response body', async () => {
    mockAnalyzeAssetStream.mockReturnValue(
      failAfterFirst('Partial analysis ', new Error('stream blew up')),
    );
    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);

    // Headers were already sent with the first chunk, so the status stays 200
    // but reading the full body rejects rather than completing silently.
    expect(res.status).toBe(200);
    await expect(res.text()).rejects.toThrow();
  });
});
