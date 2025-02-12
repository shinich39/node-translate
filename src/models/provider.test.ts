// @ts-nocheck

import { describe, test, it } from 'node:test';
import assert from 'node:assert';
import { providers } from './provider';

const eq = function (a, b, msg) {
  return typeof a === 'object'
    ? assert.deepStrictEqual(a, b, msg)
    : assert.strictEqual(a, b, msg);
};

describe('src/core/providers.ts', () => {
  test('providers', () => {
    const res = providers
      .find((item) => item.name === 'google')
      .url('test', 'ko', 'ja');
    eq(res, 'https://translate.google.com/?sl=ko&tl=ja&text=test&op=translate');
  });
});
