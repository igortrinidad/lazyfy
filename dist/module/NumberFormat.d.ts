import { type TypeNumberFormatOptions } from './types/NumberFormatOptions';
export declare const formatNumber: (input?: string | number | null, opt?: Partial<TypeNumberFormatOptions>) => string;
export declare const unformatNumber: (input?: string | number | null, opt?: Partial<TypeNumberFormatOptions>) => number;
export declare const NumberFormat: {
    formatNumber: (input?: string | number | null, opt?: Partial<TypeNumberFormatOptions>) => string;
    unformatNumber: (input?: string | number | null, opt?: Partial<TypeNumberFormatOptions>) => number;
};
