import { setTimeout as sleep } from 'node:timers/promises';

export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Timeout after ${ms}ms`));
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
  // eslint-disable-next-line no-constant-condition
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