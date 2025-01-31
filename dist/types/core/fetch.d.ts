import { ProviderName, Queue } from './providers';
export declare const fetchOptions: {
    cacheDir: string;
    waitTimeout: number;
};
export declare function translate(provider: ProviderName, from: string, to: string, text: string, cb?: (error: unknown | null, originalText: string, translatedText: string, index: number, array: Queue[]) => void): Promise<string>;
//# sourceMappingURL=fetch.d.ts.map