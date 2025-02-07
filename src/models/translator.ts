'use strict';

import * as cheerio from 'cheerio';
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { ProviderNames, providers } from './provider';
import { wait } from 'utils-js';
import { createQueue } from './queue';
import { splitText } from '../utils/string';

// add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(StealthPlugin());

export class Translator {
  provider: ProviderNames;
  cacheDir: string;
  isOpened: boolean;
  browser?: Browser;
  constructor(
    provider: ProviderNames = 'google',
    cacheDir: string = '.puppeteer'
  ) {
    this.isOpened = false;
    this.provider = provider;
    this.cacheDir = cacheDir;
  }

  async open() {
    if (!this.isOpened) {
      this.isOpened = true;
      this.browser = await puppeteer.launch({
        // headless: false,
        // args: ["--no-sandbox"],
        userDataDir: this.cacheDir,
        // executablePath: "google-chrome-stable",
      });
    }

    // wait browser launched
    while (!this.browser) {
      await wait(128);
    }
  }

  async close() {
    if (this.isOpened) {
      while (!this.browser) {
        await wait(128);
      }
      const b = this.browser;
      this.browser = undefined;
      this.isOpened = false;
      await b.close();
    }
  }

  async text(sourceLanguage: string, targetLanguage: string, text: string) {
    await this.open();
    if (!this.browser) {
      throw new Error('Browser not found');
    }

    const provider = providers.find((item) => item.name === this.provider);
    if (!provider) {
      throw new Error(`Provider not found: ${this.provider}`);
    }

    const { selector, prepare, maxLength } = provider;
    if (text.length > maxLength) {
      throw new Error(`Too many characters: ${text.length} > ${maxLength}`);
    }

    const url = provider.url.apply(provider, [
      text,
      sourceLanguage,
      targetLanguage,
    ]);
    const page = await this.browser.newPage();

    try {
      await page.goto(url, {
        waitUntil: 'load',
      });

      let result: string;
      if (prepare) {
        result = await prepare.apply(provider, [page]);
      } else {
        await page.waitForSelector(selector, {
          visible: true,
          timeout: 1000 * 10,
        });

        const content = await page.content();
        const $ = cheerio.load(content);
        result = $(selector).find('br').replaceWith('\n').end().text();
      }

      await page.close();
      return result;
    } catch (err) {
      await page.close();
      throw err;
    }
  }

  async line(
    sourceLanguage: string,
    targetLanguage: string,
    text: string | string[],
    callback?: (
      newValue: string,
      oldValue: string,
      index: number,
      array: string[]
    ) => void,
    size: number = 512
  ) {
    await this.open();
    if (!this.browser) {
      throw new Error('Browser not found');
    }

    const srcLines = typeof text === 'string' ? splitText(text) : text;
    const dstLines: string[] = [];
    const queue = createQueue(srcLines, size);
    let i = 0,
      j = 0;
    for (i; i < queue.length; i++) {
      const { isText, index, value } = queue[i];

      if (!isText) {
        dstLines.splice(dstLines.length + index, 0, value);
      } else {
        // send callback after linebreaks insertion
        if (callback) {
          for (j; j < dstLines.length; j++) {
            callback(dstLines[j], srcLines[j], j, srcLines);
          }
        }

        try {
          const translatedText = await this.text(
            sourceLanguage,
            targetLanguage,
            value
          );

          dstLines.push(...splitText(translatedText));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error.';
          dstLines.push(...splitText(value).map(() => `ERROR=${message}`));
        }
      }
    }

    // send remainings to callback
    if (callback) {
      for (j; j < dstLines.length; j++) {
        callback(dstLines[j], srcLines[j], j, srcLines);
      }
    }

    return dstLines;
  }
}
