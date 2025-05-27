import { DeepPartial, TimerCallback, TimerId } from './types';
import { defaultOptions, DowntimerOptions, mergeDeepPartial } from './options';
import { nanoid } from 'nanoid/non-secure';
import { logBeforeExecute, logClearAll, logClearNotFound, logClearOnExit, logClearSuccess, logErrorInExecute, logSchedule } from './log';
import { getStackTrace, StackFrame } from './stackTrace';

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
  /** Stack trace of the code that scheduled the timer */
  scheduleStackTrace: StackFrame[],
}

/** The Downtimer class, which acts as a timer manager */
export class Downtimer {
  /** Options for the manager */
  #options: DowntimerOptions;
  /** Internal mapping of timers */
  #timers: Record<TimerId, TimerInfo>;

  /** Create a new instance of the Downtimer manager. */
  constructor(options: DeepPartial<DowntimerOptions> = {}) {
    this.#options = mergeDeepPartial(defaultOptions, options);
    this.#timers = {};

    process.on('exit', code => this.#onExit(code));
  }

  /**
   * Callback for when a timer fires.
   */
  #onTimer(timerId: TimerId) {
    const timer = this.#timers[timerId];

    if (!timer) {
      return;
    }

    logBeforeExecute(this.#options.logConfig.execute.before, timer);

    delete this.#timers[timerId];
    try {
      timer.callback();
    } catch (e: unknown) {
      logErrorInExecute(
        this.#options.logConfig.execute.onError,
        timer,
        e,
      );
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
    const scheduleStackTrace = getStackTrace();

    const options: TimerInfo = {
      callback,
      scheduledAt: Date.now(),
      scheduledFor: Date.now() + ms,
      externalId,
      internalId,
      scheduleStackTrace,
    };

    this.#timers[externalId] = options;

    logSchedule(this.#options.logConfig.schedule, options);

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
      logClearNotFound(this.#options.logConfig.clear.notFound, timerId);
      return;
    }

    logClearSuccess(this.#options.logConfig.clear.success, timer);
    clearTimeout(timer.internalId);
    delete this.#timers[timerId];
  }

  /**
   * Cancel all outstanding callback functions.
   */
  clearAll() {
    logClearAll(this.#options.logConfig.clear.allOutstanding, this.#timers);
    for (const [_timerId, timer] of Object.entries(this.#timers)) {
      clearTimeout(timer.internalId);
    }
    this.#timers = {};
  }

  #onExit(code: number) {
    if (Object.keys(this.#timers).length) {
      logClearOnExit(this.#options.logConfig.exitWithOutstandingTimers, this.#timers, code);
      this.clearAll();
    }
  }
}

/**
 * Create a new instance of the Downtimer manager.
 *
 * @param options Options for the `Downtimer` object, including settings for logging.
 */
export function downtimer(options: DeepPartial<DowntimerOptions> = {}) {
  return new Downtimer(options);
}
