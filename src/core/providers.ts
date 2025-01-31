'use strict';

import { parseTemplate, wait } from 'utils-js';
import { getLangCode } from './language';
import { Page } from 'puppeteer';

// function splitText(
//   text: string,
//   maxLength: number
// ): {
//   originalText: string;
//   encodedText: string;
// }[] {
//   const texts = [];
//   while (text.length > maxLength) {
//     const endIndex = text.lastIndexOf('\n', maxLength);
//     if (endIndex === -1) {
//       throw new Error('Too large text without whitespace');
//     }

//     const part = text.substring(0, endIndex + 1);
//     texts.push({
//       originalText: part,
//       encodedText: encode(part),
//     });
//     text = text.substring(endIndex + 1);
//   }

//   if (text.length > 0) {
//     texts.push({
//       originalText: text,
//       encodedText: encode(text),
//     });
//   }

//   return texts;
// }

// function createQueues(
//   template: string,
//   text: string,
//   from: string,
//   to: string,
//   maxLength: number = Number.MAX_SAFE_INTEGER
// ): Queue[] {
//   return splitText(text, maxLength).map(({ originalText, encodedText }) => {
//     const url = createUrl(template, encodedText, from, to);
//     return { url, text: originalText, from, to };
//   });
// }

// export interface Queue {
//   url: string;
//   text: string;
//   from: string;
//   to: string;
// }

function encode(str: string) {
  return encodeURIComponent(str);
}

function convertLangCodes(type: string, ...args: string[]) {
  return args.map((str) => getLangCode(type, str));
}

function createUrl(template: string, text: string, from: string, to: string) {
  return parseTemplate(template, {
    text: encode(text),
    from: from,
    to: to,
  });
}

export interface Provider {
  name: string;
  selector: string;
  maxLength: number;
  template: string;
  url: (text: string, from: string, to: string) => string;
  prepare?: (page: Page) => Promise<void>;
}

export const providers: Provider[] = [
  {
    name: 'google',
    selector: 'span.ryNqvb',
    maxLength: 5000,
    template:
      'https://translate.google.com/?sl=${from}&tl=${to}&text=${text}&op=translate',
    url: function (text: string, from: string, to: string) {
      [from, to] = convertLangCodes('1', from, to);
      return createUrl(this.template, text, from, to);
    },
  },
  {
    name: 'deepl',
    selector: "div[aria-labelledby='translation-target-heading'] p span",
    maxLength: 1500,
    template: 'https://www.deepl.com/translator#${from}/${to}/${text}',
    url: function (text: string, from: string, to: string) {
      [from, to] = convertLangCodes('1', from, to);
      return createUrl(this.template, text, from, to);
    },
  },
  {
    name: 'papago',
    selector: '#txtTarget span',
    maxLength: 3000,
    template: 'https://papago.naver.com/?sk=${from}&tk=${to}&st=${text}',
    url: function (text: string, from: string, to: string) {
      [from, to] = convertLangCodes('1', from, to);
      return createUrl(this.template, text, from, to);
    },
  },
  {
    name: 'yandex',
    selector: 'span.EzKURWReUAB5oZgtQNkl',
    maxLength: 10000,
    template:
      'https://translate.yandex.com/?source_lang=${from}&target_lang=${to}&text=${text}',
    url: function (text: string, from: string, to: string) {
      throw new Error('Yandex has been disabled due to robot detection');
      [from, to] = convertLangCodes('1', from, to);
      return createUrl(this.template, text, from, to);
    },
  },
  {
    name: 'reverso',
    selector: '.sentence-wrapper_target span',
    maxLength: 2000,
    template:
      'https://www.reverso.net/text-translation#sl=${from}&tl=${to}&text=${text}',
    url: function (text: string, from: string, to: string) {
      [from, to] = convertLangCodes('2', from, to);
      return createUrl(this.template, text, from, to);
    },
  },
  {
    name: 'bing',
    selector: '#tta_output_ta',
    maxLength: 1000,
    template:
      'https://www.bing.com/translator?from=${from}&to=${to}&text=${text}',
    url: function (text: string, from: string, to: string) {
      [from, to] = convertLangCodes('1', from, to);
      return createUrl(this.template, text, from, to);
    },
    prepare: async function (page: Page) {
      try {
        let i = 0;
        while (i < 10) {
          const element = await page.$(this.selector);
          const content = await page.evaluate(
            (elem) => elem?.textContent,
            element
          );

          if (typeof content === 'string' && !/^\s*\.*\s*$/.test(content)) {
            break;
          }

          await wait(256);

          i++;
        }
      } catch (err) {
        // console.error(err);
      }
    },
  },
];
