# Downtimer

Timeouts, but a little more relaxing.

Downtimer is a simple management system for timers created using `setTimeout`,
making them less stressful to work with. It works by implementing the following
features:

* Graceful handling of exceptions thrown during timers. Errors are logged with
  helpful debugging information.
* Warnings are logged for pending timers when the application exits.
* If debugging timer-related bugs is still difficult, you can configure logging
  for many other events.
* Provides a simple interface for clearing all registered timers.
* Timer IDs can be passed through `JSON.stringify` (since they're just
  strings).

## Pitfalls

* NodeJS Timers aren't millisecond-precise. You may need to add additional
  buffer time when testing or a slightly-delayed timer may cause your test
  suite to fail. 10ms is a sensible buffer time for most computers, but
  slower machines may need a little more than that.
* If you need times more precise than that, then `downtimer` probably isn't the
  right library for your needs (and JavaScript probably isn't the right
  language for your needs).
* Different `downtimer` manager objects their timers independently. You can't
  access or cancel timers from one `downtimer` manager by calling
  `timers.clearAll` on another `downtimer` manager object.
* Remember that `downtimer.schedule` schedules code to run in the future. It
  returns immediately, and the rest of your function continues to execute. As
  such, you probably don't want to use it in your test cases, as your scheduled
  callback may execute after your test case finishes, causing very confusing
  bugs. Instead, in your test cases, you may want to pause code execution using
  a library such as [slync](https://github.com/nktnet1/slync) (short for
  "sleep sync").

## Installation

```sh
npm i downtimer
```

## Usage

```ts
import { downtimer } from 'downtimer';

// Create a timer manager
let timers = downtimer();

// Schedule a timer (like `setTimeout`)
const timerId = timers.schedule(() => {
  console.log('12 seconds later');
}, 12_000);

// Cancel the scheduled timer, by using the timer ID returned by
// `timers.schedule`
timers.clear(timerId);

// Or cancel all scheduled timers managed by this downtimer manager.
timers.clearAll();

// You can also customise the logging if you're really struggling to debug
// timer-related issues
// For example, if you're trying to debug a scheduled timer which isn't being
// cancelled for some reason, you could use the following configuration.
timers = downtimer({
  logConfig: {
    // Log when a timer is scheduled
    schedule: 'minimal',
    // And give full details when a timer is cancelled but not found
    clear: {
      notFound: 'full',
    },
  },
});
```
