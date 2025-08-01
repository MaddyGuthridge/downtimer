import { describe, expect, it, test, vi } from 'vitest';
import { downtimer } from '../src';
import { optionsNoLogging, sleep } from './util';

/** Maximum acceptable variance in timers is 10ms */
const MIN_VARIANCE = 10;

/** Short timer is 5ms */
const SHORT = 5;
/** After this time, short timer definitely should have fired */
const AFTER_SHORT = SHORT + MIN_VARIANCE;

/** Long timer is 15ms */
const LONG = 15;
/** Before this time, long timer definitely shouldn't have fired */
const BEFORE_LONG = LONG - MIN_VARIANCE;
/** Before this time, long timer definitely should have fired */
const AFTER_LONG = LONG + MIN_VARIANCE;

describe('Scheduler', () => {
  it.concurrent('Schedules timers', async () => {
    const dt = downtimer(optionsNoLogging);
    const callback = vi.fn();
    dt.schedule(callback, LONG);
    await sleep(AFTER_LONG);
    expect(callback).toBeCalledTimes(1);
  });

  test.concurrent("Callbacks aren't called until their scheduled time", async () => {
    const dt = downtimer(optionsNoLogging);
    const callback = vi.fn();
    dt.schedule(callback, LONG);
    await sleep(BEFORE_LONG);
    expect(callback).not.toBeCalled();
  });

  it.concurrent('Allows timers to be cleared', async () => {
    const dt = downtimer(optionsNoLogging);
    const callback = vi.fn();
    const timer = dt.schedule(callback, LONG);
    await sleep(BEFORE_LONG);

    // Cancel timer
    dt.clear(timer);

    // Wait for when the timer would have been fired
    await sleep(AFTER_LONG - BEFORE_LONG);

    expect(callback).not.toBeCalled();
  });

  it.concurrent('Allows all timers to be cleared', async () => {
    const dt = downtimer(optionsNoLogging);
    const callbacks = [vi.fn(), vi.fn(), vi.fn()];

    callbacks.forEach(cb => dt.schedule(cb, SHORT));

    dt.clearAll();

    await sleep(AFTER_SHORT);

    callbacks.forEach(cb => {
      expect(cb).not.toBeCalled();
    });
  });

  test.concurrent('Clearing an already-fired timer is a no-op', async () => {
    const dt = downtimer(optionsNoLogging);
    const timer = dt.schedule(() => {}, SHORT);
    await sleep(AFTER_SHORT);
    dt.clear(timer);
  });

  test.concurrent("Clearing a timer doesn't clear other timers", async () => {
    const dt = downtimer(optionsNoLogging);
    // First timer gets cancelled
    const timer1 = dt.schedule(() => {}, LONG);
    // Second timer not cancelled
    const callback = vi.fn();
    dt.schedule(callback, LONG);

    dt.clear(timer1);

    await sleep(AFTER_LONG);
    expect(callback).toBeCalled();
  });
});
