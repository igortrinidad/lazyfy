export type TypeNumberFormatOptions = {
    prefix: string;
    suffix: string;
    decimal: string;
    thousand: string;
    precision: number;
    acceptNegative: boolean;
    isInteger: boolean;
    vueVersion?: string;
};
declare const defaultOptions: TypeNumberFormatOptions;
export default defaultOptions;
