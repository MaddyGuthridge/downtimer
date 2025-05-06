import { describe, expect, it, vi } from 'vitest';
import { downtimer } from '../src';
import { sleep } from './util';

describe('Scheduler', () => {
  it('Schedules timers', async () => {
    const dt = downtimer();
    const callback = vi.fn();
    dt.schedule(callback, 10);
    await sleep(15);
    expect(callback).toBeCalledTimes(1);
  });

  it.only('Allows timers to be cleared', async () => {
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
});
