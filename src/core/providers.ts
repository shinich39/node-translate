'use strict';

import { parseTemplate } from 'utils-js';
import { getLangCode } from './language';
import { Page } from 'puppeteer';

function encode(str: string) {
  return encodeURIComponent(str);
}

function splitText(
  text: string,
  maxLength: number
): {
  originalText: string;
  encodedText: string;
}[] {
  const texts = [];
  while (text.length > maxLength) {
    const endIndex = text.lastIndexOf('\n', maxLength);
    if (endIndex === -1) {
      throw new Error('Too large text without whitespace');
    }

    const part = text.substring(0, endIndex + 1);
    texts.push({
      originalText: part,
      encodedText: encode(part),
    });
    text = text.substring(endIndex + 1);
  }

  if (text.length > 0) {
    texts.push({
      originalText: text,
      encodedText: encode(text),
    });
  }

  return texts;
}

function convertLangCodes(type: string, ...args: string[]) {
  return args.map((str) => getLangCode(type, str));
}

function createQueues(
  template: string,
  text: string,
  from: string,
  to: string,
  maxLength: number = Number.MAX_SAFE_INTEGER
): Queue[] {
  return splitText(text, maxLength).map(({ originalText, encodedText }) => {
    const url = parseTemplate(template, { text: encodedText, from, to });
    return { url, text: originalText, from, to };
  });
}

export enum ProviderKey {
  google,
  deepl,
  papago,
  yandex,
  reverso,
  bing,
}

export type ProviderName = keyof typeof ProviderKey;

export interface Queue {
  url: string;
  text: string;
  from: string;
  to: string;
}

export interface Provider {
  selector: string;
  maxLength: number;
  template: string;
  queues: (text: string, from: string, to: string) => Queue[];
  prepare?: (page: Page) => Promise<boolean>;
}

export const providers: Record<ProviderName, Provider> = {
  google: {
    selector: 'span.ryNqvb',
    maxLength: 5000,
    template:
      'https://translate.google.com/?sl=${from}&tl=${to}&text=${text}&op=translate',
    queues: function (text: string, from: string, to: string) {
      [from, to] = convertLangCodes('1', from, to);
      return createQueues(this.template, text, from, to, this.maxLength);
    },
  },
  deepl: {
    selector: "div[aria-labelledby='translation-target-heading'] p span",
    maxLength: 1500,
    template: 'https://www.deepl.com/translator#${from}/${to}/${text}',
    queues: function (text: string, from: string, to: string) {
      [from, to] = convertLangCodes('1', from, to);
      return createQueues(this.template, text, from, to, this.maxLength);
    },
  },
  papago: {
    selector: '#txtTarget span',
    maxLength: 3000,
    template: 'https://papago.naver.com/?sk=${from}&tk=${to}&st=${text}',
    queues: function (text: string, from: string, to: string) {
      return createQueues(this.template, text, from, to, this.maxLength);
    },
  },
  yandex: {
    selector: 'span.EzKURWReUAB5oZgtQNkl',
    maxLength: 10000,
    template:
      'https://translate.yandex.com/?source_lang=${from}&target_lang=${to}&text=${text}',
    queues: function (text: string, from: string, to: string) {
      throw new Error('Yandex has been disabled due to robot detection');
      [from, to] = convertLangCodes('1', from, to);
      return createQueues(this.template, text, from, to, this.maxLength);
    },
    prepare: async function (page: Page) {
      try {
        await page.waitForSelector('.CheckboxCaptcha-Button', {
          visible: true,
          timeout: 1000 * 10,
        });

        await page.click('.CheckboxCaptcha-Button');

        return true;
      } catch (err) {
        return false;
      }
    },
  },
  reverso: {
    selector: '.sentence-wrapper_target span',
    maxLength: 2000,
    template:
      'https://www.reverso.net/text-translation#sl=${from}&tl=${to}&text=${text}',
    queues: function (text: string, from: string, to: string) {
      [from, to] = convertLangCodes('2', from, to);
      return createQueues(this.template, text, from, to, this.maxLength);
    },
  },
  bing: {
    // selector: '#tta_output_ta, tta_output_ta_gdf, tta_output_ta_gdm',
    selector: '#tta_output_ta',
    maxLength: 1000,
    template:
      'https://www.bing.com/translator?from=${from}&to=${to}&text=${text}',
    queues: function (text: string, from: string, to: string) {
      [from, to] = convertLangCodes('1', from, to);
      return createQueues(this.template, text, from, to, this.maxLength);
    },
    prepare: async function (page: Page) {
      try {
        const element = await page.$(this.selector);
        const content = await page.evaluate(
          (elem) => elem?.textContent,
          element
        );
        return (
          typeof content === 'string' &&
          content.trim() !== '...' &&
          content.trim() !== ''
        );
      } catch (err) {
        return false;
      }
    },
  },
};
