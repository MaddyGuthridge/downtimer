
/**
 * A unique ID representing a timer.
 *
 * Under the hood, this is technically a `string`, and so can technically be JSON serialized, but
 * saving it to a file doesn't make very much sense, since the timers will all be killed when the
 * process exits.
 */
export type TimerId = string & { __timerId: '__timerId' };

/**
 * A callback function, executed once a timer fires.
 */
export type TimerCallback = () => void;

/**
 * Configuration options for downtimer object.
 */
export type DowntimerOptions = {
  /**
   * Whether to clear all running timers if a process using Downtimer begins to exit.
   *
   * Defaults to `true` so that timers won't prevent the process from exiting.
   */
  clearAllOnExit: boolean
};
