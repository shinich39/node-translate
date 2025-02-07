# node-translate

Text translation without API in nodejs

## Getting Started

### Installation

```console
npm install github:shinich39/node-translate
```

### Usage

- Text

```js
const text = `
The baby was lying on her back.
A blue bird flew in through the window.
The blue bird had blue eyes.
`.trim();

const providers = [
  'google',
  'deepl',
  'papago',
  'yandex',
  'reverso',
  'bing',
];

const t = new Translator();
for (const p of providers) {
  try {
    t.provider = p;
    console.time(p);
    const res = await t.text('en', 'ja', text);
    console.timeEnd(p);
    console.log(`${p}: ${res}`);
  } catch (err) {
    console.log(`${p}: ${err.message}`);
  }
}
await t.close();

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

- Line

```js
const text = fs.readFileSync('test/mobydick.txt', 'utf8');
const t = new Translator();
t.provider = "papago";

console.time("line");
const res = await t.line(
  'en',
  'ko',
  text,
  (newValue, oldValue, index, array) => {
    console.log(index + 1, '/', array.length);
  }
);
console.timeEnd("line");

fs.writeFileSync('test/mobydick.ko.txt', res.join("\n"), 'utf8');

await t.close();
```

## Acknowledgements

- [cheerio](https://www.npmjs.com/package/cheerio)
- [franc](https://www.npmjs.com/package/franc)
- [puppeteer](https://pptr.dev/)