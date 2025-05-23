import { describe, expect, test } from 'vitest';
import { runTestProgram } from './util';

describe('At exit behaviour', () => {
  test.concurrent('Test program: earlyExit', async () => {
    const { exitCode, stdout } = await runTestProgram('earlyExit.ts');
    expect(exitCode).toBe(0);
    expect(
      stdout.includes('Clearing 1 timer due to exit with code 0')
    ).toBeTruthy();
  });

  test.concurrent('Test program: noEarlyExit', async () => {
    const { exitCode, stdout, stderr } = await runTestProgram('noEarlyExit.ts');
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toStrictEqual('');
    expect(stderr.trim()).toStrictEqual('');
  });
});
