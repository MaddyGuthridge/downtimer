/**
 * Downtimer -- Timeouts, but a little more relaxing.
 *
 * Downtimer is a simple management system for timers created using `setTimeout`,
 * making them less stressful to work with. It works by implementing the following
 * features:
 *
 * * Graceful handling of exceptions thrown during timers. Errors are logged with
 *   debug information, and additional error handlers can optionally be registered
 *   as callback functions.
 * * Warnings are logged for pending timers when the application exits.
 * * Provides a simple interface for clearing all registered timers.
 * * Timer IDs can be passed through `JSON.stringify` (since they're just
 *   strings).
 *
 * ## Usage
 *
 * ```ts
 * import { downtimer } from 'downtimer';
 *
 * // Create a timer manager
 * let timers = downtimer();
 *
 * // Schedule a timer (like `setTimeout`)
 * const t = timers.schedule(() => {
 *   console.log('12 seconds later');
 * }, 12_000);
 *
 * // Cancel the scheduled timer
 * timers.cancel(t);
 *
 * // Or cancel all scheduled timers
 * timers.cancelAll();
 *
 * // You can also customise the logging if you're really struggling to debug
 * // timer-related issues
 * // For example, if you're trying to debug a scheduled timer which isn't being
 * // cancelled for some reason, you could use the following configuration.
 * timers = downtimer({
 *   logConfig: {
 *     // Log when a timer is scheduled
 *     schedule: 'minimal',
 *     // And give full details when a timer is cancelled but not found
 *     clear: {
 *       notFound: 'full',
 *     },
 *   },
 * });
 * ```
 */
export { downtimer, Downtimer } from './downtimer';
export type { TimerId, TimerCallback } from './types';
export type { DowntimerOptions } from './options';
