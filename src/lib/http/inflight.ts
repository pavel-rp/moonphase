interface InflightCall {
  promise: Promise<unknown>;
  controller: AbortController;
  /** Callers still waiting; a caller without a signal never leaves. */
  holders: number;
}

const inflight = new Map<string, InflightCall>();

export function inflightKey(url: string, params?: unknown): string {
  return `${url}:${JSON.stringify(params)}`;
}

/**
 * Shares one in-flight call per key between concurrent callers.
 *
 * `fn` receives a signal that aborts only once every caller sharing the call
 * has aborted, so one client leaving never cancels the fetch another still
 * needs. A caller's own promise rejects with its signal's reason as soon as
 * that signal aborts.
 */
export function dedupe<T>(
  key: string,
  fn: (signal: AbortSignal) => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  if (signal?.aborted) return Promise.reject(signal.reason);

  let call = inflight.get(key);
  if (!call) {
    const controller = new AbortController();
    const created: InflightCall = {
      promise: fn(controller.signal).finally(() => {
        if (inflight.get(key) === created) inflight.delete(key);
      }),
      controller,
      holders: 0,
    };
    inflight.set(key, created);
    call = created;
  }
  call.holders += 1;

  const shared = call;
  const promise = shared.promise as Promise<T>;
  if (!signal) return promise;

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      reject(signal.reason);
      shared.holders -= 1;
      if (shared.holders === 0) {
        // Nobody is waiting any more: drop the entry so a later caller starts
        // afresh, and cancel the upstream work.
        if (inflight.get(key) === shared) inflight.delete(key);
        shared.controller.abort(signal.reason);
      }
    };
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (err) => {
        signal.removeEventListener('abort', onAbort);
        reject(err);
      },
    );
  });
}
