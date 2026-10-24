import { setTimeout as sleep } from 'node:timers/promises';
import { ExternalException } from '@/lib/errors';

function timeoutError(ms: number): ExternalException {
  return new ExternalException({ kind: 'Unavailable', details: { timeoutMs: ms } }, `Timeout after ${ms}ms`);
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  { retries = 2, delayMs = 300, timeoutMs = 10_000 }: { retries?: number; delayMs?: number; timeoutMs?: number } = {},
): Promise<Response> {
  let attempt = 0;
  while (true) {
    // Each attempt gets its own controller: a timed-out request is aborted
    // rather than left running beside its retry (piling requests onto an
    // already struggling, rate-limited upstream), and the timer is cleared as
    // soon as the response headers arrive so it never cuts off the body read.
    // Passing a signal opts the fetch out of React's per-render fetch dedupe;
    // the adapters' in-flight `dedupe()` and Next's data cache (`revalidate`)
    // still cover repeated identical requests.
    const controller = new AbortController();
    const signal = init.signal ? AbortSignal.any([init.signal, controller.signal]) : controller.signal;
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(input, { ...init, signal });
      if (resp && 'ok' in resp && !resp.ok && resp.status >= 500 && attempt < retries) {
        // Release the discarded response's connection and buffer before
        // retrying. Not awaited: a body's cancel can stay pending (msw's
        // mocked bodies never settle it), and starting it is what frees them.
        void resp.body?.cancel().catch(() => {});
        throw new Error(`HTTP ${resp.status}`);
      }
      return resp;
    } catch (err) {
      // A caller-initiated abort is final; don't retry it.
      if (init.signal?.aborted) throw err;
      if (attempt >= retries) throw controller.signal.aborted ? timeoutError(timeoutMs) : err;
      attempt += 1;
      await sleep(delayMs);
    } finally {
      clearTimeout(timer);
    }
  }
}
