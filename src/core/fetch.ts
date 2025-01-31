'use strict';

import * as cheerio from 'cheerio';
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Provider, ProviderName, providers, Queue } from './providers';
import { wait } from 'utils-js';

// add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(StealthPlugin());

export const fetchOptions = {
  // userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  cacheDir: '.puppeteer',
  waitTimeout: 1000 * 10,
};

// Deprecated
// async function scrollPage(page: Page, delay: number) {
//   while (true) {
//     const previousHeight = await page.evaluate('document.body.scrollHeight');
//     await page.evaluate(() => {
//       window.scrollTo(0, document.body.scrollHeight);
//     });
//     try {
//       await page.waitForFunction(
//         `document.body.scrollHeight > ${previousHeight}`,
//         { timeout: fetchOptions.scrollTimeout }
//       );
//     } catch {
//       break;
//     }
//     await new Promise((resolve) => setTimeout(resolve, delay));
//   }
// }

async function getPageContent(
  browser: Browser,
  url: string,
  provider: Provider
) {
  const { selector, prepare } = provider;

  const page = await browser.newPage();

  // Deprecated: blocked by robot detection
  // await page.setRequestInterception(true);
  // page.on('request', (request) => {
  //   if (request.resourceType() === 'image') {
  //     request.abort();
  //   } else {
  //     request.continue();
  //   }
  // });

  await page.goto(url, {
    waitUntil: 'load',
  });

  if (prepare) {
    while (!(await prepare.apply(provider, [page]))) {
      await wait(128);
    }
  }

  await page.waitForSelector(selector, {
    visible: true,
    timeout: fetchOptions.waitTimeout,
  });

  const content = await page.content();
  const $ = cheerio.load(content);
  const elements = $(selector).contents().toArray();

  return elements
    .filter((elem) => elem.type === 'text')
    .map((elem) => elem.data)
    .join('');
}

export async function translate(
  provider: ProviderName,
  from: string,
  to: string,
  text: string,
  cb?: (
    error: unknown | null,
    originalText: string,
    translatedText: string,
    index: number,
    array: Queue[]
  ) => void
) {
  const p = providers[provider];
  if (!p) {
    throw new Error(`Provider not found: ${provider}`);
  }

  const queues = p.queues.apply(p, [text, from, to]);
  if (queues.length === 0) {
    return '';
  }

  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: fetchOptions.cacheDir,
    // executablePath: "google-chrome-stable",
  });

  let result = '',
    index = 0;

  for (const queue of queues) {
    try {
      const translatedText = await getPageContent(browser, queue.url, p);
      result += translatedText;
      if (cb) {
        cb(null, queue.text, translatedText, index, queues);
      }
    } catch (err: unknown) {
      if (cb) {
        cb(err, queue.text, '', index, queues);
      }
    }
    index++;
  }

  await browser.close();

  return result;
}
