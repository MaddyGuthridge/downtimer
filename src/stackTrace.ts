import assert from 'node:assert';

/**
 * Return the current stack trace.
 */
export function getTrace(): string {
  const trace = new Error().stack;
  assert(trace, 'Unable to capture stack trace');
  return trace;
}
