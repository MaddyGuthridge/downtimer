import { DeepPartial } from './types';

export type LogMode = 'off' | 'minimal' | 'full';

/**
 * Configuration options for downtimer object.
 */
export type DowntimerOptions = {
  /** Configuration for event logging */
  logConfig: {
    /** Log when a new timer is scheduled */
    schedule: LogMode,
    /** Log options when executing a timer */
    execute: {
      /** Log just before a timer callback is executed */
      before: LogMode,
      /** Log when an error occurs in a timer callback */
      onError: LogMode,
    },
    /** Log options when clearing a timer */
    clear: {
      /**
       * Log when an attempt is made to clear a timer with an unknown ID.
       *
       * This happens if the timer has already been cleared or has already executed.
       */
      notFound: LogMode,
      /** Log when a timer is cleared successfully */
      success: LogMode,
      /** Log when all outstanding timers are cleared */
      allOutstanding: LogMode
    },
    /** Log when the server exits with outstanding timers */
    exitWithOutstandingTimers: LogMode,
  }
};

/** Default options for Downtimer */
export const defaultOptions: DowntimerOptions = {
  logConfig: {
    schedule: 'off',
    execute: {
      before: 'off',
      onError: 'full',
    },
    clear: {
      notFound: 'minimal',
      success: 'off',
      allOutstanding: 'off',
    },
    exitWithOutstandingTimers: 'minimal',
  },
};

/**
 * Merge a `DeepPartial<T>` object with a collection of defaults of type `T`
 *
 * If `T extends object`, then all properties are optional, and any value that is `undefined` in the
 * `options` will be replaced with the corresponding value in `defaults`.
 *
 * Otherwise, the object is considered to be a complete type, and so is only checked for
 * undefined-ness.
 */
export function mergeDeepPartial<T>(defaults: T, options?: DeepPartial<T>): T {
  if (options === undefined || options === null) {
    return defaults;
  } else if (typeof options !== 'object') {
    // `options` is definitely a value
    return options as T;
  }
  const result = structuredClone(defaults);
  for (const k of Object.keys(options satisfies object)) {
    const key = k as keyof T;
    // `options[key]` is a real value, despite TypeScript's protests
    result[key] = mergeDeepPartial(defaults[key], options[key] as DeepPartial<T[typeof key]>);
  }
  return result;
}
