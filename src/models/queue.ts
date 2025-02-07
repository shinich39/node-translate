'use strict';

import isUrl from 'is-url';
import { findLastIndex } from '../utils/array';
import { isEmpty, isSpecial } from '../utils/string';

export interface Queue {
  isText: boolean;
  index: number;
  value: string;
}

export function createQueue(lines: string[], size: number) {
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
