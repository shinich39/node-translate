'use strict';

import CountryLanguage from '@ladjs/country-language';
import { franc } from 'franc';

export function isEnglish(str: string) {
  return /^[a-zA-Z]+$/.test(str);
}

export function isNumber(str: string) {
  return /^[0-9]+$/.test(str);
}

export function isEmpty(str: string) {
  return str.trim() === '';
}

export function isError(str: string) {
  return /^ERROR=/.test(str);
}

export function isLineBreak(str: string) {
  return /^(?:\r\n|\r|\n)+$/.test(str);
}

export function splitText(str: string) {
  return str.split(/\r\n|\r|\n/);
}

export function findLastIndex<T>(
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

export function getLangCode(type: string, str: string) {
  const lang = CountryLanguage.getLanguage(str);
  if (type === '1' || type === 'iso639-1') {
    return lang.iso639_1;
  } else if (type === '2' || type === 'iso639-2') {
    return lang.iso639_2;
  } else if (type === '3' || type === 'iso639-3') {
    return lang.iso639_3;
  } else if (type === 'name') {
    return lang.name[0];
  } else if (type === 'nativeName') {
    return lang.nativeName[0];
  } else {
    throw new Error(`Language code not found: ${str}`);
  }
}

export function getLangFromText(str: string) {
  const result = franc(str);
  if (result === 'und') {
    throw new Error(`${str} is to short.`);
  }
  return result;
}

export function getLangCodeFromText(type: string, str: string) {
  const result = franc(str);
  if (result === 'und') {
    throw new Error(`${str} is to short.`);
  }
  return getLangCode(type, result);
}
