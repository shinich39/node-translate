'use strict';

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
