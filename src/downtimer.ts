import { TimerCallback, TimerId } from './types';
import { nanoid } from 'nanoid/non-secure';

type TimerOptions = {
  /** The callback to call when the timer fires */
  callback: () => void,
  /** The UNIX timestamp (in ms) when the timer was scheduled */
  scheduledAt: number,
  /** The UNIX timestamp (in ms) for when the timer should fire */
  scheduledFor: number,
  /** Internal timer ID */
  internalId: ReturnType<typeof setTimeout>,
}

export class Downtimer {
  #timers: Record<TimerId, TimerOptions | undefined>;

  constructor() {
    this.#timers = {};
  }

  #onTimer(timerId: TimerId) {
    const timer = this.#timers[timerId];

    if (!timer) {
      return;
    }

    console.log('Timer called');
    try {
      timer.callback();
    } catch (e) {
      console.error(`Error in timer with ID '${timerId}'`);
      console.error(e);
    }

    delete this.#timers[timerId];
  }

  schedule(callback: TimerCallback, ms: number): TimerId {
    const publicId = nanoid() satisfies TimerId;
    const internalId = setTimeout(() => this.#onTimer(publicId), ms);

    const options: TimerOptions = {
      callback,
      scheduledAt: Date.now(),
      scheduledFor: Date.now() + ms,
      internalId,
    };

    this.#timers[publicId] = options;

    return publicId;
  }

  clear(timerId: TimerId) {
    const timer = this.#timers[timerId];

    if (!timer) {
      console.log(this.#timers);
      console.log('Timer not found');
      return;
    }

    console.log('Timer cleared');
    clearTimeout(timer.internalId);
  }

  clearAll() {
    for (const [timerId, timer] of Object.entries(this.#timers)) {
      if (timer) {
        console.log(`Cancel timer with ID '${timerId}'`)
        clearTimeout(timer.internalId);
      }
    }
  }
}

export function downtimer() {
  return new Downtimer();
}
