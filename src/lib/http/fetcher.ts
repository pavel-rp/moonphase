import { setTimeout as sleep } from 'node:timers/promises';
import { ExternalException } from '@/lib/errors';

export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new ExternalException({ kind: 'Unavailable', details: { timeoutMs: ms } }, `Timeout after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]);
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  { retries = 2, delayMs = 300, timeoutMs = 10_000 }: { retries?: number; delayMs?: number; timeoutMs?: number } = {},
): Promise<Response> {
  let attempt = 0;
  while (true) {
    try {
      const resp = await withTimeout(fetch(input, init), timeoutMs);
      if (resp && 'ok' in resp && !resp.ok && resp.status >= 500 && attempt < retries) {
        throw new Error(`HTTP ${resp.status}`);
      }
      return resp;
    } catch (err) {
      if (attempt >= retries) throw err;
      attempt += 1;
      await sleep(delayMs);
    }
  }
}