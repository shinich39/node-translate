import { Page } from 'puppeteer';
export type ProviderNames = 'google' | 'deepl' | 'papago' | 'yandex' | 'reverso' | 'bing';
export interface Provider {
    name: ProviderNames;
    selector: string;
    maxLength: number;
    template: string;
    url: (text: string, from: string, to: string) => string;
    prepare?: (page: Page) => Promise<string>;
}
export declare const providers: Provider[];
//# sourceMappingURL=provider.d.ts.map