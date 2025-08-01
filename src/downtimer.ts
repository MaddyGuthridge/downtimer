import { DeepPartial, TimerCallback, TimerId } from './types';
import { defaultOptions, DowntimerOptions, mergeDeepPartial } from './options';
import { v4 as uuid } from 'uuid';
import { logBeforeExecute, logClearAll, logClearNotFound, logClearOnExit, logClearSuccess, logErrorInExecute, logSchedule } from './log';
import { getStackTrace, StackFrame } from './stackTrace';
import colors, { Colors } from './colors';

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
  /** Color options */
  #colors: Colors;

  /**
   * Create a new Downtimer manager object.
   *
   * Importantly, this manager can only access timers that it scheduled. As such, creating a new
   * `downtimer` object elsewhere in your code won't allow you to clear timers scheduled using a
   * different timer manager. As such, it may be best to create a single global `downtimer` manager
   * which you use across your entire codebase.
   *
   * @param options Options for the `Downtimer` object, including settings for logging.
   */
  constructor(options: DeepPartial<DowntimerOptions> = {}) {
    this.#options = mergeDeepPartial(defaultOptions, options);
    this.#timers = {};
    this.#colors = colors(this.#options.useColor);

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

    logBeforeExecute(this.#options.logConfig.execute.before, timer, this.#colors);

    delete this.#timers[timerId];
    try {
      timer.callback();
    } catch (e: unknown) {
      logErrorInExecute(
        this.#options.logConfig.execute.onError,
        timer,
        e,
        this.#colors,
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
   *
   * @returns a timer ID which can be used to cancel the scheduled timer. You should store this
   * timer ID somewhere in your data structures if there is a chance that you'll need to cancel it
   * later.
   */
  schedule(callback: TimerCallback, ms: number): TimerId {
    const externalId = uuid() as TimerId;
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

    logSchedule(this.#options.logConfig.schedule, options, this.#colors);

    return externalId;
  }

  /**
   * Cancel the scheduled callback function associated with the given timer ID. If the callback
   * hasn't been run yet, it will be cancelled and will never run.
   *
   * If the scheduled callback has already been run, or does not exist, a warning will be logged to
   * the console. Importantly, no exception will be thrown.
   *
   * Note that the scheduled timer must be cancelled using the `downtimer` manager that scheduled
   * it. Other `downtimer` manager instances will log a "timer not found" warning.
   *
   * @param timerId ID of timer to clear
   */
  clear(timerId: TimerId) {
    const timer = this.#timers[timerId];

    if (!timer) {
      logClearNotFound(this.#options.logConfig.clear.notFound, timerId, this.#colors);
      return;
    }

    logClearSuccess(this.#options.logConfig.clear.success, timer, this.#colors);
    clearTimeout(timer.internalId);
    delete this.#timers[timerId];
  }

  /**
   * Cancel all outstanding callback functions.
   *
   * This cancels all scheduled timers managed by this `downtimer` object. Note that timers
   * scheduled by other `downtimer` manager objects won't be cleared.
   */
  clearAll() {
    logClearAll(this.#options.logConfig.clear.allOutstanding, this.#timers, this.#colors);
    for (const [_timerId, timer] of Object.entries(this.#timers)) {
      clearTimeout(timer.internalId);
    }
    this.#timers = {};
  }

  #onExit(code: number) {
    if (Object.keys(this.#timers).length) {
      logClearOnExit(
        this.#options.logConfig.exitWithOutstandingTimers,
        this.#timers,
        code,
        this.#colors,
      );
      this.clearAll();
    }
  }
}

/**
 * Create a new Downtimer manager object.
 *
 * Importantly, this manager can only access timers that it scheduled. As such, creating a new
 * `downtimer` object elsewhere in your code won't allow you to clear timers scheduled using a
 * different timer manager. As such, it may be best to create a single global `downtimer` manager
 * which you use across your entire codebase.
 *
 * @param options Options for the `Downtimer` object, including settings for logging.
 */
export function downtimer(options: DeepPartial<DowntimerOptions> = {}) {
  return new Downtimer(options);
}
