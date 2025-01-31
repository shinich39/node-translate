# node-translate

Text translation without API in nodejs

## Getting Started

### Installation

```console
npm install github:shinich39/node-translate
```

### Usage

```js
import { translate } from 'node-translate';

const text = `
The baby was lying on her back. 
A blue bird flew in through the window. 
The blue bird had blue eyes.
`.trim();

const providers = [
  'google',
  'deepl',
  'papago',
  'yandex', // disabled
  'reverso',
  'bing', // Linebreak not supported
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

// google: 1.662s
// google: 赤ちゃんは仰向けになっていた。
// 青い鳥が窓から飛びました。
// 青い鳥には青い目がありました。
// deepl: 3.143s
// deepl: 赤ちゃんは仰向けに寝ていた。
// 窓から青い鳥が飛んできた。
// 青い鳥は青い目をしていた。
// papago: 835.56ms
// papago: 赤ちゃんは仰向けになっていました。 
// 青い鳥が窓から飛んできました。 
// 青い鳥は青い目をしていました。
// yandex: Yandex has been disabled due to robot detection
// reverso: 2.448s
// reverso: 赤ん坊は仰向けに横たわっていた。
// 青い鳥が窓から飛んできた。
// 青い鳥は青い目をしていた。
// bing: 2.617s
// bing: 赤ちゃんは仰向けに寝ていました。青い鳥が窓から飛び込んできました。その青い鳥は青い目を持っていました。
```

## Acknowledgements

- [cheerio](https://www.npmjs.com/package/cheerio)
- [franc](https://www.npmjs.com/package/franc)
- [puppeteer](https://pptr.dev/)