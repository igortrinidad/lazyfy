export interface NumberFormatOptions {
    prefix: string;
    suffix: string;
    decimal: string;
    thousand: string;
    precision: number;
    acceptNegative: boolean;
    isInteger: boolean;
    vueVersion?: string;
}
declare const defaultOptions: NumberFormatOptions;
export default defaultOptions;
