/** @jest-environment node */

import { dedupe } from '../inflight';

/** A shared call that settles only when told to, recording the signal it got. */
function deferredCall() {
  let resolve!: (value: string) => void;
  const signals: AbortSignal[] = [];
  const fn = jest.fn((signal: AbortSignal) => {
    signals.push(signal);
    return new Promise<string>((res, rej) => {
      resolve = res;
      signal.addEventListener('abort', () => rej(signal.reason), { once: true });
    });
  });
  return { fn, signals, resolve: (value: string) => resolve(value) };
}

let n = 0;
const freshKey = () => `test:${n++}`;

describe('dedupe', () => {
  it('shares one call between concurrent callers', async () => {
    const key = freshKey();
    const call = deferredCall();

    const a = dedupe(key, call.fn);
    const b = dedupe(key, call.fn);
    call.resolve('value');

    await expect(Promise.all([a, b])).resolves.toEqual(['value', 'value']);
    expect(call.fn).toHaveBeenCalledTimes(1);
  });

  it('keeps the shared call running for the others when one caller aborts', async () => {
    const key = freshKey();
    const call = deferredCall();
    const leaving = new AbortController();
    const reason = new Error('client left');

    const a = dedupe(key, call.fn, leaving.signal);
    const b = dedupe(key, call.fn, new AbortController().signal);
    leaving.abort(reason);
    call.resolve('value');

    await expect(a).rejects.toBe(reason);
    await expect(b).resolves.toBe('value');
    expect(call.signals[0].aborted).toBe(false);
  });

  it('cancels the shared call once every caller has aborted', async () => {
    const key = freshKey();
    const call = deferredCall();
    const first = new AbortController();
    const second = new AbortController();

    const a = dedupe(key, call.fn, first.signal);
    const b = dedupe(key, call.fn, second.signal);
    first.abort(new Error('first left'));
    second.abort(new Error('second left'));

    await expect(a).rejects.toThrow('first left');
    await expect(b).rejects.toThrow('second left');
    expect(call.signals[0].aborted).toBe(true);

    // The cancelled call is not reused: a later caller starts afresh.
    const next = deferredCall();
    const c = dedupe(key, next.fn);
    next.resolve('fresh');
    await expect(c).resolves.toBe('fresh');
  });

  it('never cancels a call that a caller without a signal shares', async () => {
    const key = freshKey();
    const call = deferredCall();
    const leaving = new AbortController();

    const a = dedupe(key, call.fn, leaving.signal);
    const b = dedupe(key, call.fn);
    leaving.abort(new Error('client left'));
    call.resolve('value');

    await expect(a).rejects.toThrow('client left');
    await expect(b).resolves.toBe('value');
    expect(call.signals[0].aborted).toBe(false);
  });

  it('rejects at once, without starting a call, for an already-aborted signal', async () => {
    const call = deferredCall();
    const controller = new AbortController();
    const reason = new Error('gone');
    controller.abort(reason);

    await expect(dedupe(freshKey(), call.fn, controller.signal)).rejects.toBe(reason);
    expect(call.fn).not.toHaveBeenCalled();
  });
});
