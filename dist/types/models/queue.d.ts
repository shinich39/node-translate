export interface Queue {
    isText: boolean;
    index: number;
    values: string[];
    length: number;
}
export declare function createQueue(lines: string[], size: number, skip?: (value: string, index: number) => boolean): Queue[];
//# sourceMappingURL=queue.d.ts.map