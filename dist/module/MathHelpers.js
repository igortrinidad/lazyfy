"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathHelpers = exports.getValueOrMinPercentage = exports.addPercentage = exports.randomInt = exports.round = exports.getPercentageOfAmount = exports.getAmountOfPercentage = void 0;
/**
 *
 * get amount of a given % of a value
 */
const getAmountOfPercentage = (amount, percentage) => {
    const pct = getParsedValue(percentage);
    const amt = getParsedValue(amount);
    return Number(amt / 100 * pct);
};
exports.getAmountOfPercentage = getAmountOfPercentage;
/**
 *
 * get the % of a given amount and value
 */
const getPercentageOfAmount = (amount, value, percentageSign = false, digits = 2) => {
    const amt = getParsedValue(amount);
    const result = Number(100 / amt * value);
    if (!percentageSign)
        return result;
    if (isNaN(Number(result / 100)))
        return Number(result / 100);
    return Number(result / 100).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: digits });
};
exports.getPercentageOfAmount = getPercentageOfAmount;
const round = (value, decimals = 2) => {
    const vl = getParsedValue(value);
    var p = Math.pow(10, decimals);
    return Math.round(vl * p) / p;
};
exports.round = round;
const randomInt = (max, min = 0) => {
    return min + Math.floor((max - min) * Math.random());
};
exports.randomInt = randomInt;
/**
 * add a raw percentage value to a number
 */
const addPercentage = (value, percentage) => {
    const pct = getParsedValue(percentage);
    const vl = getParsedValue(value);
    return vl * (1 + (pct / 100));
};
exports.addPercentage = addPercentage;
/**
 *
 * returns a min value using a percentage as references
 */
const getValueOrMinPercentage = (amount, value, percentage = 10) => {
    const amt = getParsedValue(amount);
    const vl = getParsedValue(value);
    const pct = getParsedValue(percentage);
    if ((amt / 100 * pct) > vl)
        return (0, exports.getAmountOfPercentage)(amt, pct);
    return vl;
};
exports.getValueOrMinPercentage = getValueOrMinPercentage;
const getParsedValue = (value) => {
    return typeof (value) === 'number' ? value : parseFloat(value);
};
exports.MathHelpers = {
    getAmountOfPercentage: exports.getAmountOfPercentage,
    getPercentageOfAmount: exports.getPercentageOfAmount,
    round: exports.round,
    randomInt: exports.randomInt,
    addPercentage: exports.addPercentage,
    getValueOrMinPercentage: exports.getValueOrMinPercentage
};
