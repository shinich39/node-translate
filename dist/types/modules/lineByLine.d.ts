export interface Queue {
    isText: boolean;
    index: number;
    value: string;
}
export declare function translateLineByLine(provider: string, sourceLanguage: string, targetLanguage: string, text: string | string[], callback?: (newValue: string, currentValue: string, currentIndex: number, array: string[]) => void): Promise<string>;
//# sourceMappingURL=lineByLine.d.ts.map