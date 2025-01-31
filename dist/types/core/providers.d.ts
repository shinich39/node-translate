import { Page } from 'puppeteer';
export interface Provider {
    name: string;
    selector: string;
    maxLength: number;
    template: string;
    url: (text: string, from: string, to: string) => string;
    prepare?: (page: Page) => Promise<string>;
}
export declare const providers: Provider[];
//# sourceMappingURL=providers.d.ts.map