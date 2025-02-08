'use strict';

import isUrl from 'is-url';
import { findLastIndex } from '../utils/array';
import { isEmpty } from '../utils/string';

export interface Queue {
  isText: boolean;
  index: number;
  values: string[];
  length: number;
}

export function createQueue(lines: string[], size: number) {
  const queue: Queue[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isEmpty(line) || isUrl(line)) {
      queue.push({
        isText: false,
        index: 0,
        values: [line],
        length: line.length,
      });
      continue;
    }

    const prevTextIndex = findLastIndex(queue, (item) => item.isText);
    const prevText = prevTextIndex > -1 ? queue[prevTextIndex] : undefined;
    if (prevText && prevText.length + line.length < size) {
      prevText.values.push(line);
      // add linebreak size 1
      prevText.length += line.length + 1;

      // update remainings index
      for (let i = prevTextIndex + 1; i < queue.length; i++) {
        queue[i].index--;
      }
    } else {
      queue.push({
        isText: true,
        index: 0,
        values: [line],
        length: line.length,
      });
    }
  }

  return queue;
}
