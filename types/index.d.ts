declare const _exports: {
    formatNumber: (input?: number, opt?: {
        prefix: string;
        suffix: string;
        decimal: string;
        thousand: string;
        precision: number;
        acceptNegative: boolean;
        isInteger: boolean;
    }) => string;
    unformatNumber: (input?: number, opt?: {
        precision: number;
        isInteger: boolean;
        acceptNegative: boolean;
    }) => number;
    NumberHelpers: typeof NumberHelpers;
    titleCaseString: (str: any) => any;
    StringHelpers: typeof StringHelpers;
    downloadRawData: (data: any, fileName?: string) => void;
    copyToClipboard: (string: any) => void;
    CommonHelpers: typeof CommonHelpers;
    getAmountOfPercentage: (amount: any, percentage: any) => number;
    getPercentageOfAmount: (amount: any, value: any, percentageSign?: boolean, digits?: number) => string | number;
    addPercentage: (value: any, percentage: any) => number;
    getValueOrMinPercentage: (amount: any, value: any, percentage?: number) => any;
    MathHelpers: typeof MathHelpers;
    filterObjectKeys: (allowed: any, object: any) => any;
    checkIsEqual: (value: any, query: any) => boolean;
    checkObjMatch: (item: any, query: any) => any;
    initClassData: (fillable: any, instance: any, obj?: {}) => void;
    deepMergeObject: (target: any, ...sources: any[]) => any;
    defineProperty: (object: any, key: any, value: any) => any;
    ObjectHelpers: typeof ObjectHelpers;
    findByObj: (arr: any, obj: any) => any;
    findByString: (arr: any, item: any, asBoolean?: boolean) => any;
    find: (arr: any, query: any) => any;
    findIndex: (arr: any, query: any) => any;
    findAll: (arr: any, query: any) => any;
    removeAll: (arr: any, query: any) => any;
    remove: (arr: any, query: any) => any;
    uniqueByKey: (arr: any, query: any) => any[];
    objArrayToCsv: (arr: any, delimiter?: string) => string;
    toggleInArray: (arr: any, obj: any) => any;
    ArrayHelpers: typeof ArrayHelpers;
};
export = _exports;
import NumberHelpers = require("./NumberHelpers");
import StringHelpers = require("./StringHelpers");
import CommonHelpers = require("./CommonHelpers");
import MathHelpers = require("./MathHelpers");
import ObjectHelpers = require("./ObjectHelpers");
import ArrayHelpers = require("./ArrayHelpers");
