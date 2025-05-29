// https://stackoverflow.com/a/61132308/6335363
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * A unique ID representing a timer.
 *
 * Under the hood, this is just a `string`, and so can technically be JSON serialized, but
 * saving it to a file doesn't make very much sense, since the timers will all be killed when the
 * process exits.
 */
export type TimerId = string & { __timerId: '__timerId' };

/**
 * A callback function, executed once a timer fires.
 */
export type TimerCallback = () => void;
