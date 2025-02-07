import { Browser } from 'puppeteer';
import { ProviderNames } from './provider';
export interface TranslatorOptions {
    provider: ProviderNames;
    cacheDir?: string;
}
export declare class Translator {
    provider: ProviderNames;
    cacheDir: string;
    isOpened: boolean;
    browser?: Browser;
    constructor(options: TranslatorOptions);
    open(): Promise<void>;
    close(): Promise<void>;
    text(sourceLanguage: string, targetLanguage: string, text: string): Promise<string>;
    line(sourceLanguage: string, targetLanguage: string, text: string | string[], callback?: (newValue: string, oldValue: string, index: number, array: string[]) => void, size?: number): Promise<string[]>;
}
//# sourceMappingURL=translator.d.ts.map