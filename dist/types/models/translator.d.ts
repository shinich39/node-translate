import { Browser } from 'puppeteer';
import { ProviderNames } from './provider';
export declare class Translator {
    provider: ProviderNames;
    cacheDir: string;
    isOpened: boolean;
    browser?: Browser;
    constructor(provider?: ProviderNames, cacheDir?: string);
    open(): Promise<void>;
    close(): Promise<void>;
    text(sourceLanguage: string, targetLanguage: string, text: string): Promise<string>;
    line(sourceLanguage: string, targetLanguage: string, text: string | string[], callback?: (newValue: string, oldValue: string, index: number, array: string[]) => void, options?: {
        size?: number;
        skip?: (value: string, index: number) => boolean;
        delay?: number | ((...args: any[]) => number);
    }): Promise<string[]>;
}
//# sourceMappingURL=translator.d.ts.map