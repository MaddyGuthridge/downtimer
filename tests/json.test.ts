import { describe, expect, it } from 'vitest';
import { downtimer } from '../src';
import { optionsNoLogging } from './util';

describe('JSON stringify', () => {
  it.concurrent('JSON stringify attempts throw an exception', () => {
    const dt = downtimer(optionsNoLogging);
    expect(() => JSON.stringify(dt)).toThrow();
  });
});
