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
 * - The source starts on the first `subscribe()`, not when the broadcaster is
 *   created (so creating one is cheap and side-effect free).
 * - Consumers are ref-counted. The source is canceled (its iterator `.return()`
 *   is called) only when the last consumer detaches *before* the source has
 *   finished — a single consumer disconnecting never kills a stream others are
 *   still reading. The port takes no abort signal, so iterator `.return()` is
 *   the cancellation mechanism.
 * - Each subscriber is a hand-rolled async iterator whose `return()` detaches
 *   the consumer (decrement + maybe-cancel) SYNCHRONOUSLY. A native async
 *   generator parked at `await` cannot run its `finally` until the awaited
 *   promise settles, so a queued `.return()` on a silent source would never
 *   release the slot; an explicit `return()` method avoids that trap.
 * - `onComplete` fires once, only on natural completion of the source (not on
 *   error, not on cancellation), with the full concatenated text. This is the
 *   single place a caller should persist a successful result.
 * - A source error is surfaced to every subscriber (each `next()` rethrows
 *   after draining what it had buffered), so callers never treat a failed run
 *   as success.
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
   * Reserves a consumer slot synchronously. The slot is released when the
   * returned iterator completes, throws, or its `return()` is called (e.g. a
   * `for await` that breaks, or the route canceling its stream on client
   * disconnect).
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
  let done = false;
  let errored = false;
  let error: unknown;
  let started = false;
  let canceled = false;
  let consumers = 0;
  let sourceIterator: AsyncIterator<string> | undefined;

  // A single re-armable promise all parked subscribers await; `notify()` resolves
  // the current one and arms the next. (Assigned synchronously in the executors
  // below, so the definite-assignment assertions are safe.)
  let triggerWake!: () => void;
  let wakeup = new Promise<void>((resolve) => {
    triggerWake = resolve;
  });

  let resolveSettled!: () => void;
  const settled = new Promise<void>((resolve) => {
    resolveSettled = resolve;
  });

  // Wake every parked subscriber (new chunk, terminal state, or a detach so a
  // parked next() can resolve to done), then arm a fresh promise for the next.
  function notify(): void {
    const resolve = triggerWake;
    wakeup = new Promise<void>((next) => {
      triggerWake = next;
    });
    resolve();
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

    let index = 0;
    let detached = false;

    // Release this consumer's slot exactly once. Called from return() (caller
    // disconnect) and from next() on terminal state. Crucially this runs
    // synchronously in return(), so it does not depend on a parked next()
    // completing — which a native generator's finally could not guarantee.
    function detach(): void {
      if (detached) return;
      detached = true;
      consumers--;
      maybeCancel();
      // Wake any parked next() so it can observe `detached`/terminal and resolve.
      notify();
    }

    const iterator: AsyncIterator<string> = {
      async next(): Promise<IteratorResult<string>> {
        while (true) {
          if (index < buffer.length) {
            return { done: false, value: buffer[index++] };
          }
          // Buffer fully drained: a late subscriber has now replayed every
          // buffered chunk before seeing the terminal state.
          if (detached) return { done: true, value: undefined };
          if (errored) {
            detach();
            throw error;
          }
          if (done) {
            detach();
            return { done: true, value: undefined };
          }
          await wakeup;
        }
      },
      async return(): Promise<IteratorResult<string>> {
        detach();
        return { done: true, value: undefined };
      },
    };

    return { [Symbol.asyncIterator]: () => iterator };
  }

  return { subscribe, settled };
}
