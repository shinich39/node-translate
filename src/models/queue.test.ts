// @ts-nocheck

import { describe, test, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { createQueue } from './queue';
import { toHalfWidth } from 'utils-js';
import { splitText } from '../utils/string';
const eq = function (a, b, msg) {
  return typeof a === 'object'
    ? assert.deepStrictEqual(a, b, msg)
    : assert.strictEqual(a, b, msg);
};

// describe('src/core/queue.ts', () => {
//   test('queue', () => {
//     const text = fs.readFileSync('test/mobydick.txt', 'utf8');
//     const data = toHalfWidth(text).replace(/(\r\n|\r|\n)+/g, "\n").replace(/\n/g, "\n");
//     const lines = splitText(data);
//     const queue = createQueue(lines, 512);
//     fs.writeFileSync("test/mobydick.json", JSON.stringify(queue, null, 2), "utf8");
//   });
// });
