'use strict';

export function isSpecial(str: string) {
  return /^[^\p{L}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]+$/u.test(
    str
  );
}

export function isEnglish(str: string) {
  return /^[a-zA-Z]+$/.test(str);
}

export function isNumber(str: string) {
  return /^[0-9]+$/.test(str);
}

export function isKanji(str: string) {
  return /^[\p{Script=Han}]+$/u.test(str);
}

export function isJapanese(str: string) {
  return /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+$/u.test(str);
}

export function isKorean(str: string) {
  return /^[\p{Script=Hangul}]+$/u.test(str);
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

export function isContained(str: string) {
  return (
    /^[^\p{L}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(
      str
    ) &&
    /[^\p{L}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]$/u.test(
      str
    )
  );
}

export function splitText(str: string) {
  return str.split(/\r\n|\r|\n/);
}

export function splitDialog(str: string) {
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
