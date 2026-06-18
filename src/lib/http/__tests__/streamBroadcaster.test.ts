/** @jest-environment node */
import { createStreamBroadcaster } from '@/lib/http/streamBroadcaster';

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function collect(stream: AsyncIterable<string>): Promise<string[]> {
  const out: string[] = [];
  for await (const chunk of stream) out.push(chunk);
  return out;
}

/**
 * A hand-driven async source: chunks/end/error are delivered on demand so tests
 * control exactly when the source advances, and `.return()` resolves any pending
 * `.next()` the way a real async generator does.
 */
function manualSource() {
  let iterCount = 0;
  let returned = false;
  type Item =
    | { type: 'next'; value: string }
    | { type: 'end' }
    | { type: 'error'; error: unknown };
  const queued: Item[] = [];
  let pending: { resolve: (r: IteratorResult<string>) => void; reject: (e: unknown) => void } | null = null;

  function settle(item: Item, resolve: (r: IteratorResult<string>) => void, reject: (e: unknown) => void) {
    if (item.type === 'next') resolve({ done: false, value: item.value });
    else if (item.type === 'end') resolve({ done: true, value: undefined });
    else reject(item.error);
  }

  function deliver(item: Item) {
    if (pending) {
      const p = pending;
      pending = null;
      settle(item, p.resolve, p.reject);
    } else {
      queued.push(item);
    }
  }

  const iterator: AsyncIterator<string> = {
    next() {
      if (queued.length) {
        return new Promise((resolve, reject) => settle(queued.shift()!, resolve, reject));
      }
      return new Promise((resolve, reject) => {
        pending = { resolve, reject };
      });
    },
    return() {
      returned = true;
      if (pending) {
        const p = pending;
        pending = null;
        p.resolve({ done: true, value: undefined });
      }
      return Promise.resolve({ done: true, value: undefined });
    },
  };

  return {
    source: {
      [Symbol.asyncIterator]() {
        iterCount++;
        return iterator;
      },
    } as AsyncIterable<string>,
    push: (value: string) => deliver({ type: 'next', value }),
    end: () => deliver({ type: 'end' }),
    error: (error: unknown) => deliver({ type: 'error', error }),
    isReturned: () => returned,
    iterCount: () => iterCount,
  };
}

describe('createStreamBroadcaster', () => {
  it('drives the source once and fans every chunk out to all subscribers', async () => {
    const src = manualSource();
    const bc = createStreamBroadcaster(src.source);

    const r1 = collect(bc.subscribe()!);
    const r2 = collect(bc.subscribe()!);

    src.push('a');
    src.push('b');
    src.end();

    expect(await r1).toEqual(['a', 'b']);
    expect(await r2).toEqual(['a', 'b']);
    // Source iterated exactly once despite two consumers.
    expect(src.iterCount()).toBe(1);
  });

  it('replays the buffered prefix to a late subscriber, then live chunks', async () => {
    const src = manualSource();
    const bc = createStreamBroadcaster(src.source);

    const out1: string[] = [];
    const reader1 = (async () => {
      for await (const c of bc.subscribe()!) out1.push(c);
    })();

    src.push('a');
    await tick();
    src.push('b');
    await tick();

    // Late subscriber joins after 'a','b' are buffered.
    const out2: string[] = [];
    const reader2 = (async () => {
      for await (const c of bc.subscribe()!) out2.push(c);
    })();
    await tick();

    src.push('c');
    src.end();

    await Promise.all([reader1, reader2]);
    expect(out1).toEqual(['a', 'b', 'c']);
    // Late subscriber replays the prefix then receives the remaining live chunk.
    expect(out2).toEqual(['a', 'b', 'c']);
  });

  it('propagates a mid-stream error to every subscriber and does not complete', async () => {
    const src = manualSource();
    const onComplete = jest.fn();
    const bc = createStreamBroadcaster(src.source, { onComplete });

    const r1 = collect(bc.subscribe()!);
    const r2 = collect(bc.subscribe()!);

    src.push('a');
    src.error(new Error('boom'));

    await expect(r1).rejects.toThrow('boom');
    await expect(r2).rejects.toThrow('boom');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('invokes onComplete once with the full text on natural completion', async () => {
    const src = manualSource();
    const onComplete = jest.fn();
    const bc = createStreamBroadcaster(src.source, { onComplete });

    const reader = collect(bc.subscribe()!);
    src.push('Hello, ');
    src.push('world');
    src.end();
    await reader;

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('Hello, world');
  });

  it('cancels the source only when the last consumer detaches', async () => {
    const src = manualSource();
    const bc = createStreamBroadcaster(src.source);

    const it1 = bc.subscribe()![Symbol.asyncIterator]();
    const it2 = bc.subscribe()![Symbol.asyncIterator]();

    src.push('a');
    await it1.next();
    await it2.next();

    // First consumer leaves — source must stay alive for the second.
    await it1.return!();
    expect(src.isReturned()).toBe(false);

    // Last consumer leaves — now the source is canceled.
    await it2.return!();
    expect(src.isReturned()).toBe(true);

    // A canceled broadcaster refuses new joiners.
    expect(bc.subscribe()).toBeNull();
  });

  it('honors return() and cancels a silent source while parked awaiting the next chunk', async () => {
    const src = manualSource();
    const bc = createStreamBroadcaster(src.source);

    const it = bc.subscribe()![Symbol.asyncIterator]();
    src.push('a');
    await it.next(); // receives 'a'

    // Pull again with no further chunks: the generator parks on the internal
    // wait while the source stays silent.
    const pending = it.next();
    await tick();

    // Disconnect while parked. The periodic wake must let return() run the
    // generator's finally so the last-consumer cancellation fires.
    const ret = it.return!();
    await Promise.all([ret, pending.catch(() => undefined)]);

    expect(src.isReturned()).toBe(true);
  });

  it('refuses new joiners after the source has errored', async () => {
    const src = manualSource();
    const bc = createStreamBroadcaster(src.source);

    const r1 = collect(bc.subscribe()!);
    src.error(new Error('nope'));
    await expect(r1).rejects.toThrow('nope');

    expect(bc.subscribe()).toBeNull();
  });
});
