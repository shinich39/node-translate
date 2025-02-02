// @ts-nocheck

import { describe, test, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { destroy, translate, translateToLines } from './index';
import fs from 'node:fs';
const __path = path.relative(process.cwd(), fileURLToPath(import.meta.url));
const eq = (a, b, msg) =>
  typeof a === 'object'
    ? assert.deepStrictEqual(a, b, msg)
    : assert.strictEqual(a, b, msg);

describe('src/index.ts', () => {
  //   test('translate', async () => {
  //     const text = `
  // The baby was lying on her back.
  // A blue bird flew in through the window.
  // The blue bird had blue eyes.
  //     `.trim();

  //     const providers = [
  //       'google',
  //       'deepl',
  //       'papago',
  //       'yandex',
  //       'reverso',
  //       'bing',
  //     ];

  //     for (const p of providers) {
  //       try {
  //         console.time(p);
  //         const res = await translate(p, 'en', 'ja', text);
  //         console.timeEnd(p);
  //         console.log(`${p}: ${res}`);
  //       } catch (err) {
  //         console.log(`${p}: ${err.message}`);
  //       }
  //     }

  //     await destroy();
  //   });

  test('translateToLines', async () => {
    const text = fs.readFileSync('test/mobydick.txt', 'utf8');
    const res = await translateToLines(
      'papago',
      'en',
      'ja',
      text,
      (newValue, curerentValue, currentIndex, array) => {
        console.log(currentIndex, '/', array.length);
      }
    );

    fs.writeFileSync('test/mobydick.ja.txt', res, 'utf8');
  });
});
