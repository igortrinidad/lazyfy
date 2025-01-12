/**
 *
 * get amount of a given % of a value
 */
export declare const getAmountOfPercentage: (amount: number, percentage: number | string) => number;
/**
 *
 * get the % of a given amount and value
 */
export declare const getPercentageOfAmount: (amount: number, value: number, percentageSign?: boolean, digits?: number) => number | string;
export declare const round: (value: number, decimals?: number) => number;
export declare const randomInt: (max: number, min?: number) => number;
/**
 * add a raw percentage value to a number
 */
export declare const addPercentage: (value: number, percentage: string | number) => number;
/**
 *
 * returns a min value using a percentage as references
 */
export declare const getValueOrMinPercentage: (amount: number, value: number, percentage?: number) => number;
export declare const MathHelpers: {
    getAmountOfPercentage: (amount: number, percentage: number | string) => number;
    getPercentageOfAmount: (amount: number, value: number, percentageSign?: boolean, digits?: number) => number | string;
    round: (value: number, decimals?: number) => number;
    randomInt: (max: number, min?: number) => number;
    addPercentage: (value: number, percentage: string | number) => number;
    getValueOrMinPercentage: (amount: number, value: number, percentage?: number) => number;
};
