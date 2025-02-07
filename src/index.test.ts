// @ts-nocheck

import { describe, test, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Translator } from './index';
import fs from 'node:fs';
import { toHalfWidth } from 'utils-js';
const __path = path.relative(process.cwd(), fileURLToPath(import.meta.url));
const eq = (a, b, msg) =>
  typeof a === 'object'
    ? assert.deepStrictEqual(a, b, msg)
    : assert.strictEqual(a, b, msg);

describe('src/index.ts', () => {
  //   test('text', async () => {
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

  //     const t = new Translator();
  //     for (const p of providers) {
  //       try {
  //         t.provider = p;
  //         console.time(p);
  //         const res = await t.text('en', 'ja', text);
  //         console.timeEnd(p);
  //         console.log(`${p}: ${res}`);
  //       } catch (err) {
  //         console.log(`${p}: ${err.message}`);
  //       }
  //     }
  //     await t.close();
  //   });

  //   test('auto', async () => {
  //     const text = `
  // The baby was lying on her back.
  // A blue bird flew in through the window.
  // The blue bird had blue eyes.
  //     `.trim();

  //     const t = new Translator();
  //     const res = await t.text('auto', 'ja', text);
  //     console.log(`auto: ${res}`);
  //     await t.close();
  //   });

  // test('line', async () => {
  //   const text = fs.readFileSync('test/mobydick.txt', 'utf8');
  //   const t = new Translator("papago");

  //   console.time('line');
  //   const res = await t.line(
  //     'en',
  //     'ko',
  //     text,
  //     (newValue, oldValue, index, array) => {
  //       console.log(index + 1, '/', array.length);
  //     }
  //   );
  //   console.timeEnd('line');

  //   fs.writeFileSync('test/mobydick.ko.txt', res.join('\n'), 'utf8');

  //   await t.close();
  // });

  test('splitLine', async () => {
    const text = fs.readFileSync('test/mobydick.txt', 'utf8');
    const t = new Translator('papago');
    const data = toHalfWidth(text)
      .replace(/(\r\n|\r|\n)+/g, '\n')
      .replace(/\n/g, '\n');
    console.time('line');
    const res = await t.line(
      'en',
      'ko',
      data,
      (newValue, oldValue, index, array) => {
        console.log(index + 1, '/', array.length);
      }
    );
    console.timeEnd('line');

    fs.writeFileSync('test/mobydick.ko.txt', res.join('\n'), 'utf8');

    await t.close();
  });
});
