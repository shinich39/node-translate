import { ProviderName } from './core/providers';
export * from './core/providers';
export declare const translateOptions: {
    cacheDir: string;
    waitTimeout: number;
};
export declare function translate(provider: ProviderName, from: string, to: string, text: string): Promise<string>;
//# sourceMappingURL=index.d.ts.map