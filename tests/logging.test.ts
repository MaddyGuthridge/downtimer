import pinoTest from 'pino-test';
import { describe, expect, test } from 'vitest';
import downtimer from '../src';
import { sleep } from './util';
import pino from 'pino';

function logItemEquals(actual: any, expected: any, msg: any) {
  expect(actual, msg).toMatchObject(expected);
}

describe('Logging test', () => {
  test.concurrent('Logs error if timer produces an error', async () => {
    const stream = pinoTest.sink();
    const dt = downtimer({ pinoOptions: {}, pinoDestination: stream });

    dt.schedule(() => { throw Error('Uh oh!'); }, 10);
    await sleep(15);

    await pinoTest.once(
      stream,
      { level: pino.levels.values.error, err: expect.objectContaining({ message: 'Uh oh!'}) },
      logItemEquals,
    );
  });
});
