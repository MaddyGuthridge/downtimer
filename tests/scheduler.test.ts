import { describe, expect, it, test, vi } from 'vitest';
import { downtimer } from '../src';
import { sleep } from './util';

describe('Scheduler', () => {
  it.concurrent('Schedules timers', async () => {
    const dt = downtimer();
    const callback = vi.fn();
    dt.schedule(callback, 10);
    await sleep(15);
    expect(callback).toBeCalledTimes(1);
  });

  test.concurrent("Callbacks aren't called until their scheduled time", async () => {
    const dt = downtimer();
    const callback = vi.fn();
    dt.schedule(callback, 10);
    await sleep(5);
    expect(callback).not.toBeCalled();
  });

  it.concurrent('Allows timers to be cleared', async () => {
    const dt = downtimer();
    const callback = vi.fn();
    const timer = dt.schedule(callback, 10);
    await sleep(5);

    // Cancel timer
    dt.clear(timer);

    // Wait for when the timer would have been fired
    await sleep(10);

    expect(callback).not.toBeCalled();
  });

  it.concurrent('Allows all timers to be cleared', async () => {
    const dt = downtimer();
    const callbacks = [vi.fn(), vi.fn(), vi.fn()];

    callbacks.forEach(cb => dt.schedule(cb, 5));

    dt.clearAll();

    await sleep(10);

    callbacks.forEach(cb => {
      expect(cb).not.toBeCalled();
    });
  });

  test.concurrent('Clearing an already-fired timer is a no-op', async () => {
    const dt = downtimer();
    const timer = dt.schedule(() => {}, 5);
    await sleep(10);
    dt.clear(timer);
  });

  test.concurrent("Clearing a timer doesn't clear other timers", async () => {
    const dt = downtimer();
    // First timer gets cancelled
    const timer1 = dt.schedule(() => {}, 5);
    // Second timer not cancelled
    const callback = vi.fn();
    dt.schedule(callback, 5);

    dt.clear(timer1);
    await sleep(10);
    expect(callback).toBeCalled();
  });
});
