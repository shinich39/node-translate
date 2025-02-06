'use strict';

import isUrl from 'is-url';
import { destroy, translate } from '../core/fetch';

export interface Queue {
  isText: boolean;
  index: number;
  value: string;
}

function isSpecial(str: string) {
  return /^[^\p{L}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]+$/u.test(
    str
  );
}

function isEnglish(str: string) {
  return /^[a-zA-Z]+$/.test(str);
}

function isNumber(str: string) {
  return /^[0-9]+$/.test(str);
}

function isKanji(str: string) {
  return /^[\p{Script=Han}]+$/u.test(str);
}

function isJapanese(str: string) {
  return /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+$/u.test(str);
}

function isKorean(str: string) {
  return /^[\p{Script=Hangul}]+$/u.test(str);
}

function isEmpty(str: string) {
  return str.trim() === '';
}

function isError(str: string) {
  return /^ERROR=/.test(str);
}

function isLineBreak(str: string) {
  return /^(?:\r\n|\r|\n)+$/.test(str);
}

function isContained(str: string) {
  return (
    /^[^\p{L}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(
      str
    ) &&
    /[^\p{L}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]$/u.test(
      str
    )
  );
}

function findLastIndex<T>(
  arr: T[],
  callback: (value: T, index: number, array: T[]) => boolean
): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (callback(arr[i], i, arr)) {
      return i;
    }
  }
  return -1;
}

function splitLine(str: string) {
  let i = 0,
    j = str.length;

  while (i < str.length) {
    const ch = str[i];
    if (!isSpecial(ch)) {
      break;
    }
    i++;
  }

  while (j > 0) {
    const ch = str[j - 1];
    if (!isSpecial(ch)) {
      break;
    }
    j--;
  }

  return [str.substring(0, i), str.substring(i, j), str.substring(j)];
}

function splitText(str: string) {
  return str.split(/\r\n|\r|\n/);
}

function concatTexts(arr: string[], size: number) {
  return arr.reduce<string[]>((acc, curr) => {
    const prev = acc[acc.length - 1];

    if (
      !prev ||
      prev.length + curr.length > size ||
      isUrl(curr) ||
      isSpecial(curr)
    ) {
      acc.push(curr);
    } else {
      acc[acc.length - 1] += curr;
    }

    return acc;
  }, []);
}

function createQueue(lines: string[], size: number) {
  const queue: Queue[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevIndex = findLastIndex(queue, (item) => item.isText);
    const prev = prevIndex > -1 ? queue[prevIndex] : undefined;

    if (isEmpty(line) || isUrl(line) || isSpecial(line)) {
      queue.push({
        isText: false,
        index: 0,
        value: line,
      });
    } else if (prev && prev.value.length + line.length < size) {
      prev.value += '\n' + line;

      // update remainings index
      for (let i = prevIndex + 1; i < queue.length; i++) {
        queue[i].index--;
      }
    } else {
      queue.push({
        isText: true,
        index: 0,
        value: line,
      });
    }
  }

  return queue;
}

export async function translateLineByLine(
  provider: string,
  sourceLanguage: string,
  targetLanguage: string,
  text: string | string[],
  callback?: (
    newValue: string,
    currentValue: string,
    currentIndex: number,
    array: string[]
  ) => void
): Promise<string> {
  const srcLines = typeof text === 'string' ? splitText(text) : text;
  const dstLines: string[] = [];
  const queue = createQueue(srcLines, 512);
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
        const translatedText = await translate(
          provider,
          sourceLanguage,
          targetLanguage,
          value,
          1000 * 60
        );

        dstLines.push(...splitText(translatedText));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error.';
        dstLines.push(...splitText(value).map(() => `ERROR=${message}`));
      }
    }
  }

  // snd remainings to callback
  if (callback) {
    for (j; j < dstLines.length; j++) {
      callback(dstLines[j], srcLines[j], j, srcLines);
    }
  }

  // await destroy();

  return dstLines.join('\n');
}
