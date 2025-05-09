import { describe, expect, test } from 'vitest';
import { runTestProgram } from './util';

describe('At exit behaviour', () => {
  test('Test program: earlyExit', async () => {
    const { exitCode, stdout } = await runTestProgram('earlyExit.ts');
    expect(exitCode).toBe(0);
    expect(stdout.includes('Cancel timer with ID')).toBeTruthy();
    expect(stdout.includes('due to process exiting with code 0')).toBeTruthy();
  });

  test('Test program: noEarlyExit', async () => {
    const { exitCode, stdout } = await runTestProgram('noEarlyExit.ts');
    expect(exitCode).toBe(0);
    expect(stdout.includes('Cancel timer with ID')).toBeFalsy();
    expect(stdout.includes('due to process exiting with code 0')).toBeFalsy();
  });
});
