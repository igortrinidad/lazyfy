"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lowerCaseAndStringifyIfNumber = exports.remapArrayToLowerCaseIfString = void 0;
const remapArrayToLowerCaseIfString = (arr = []) => {
    return arr.map(item => (0, exports.lowerCaseAndStringifyIfNumber)(item));
};
exports.remapArrayToLowerCaseIfString = remapArrayToLowerCaseIfString;
const lowerCaseAndStringifyIfNumber = (item) => {
    if (typeof (item) === 'string')
        return item.toLowerCase();
    if (typeof (item) === 'number')
        return item.toString();
    return item;
};
exports.lowerCaseAndStringifyIfNumber = lowerCaseAndStringifyIfNumber;
