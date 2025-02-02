'use strict';

import * as cheerio from 'cheerio';
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { providers } from './providers';

// add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(StealthPlugin());

let browser: null | Browser = null,
  timer: null | ReturnType<typeof setTimeout> = null;

function setTimer(time: number) {
  if (timer) {
    clearTimeout(timer);
  }

  timer = setTimeout(destroy, time);
}

export async function destroy() {
  if (timer) {
    clearTimeout(timer);
  }

  if (browser) {
    const b = browser;
    browser = null;
    await b.close();
  }
}

export async function translate(
  provider: string,
  sourceLanguage: string,
  targetLanguage: string,
  text: string,
  lifetime: number = 0
) {
  const p = providers.find((item) => item.name === provider);
  if (!p) {
    throw new Error(`Provider not found: ${provider}`);
  }

  if (text.length > p.maxLength) {
    throw new Error(`Too many characters: ${text.length} > ${p.maxLength}`);
  }

  const { selector, prepare } = p;
  const url = p.url.apply(p, [text, sourceLanguage, targetLanguage]);

  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      userDataDir: '.puppeteer',
      // executablePath: "google-chrome-stable",
    });
  }

  if (lifetime) {
    setTimer(lifetime);
  }

  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'load',
    });

    let result: string;
    if (prepare) {
      result = await prepare.apply(p, [page]);
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
    if (!lifetime) {
      await destroy();
    }

    return result;
  } catch (err) {
    await page.close();
    if (!lifetime) {
      await destroy();
    }
    throw err;
  }
}
