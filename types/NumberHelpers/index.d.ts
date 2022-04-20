export function formatNumber(input?: number, opt?: {
    prefix: string;
    suffix: string;
    decimal: string;
    thousand: string;
    precision: number;
    acceptNegative: boolean;
    isInteger: boolean;
}): string;
export function unformatNumber(input?: number, opt?: {
    precision: number;
    isInteger: boolean;
    acceptNegative: boolean;
}): number;
