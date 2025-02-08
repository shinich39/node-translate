'use strict';

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