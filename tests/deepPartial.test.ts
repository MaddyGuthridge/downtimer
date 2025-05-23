import { expect, test } from 'vitest';
import { mergeDeepPartial } from '../src/options';


test.concurrent('mergeDeepPartial', () => {
  expect(
    mergeDeepPartial(
      { a: { a1: 'a1', a2: 'a2' }},
      { a: { a1: 'changed' }},
    )
  ).toStrictEqual({ a: { a1: 'changed', a2: 'a2' }});
});
