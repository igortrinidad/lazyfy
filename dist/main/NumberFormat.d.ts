import { type NumberFormatOptions } from './types/NumberFormatOptions';
export declare const formatNumber: (input?: string | number | null, opt?: Partial<NumberFormatOptions>) => string;
export declare const unformatNumber: (input?: string | number | null, opt?: Partial<NumberFormatOptions>) => number;
export declare const NumberFormat: {
    formatNumber: (input?: string | number | null, opt?: Partial<NumberFormatOptions>) => string;
    unformatNumber: (input?: string | number | null, opt?: Partial<NumberFormatOptions>) => number;
};
