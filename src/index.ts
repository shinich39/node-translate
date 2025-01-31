'use strict';

import { ProviderName, providers } from './core/providers';
import { fetchOptions, getContent } from './core/fetch';

export * from './core/providers';

export const translateOptions = fetchOptions;

export async function translate(
  provider: ProviderName,
  from: string,
  to: string,
  text: string
) {
  const p = providers[provider];
  if (!p) {
    throw new Error(`Provider not found: ${provider}`);
  }

  const urls = p.urls.apply(p, [text, from, to]);

  if (urls.length === 0) {
    return '';
  }

  return await getContent(urls, p);
}
