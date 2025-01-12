export declare const downloadRawData: (data: string, fileName?: string) => void;
export declare const copyToClipboard: (string: string) => void;
export declare const getLetterByNumber: (number: number) => string;
export declare const removeAllCookies: () => void;
export declare const clearBrowserCache: (removeCookies?: boolean) => void;
export declare const clearBrowserCacheListener: (hotKey?: string, removeCookies?: boolean, cb?: Function | null) => void;
export declare const CommonHelpers: {
    downloadRawData: (data: string, fileName?: string) => void;
    copyToClipboard: (string: string) => void;
    getLetterByNumber: (number: number) => string;
    clearBrowserCache: (removeCookies?: boolean) => void;
    clearBrowserCacheListener: (hotKey?: string, removeCookies?: boolean, cb?: Function | null) => void;
    removeAllCookies: () => void;
};
