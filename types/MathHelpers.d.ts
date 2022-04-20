/**
 *
 * get amount of a given % of a value
 */
export function getAmountOfPercentage(amount: any, percentage: any): number;
/**
 *
 * get the % of a given amount and value
 */
export function getPercentageOfAmount(amount: any, value: any, percentageSign?: boolean, digits?: number): string | number;
/**
 * add a raw percentage value to a number
 */
export function addPercentage(value: any, percentage: any): number;
/**
 *
 * returns a min value using a percentage as references
 */
export function getValueOrMinPercentage(amount: any, value: any, percentage?: number): any;
