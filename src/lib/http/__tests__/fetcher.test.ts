/** @jest-environment node */

import { fetchWithRetry } from '../fetcher';

const okResponse = () => ({ ok: true, status: 200 }) as Response;

/** A fetch that never settles on its own, only rejecting when its signal aborts. */
function hangingFetch(signals: AbortSignal[]) {
  return (_input: unknown, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      const signal = init!.signal!;
      signals.push(signal);
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), {
        once: true,
      });
    });
}

describe('fetchWithRetry', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  it('returns the response and leaves no timer behind', async () => {
    jest.useFakeTimers();
    fetchMock.mockResolvedValue(okResponse());

    await expect(fetchWithRetry('https://example.test')).resolves.toMatchObject({ ok: true });
    expect(jest.getTimerCount()).toBe(0);
  });

  it('aborts a timed-out attempt before retrying, then rejects with a timeout error', async () => {
    const signals: AbortSignal[] = [];
    fetchMock.mockImplementation(hangingFetch(signals));

    await expect(
      fetchWithRetry('https://example.test', {}, { retries: 1, delayMs: 0, timeoutMs: 10 }),
    ).rejects.toMatchObject({ name: 'ExternalException', kind: 'Unavailable', message: 'Timeout after 10ms' });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(signals.every((s) => s.aborted)).toBe(true);
  });

  it('retries a 5xx and returns the later success', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
      .mockResolvedValueOnce(okResponse());

    await expect(fetchWithRetry('https://example.test', {}, { delayMs: 0 })).resolves.toMatchObject({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry when the caller aborts', async () => {
    const signals: AbortSignal[] = [];
    fetchMock.mockImplementation(hangingFetch(signals));
    const caller = new AbortController();

    const pending = fetchWithRetry('https://example.test', { signal: caller.signal }, { delayMs: 0 });
    caller.abort();

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
