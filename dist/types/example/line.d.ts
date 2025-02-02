export interface Queue {
    isText: boolean;
    index: number;
    value: string;
}
export declare function translateToLines(provider: string, sourceLanguage: string, targetLanguage: string, text: string, callback?: (newValue: string | null, currentValue: string, currentIndex: number, array: string[]) => void): Promise<string>;
//# sourceMappingURL=line.d.ts.map