import { Page } from 'puppeteer';
export declare enum ProviderKey {
    google = 0,
    deepl = 1,
    papago = 2,
    yandex = 3,
    reverso = 4,
    bing = 5
}
export type ProviderName = keyof typeof ProviderKey;
export interface Queue {
    url: string;
    text: string;
    from: string;
    to: string;
}
export interface Provider {
    selector: string;
    maxLength: number;
    template: string;
    queues: (text: string, from: string, to: string) => Queue[];
    prepare?: (page: Page) => Promise<boolean>;
}
export declare const providers: Record<ProviderName, Provider>;
//# sourceMappingURL=providers.d.ts.map