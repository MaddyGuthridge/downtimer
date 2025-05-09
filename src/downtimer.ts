import pino, { Logger } from 'pino';
import { DowntimerOptions, TimerCallback, TimerId } from './types';
import { nanoid } from 'nanoid/non-secure';

/** Internal timer info type */
export type TimerInfo = {
  /** The callback to call when the timer fires */
  callback: () => void,
  /** The UNIX timestamp (in ms) when the timer was scheduled */
  scheduledAt: number,
  /** The UNIX timestamp (in ms) for when the timer should fire */
  scheduledFor: number,
  /** User-facing timer ID */
  externalId: TimerId,
  /** Internal timer ID */
  internalId: ReturnType<typeof setTimeout>,
  /** Whether this timer has been run */
  executed: boolean,
}

/** Default options for Downtimer */
const defaultOptions: DowntimerOptions = {
  clearAllOnExit: true,
};

/** The Downtimer class, which acts as a timer manager */
export class Downtimer {
  /** Options for the manager */
  #options: DowntimerOptions;
  /** Internal mapping of timers */
  #timers: Record<TimerId, TimerInfo>;
  /** Pino logger */
  #log: Logger;

  /** Create a new instance of the Downtimer manager. */
  constructor(options: Partial<DowntimerOptions> = {}) {
    this.#options = { ...defaultOptions, ...options };
    this.#timers = {};
    this.#log = pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    });

    if (this.#options.clearAllOnExit) {
      process.on('exit', code => this.clearAll(`process exiting with code ${code}`));
    }
  }

  /**
   * Callback for when a timer fires.
   */
  #onTimer(timerId: TimerId) {
    const timer = this.#timers[timerId];

    if (!timer) {
      return;
    }

    this.#log.debug(`Executing callback for timer with ID '${timerId}'`);
    timer.executed = true;
    try {
      timer.callback();
    } catch (e) {
      this.#log.error(e, `Error in timer with ID '${timerId}'`);
    }
  }

  /**
   * Schedule a callback function to be executed after the given amount of time has elapsed. This
   * function returns immediately, meaning that the scheduled callback will be executed after any
   * following code.
   *
   * @param callback callback function to schedule
   * @param ms amount of time to wait before calling the callback.
   * @returns a timer ID which can be used to cancel the timer.
   */
  schedule(callback: TimerCallback, ms: number): TimerId {
    const externalId = nanoid() satisfies TimerId;
    const internalId = setTimeout(() => this.#onTimer(externalId), ms);

    const options: TimerInfo = {
      callback,
      scheduledAt: Date.now(),
      scheduledFor: Date.now() + ms,
      externalId,
      internalId,
      executed: false,
    };

    this.#timers[externalId] = options;

    return externalId;
  }

  /**
   * Cancel the scheduled callback function associated with the given timer ID. If the callback
   * hasn't been run yet, it will be cancelled and will never run. If the callback has already been
   * run, a warning will be logged.
   *
   * @param timerId ID of timer to cancel
   */
  clear(timerId: TimerId) {
    const timer = this.#timers[timerId];

    if (!timer) {
      this.#log.warn(`Timer with ID '${timerId}' not found`);
      return;
    }
    if (timer.executed) {
      this.#log.info(`Cannot clear timer with ID '${timerId}' because it has already fired`);
      return;
    }

    this.#log.debug(`Timer with ID '${timerId}' cleared`);
    clearTimeout(timer.internalId);
    delete this.#timers[timerId];
  }

  /**
   * Cancel all outstanding callback functions.
   */
  clearAll(reason = '') {
    this.#log.info(`Clear all timers. Reason: '${reason}'`);
    for (const [_timerId, timer] of Object.entries(this.#timers)) {
      if (!timer.executed) {
        clearTimeout(timer.internalId);
      }
    }
    this.#timers = {};
  }
}

/** Create a new instance of the Downtimer manager. */
export function downtimer(options: Partial<DowntimerOptions> = {}) {
  return new Downtimer(options);
}
