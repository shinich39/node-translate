'use strict';

import { parseTemplate, wait } from 'utils-js';
import { getLangCode } from './language';
import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';

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

const DELAY = 128;
const TIMEOUT = 1000 * 10;

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

async function getContent(page: Page, selector: string) {
  const element = await page.$(selector);
  if (!element) {
    return;
  }

  const content = await page.evaluate((elem) => elem?.textContent, element);

  if (!content || content.trim() === '') {
    return;
  }

  return content;
}

async function getCheerioContent(page: Page, selector: string) {
  const $ = cheerio.load(await page.content());
  return $(selector).find('br').replaceWith('\n').end().text();
}

export interface Provider {
  name: string;
  selector: string;
  maxLength: number;
  template: string;
  url: (text: string, from: string, to: string) => string;
  prepare?: (page: Page) => Promise<string>;
}

export const providers: Provider[] = [
  {
    name: 'google',
    // selector: "span.HwtZe",
    selector: 'span.ryNqvb',
    maxLength: 5000,
    template:
      'https://translate.google.com/?sl=${from}&tl=${to}&text=${text}&op=translate',
    url: function (text: string, from: string, to: string) {
      [from, to] = convertLangCodes('iso639-1', from, to);
      return createUrl(this.template, text, from, to);
    },
  },
  {
    name: 'deepl',
    selector: "div[aria-labelledby='translation-target-heading']",
    // selector: "div[aria-labelledby='translation-target-heading'] p span",
    maxLength: 1500,
    template: 'https://www.deepl.com/translator#${from}/${to}/${text}',
    url: function (text: string, from: string, to: string) {
      [from, to] = convertLangCodes('iso639-1', from, to);
      return createUrl(this.template, text, from, to);
    },
    prepare: async function (page: Page) {
      let i = 0;
      while (i < TIMEOUT) {
        const content = await getContent(page, this.selector);
        if (content) {
          return getCheerioContent(page, this.selector);
        }
        await wait(DELAY);
        i += DELAY;
      }
      throw new Error('Content not found');
    },
  },
  {
    name: 'papago',
    selector: '#txtTarget',
    // selector: '#txtTarget span',
    maxLength: 3000,
    template: 'https://papago.naver.com/?sk=${from}&tk=${to}&st=${text}',
    url: function (text: string, from: string, to: string) {
      [from, to] = convertLangCodes('iso639-1', from, to);
      return createUrl(this.template, text, from, to);
    },
    prepare: async function (page: Page) {
      let i = 0;
      while (i < TIMEOUT) {
        const content = await getContent(page, this.selector);
        if (content) {
          return getCheerioContent(page, this.selector);
        }
        await wait(DELAY);
        i += DELAY;
      }
      throw new Error('Content not found');
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
      [from, to] = convertLangCodes('iso639-1', from, to);
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
      [from, to] = convertLangCodes('iso639-2', from, to);
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
      [from, to] = convertLangCodes('iso639-1', from, to);
      return createUrl(this.template, text, from, to);
    },
    prepare: async function (page: Page) {
      let i = 0;
      while (i < TIMEOUT) {
        const content = await getContent(page, this.selector);
        if (content && !/^\.+$/.test(content.trim())) {
          return content;
        }
        await wait(DELAY);
        i += DELAY;
      }
      throw new Error('Content not found');
    },
  },
];
