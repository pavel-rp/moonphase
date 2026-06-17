/**
 * Fan-out for a single async-iterable source.
 *
 * A broadcaster drives ONE source `AsyncIterable<string>` (e.g. one upstream
 * model stream) and lets many consumers each replay the buffered prefix and
 * then subscribe to live chunks. The source is pulled exactly once regardless
 * of how many consumers attach — this is what lets concurrent identical
 * requests share a single upstream call.
 *
 * Lifecycle:
 * - The source starts on the first `subscribe()` pull, not when the broadcaster
 *   is created (so creating one is cheap and side-effect free).
 * - Consumers are ref-counted. The source is canceled (its iterator `.return()`
 *   is called) only when the last consumer detaches *before* the source has
 *   finished — a single consumer disconnecting never kills a stream others are
 *   still reading. The port takes no abort signal, so iterator `.return()` is
 *   the cancellation mechanism.
 * - `onComplete` fires once, only on natural completion of the source (not on
 *   error, not on cancellation), with the full concatenated text. This is the
 *   single place a caller should persist a successful result.
 * - A source error is surfaced to every subscriber (each `subscribe()` loop
 *   rethrows after draining what it had buffered), so callers never treat a
 *   failed run as success.
 */

export interface StreamBroadcaster {
  /**
   * Replay the buffered prefix, then yield live chunks until done or error.
   * Returns `null` if the broadcaster is no longer joinable — canceled (its
   * last consumer detached and the source was stopped) or errored (the source
   * already failed). In both cases the caller must start a fresh upstream
   * rather than replay a truncated buffer or a cached failure. (Consumers that
   * are already attached when the error lands still receive the error.)
   *
   * The returned iterable reserves a consumer slot synchronously; the caller
   * MUST drive it (at least one `.next()`, e.g. via `yield*` or `for await`) so
   * the slot is released in its `finally`. Abandoning it unpulled leaks the
   * slot and pins the source open.
   */
  subscribe(): AsyncIterable<string> | null;
  /** Resolves when the source settles (completed, errored, or canceled). */
  readonly settled: Promise<void>;
}

export interface BroadcasterCallbacks {
  /** Called once on successful, natural completion with the full text. */
  onComplete?: (fullText: string) => void;
}

export function createStreamBroadcaster(
  source: AsyncIterable<string>,
  callbacks: BroadcasterCallbacks = {},
): StreamBroadcaster {
  const buffer: string[] = [];
  let waiters: Array<() => void> = [];
  let done = false;
  let errored = false;
  let error: unknown;
  let started = false;
  let canceled = false;
  let consumers = 0;
  let sourceIterator: AsyncIterator<string> | undefined;

  let resolveSettled: () => void;
  const settled = new Promise<void>((resolve) => {
    resolveSettled = resolve;
  });

  function notify(): void {
    const pending = waiters;
    waiters = [];
    for (const resolve of pending) resolve();
  }

  async function pump(): Promise<void> {
    sourceIterator = source[Symbol.asyncIterator]();
    try {
      while (true) {
        const next = await sourceIterator.next();
        // A consumer may have detached and canceled us while we awaited; drop
        // the in-flight chunk and stop rather than buffering past cancellation.
        if (canceled) break;
        if (next.done) {
          callbacks.onComplete?.(buffer.join(''));
          break;
        }
        buffer.push(next.value);
        notify();
      }
    } catch (err) {
      errored = true;
      error = err;
    } finally {
      done = true;
      notify();
      resolveSettled();
    }
  }

  function startIfNeeded(): void {
    if (started) return;
    started = true;
    void pump();
  }

  function maybeCancel(): void {
    if (consumers === 0 && started && !done && !canceled) {
      canceled = true;
      // Best-effort: stop the source from doing further work. Errors from
      // return() (e.g. a generator already settling) are irrelevant here.
      void Promise.resolve(sourceIterator?.return?.()).catch(() => {});
    }
  }

  function subscribe(): AsyncIterable<string> | null {
    // A canceled or already-errored broadcaster is not joinable: a new caller
    // must start a fresh upstream instead of replaying a truncated buffer or
    // re-throwing a failure (errors are never cached).
    if (canceled || errored) return null;
    // Reserve the consumer slot synchronously, at subscribe() time rather than
    // on the first pull, so a just-subscribed consumer that has not pulled yet
    // still prevents a concurrently-detaching consumer from canceling the
    // source. (A completed/errored broadcaster can still be joined — a late
    // subscriber replays the buffer and then sees the terminal state.)
    consumers++;
    startIfNeeded();
    return iterate();
  }

  async function* iterate(): AsyncIterable<string> {
    let index = 0;
    try {
      while (true) {
        while (index < buffer.length) {
          yield buffer[index++];
        }
        // Buffer fully drained: only now surface terminal state, so a late
        // subscriber still replays every buffered chunk before the end/error.
        if (errored) throw error;
        if (done) return;
        await new Promise<void>((resolve) => waiters.push(resolve));
      }
    } finally {
      consumers--;
      maybeCancel();
    }
  }

  return { subscribe, settled };
}
