'use strict';

import { parseTemplate, wait } from 'utils-js';
import { getLangCode, getLangCodeFromText } from '../common/utils';
import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';

const DELAY = 128;
const TIMEOUT = 1000 * 10;

function encode(str: string) {
  return encodeURIComponent(str);
}

function convertLangCodes(type: string, text: string, ...args: string[]) {
  return args.map((str) =>
    str === 'auto' ? getLangCodeFromText(type, text) : getLangCode(type, str)
  );
}

function createUrl(template: string, text: string, from: string, to: string) {
  return parseTemplate(template, {
    text,
    from,
    to,
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

export type ProviderNames =
  | 'google'
  | 'deepl'
  | 'papago'
  | 'yandex'
  | 'reverso'
  | 'bing';

export interface Provider {
  name: ProviderNames;
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
      [from, to] = convertLangCodes('iso639-1', text, from, to);
      text = encode(text);
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
      [from, to] = convertLangCodes('iso639-1', text, from, to);
      text = encode(text);
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
      [from, to] = convertLangCodes('iso639-1', text, from, to);
      // fix encoding &
      text = encode(text).replace(/%26/g, '%25amp');
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
      [from, to] = convertLangCodes('iso639-1', text, from, to);
      text = encode(text);
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
      [from, to] = convertLangCodes('iso639-2', text, from, to);
      // fix encoding &
      text = encode(text).replace(/%26/g, '%2526');
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
      [from, to] = convertLangCodes('iso639-1', text, from, to);
      text = encode(text);
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
