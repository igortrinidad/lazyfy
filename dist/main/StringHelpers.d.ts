export declare const titleCaseString: (str: string) => string;
export declare const randomString: (length: number) => string;
export declare const joinCommaPlusAnd: (a: Array<any>, unifierString?: string) => string;
export declare const checkStringSimilarity: (base: string, stringToCompare: string, caseInsensitive?: boolean) => number;
export declare const checkStringIsSimilar: (base: string, stringToCompare: string, threshold?: number, caseInsensitive?: boolean) => boolean;
export declare const ensureStartsWithUpperCase: (str?: string) => string;
export declare const truncateText: (text?: string, max?: number) => string;
export declare const StringHelpers: {
    titleCaseString: (str: string) => string;
    randomString: (length: number) => string;
    joinCommaPlusAnd: (a: Array<any>, unifierString?: string) => string;
    checkStringSimilarity: (base: string, stringToCompare: string, caseInsensitive?: boolean) => number;
    checkStringIsSimilar: (base: string, stringToCompare: string, threshold?: number, caseInsensitive?: boolean) => boolean;
    ensureStartsWithUpperCase: (str?: string) => string;
    truncateText: (text?: string, max?: number) => string;
};
