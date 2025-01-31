// @ts-nocheck

import { describe, test, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { destroy, translate } from '../dist/index.min.mjs';
import fs from 'node:fs';
const __path = path.relative(process.cwd(), fileURLToPath(import.meta.url));
const eq = (a, b, msg) =>
  typeof a === 'object'
    ? assert.deepStrictEqual(a, b, msg)
    : assert.strictEqual(a, b, msg);

describe('src/index.ts', () => {
  test('translate', async () => {
    const text = `
The baby was lying on her back. 
A blue bird flew in through the window. 
The blue bird had blue eyes.
    `.trim();

    // const text = `The baby was lying on her back. A blue bird flew in through the window. The blue bird had blue eyes. It sat on the baby’s crib. The bird had a bell around its neck. The bell rang. The baby smiled. The baby reached for the bell. The bird shook its head. The bell fell off the bird’s neck. It fell next to the baby. The baby picked up the bell. The baby rang the bell. Another blue bird flew in through the window. This blue bird also had blue eyes. The baby had brown eyes. The birds looked at the baby. The baby looked at the birds. The baby rang the bell again. Both birds flew away. The baby started to cry. His mama came into the room. The baby smiled. Mama saw the bell. She asked the baby where the bell came from. The baby pointed at the window.`;
    const providers = [
      'google',
      'deepl',
      'papago',
      'yandex',
      'reverso',
      'bing',
    ];

    for (const p of providers) {
      try {
        console.time(p);
        const res = await translate(p, 'en', 'ja', text);
        console.timeEnd(p);
        console.log(`${p}: ${res}`);
      } catch (err) {
        console.log(`${p}: ${err.message}`);
      }
    }

    await destroy();
  });
});
