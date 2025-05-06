# Downtimer

Timeouts, but a little more relaxing.

Downtimer is a simple management system for timers created using `setTimeout`,
making them less stressful to work with. It works by implementing the following
features:

* Graceful handling of exceptions thrown during timers. Errors are logged with
  debug information, and additional error handlers can optionally be registered
  as callback functions.
* Timers are cleared (but with warnings logged) if the process attempts to
  exit, ensuring processes can exit quickly and cleanly.
* Provides a simple interface for clearing all registered timers.
