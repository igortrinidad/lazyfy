"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectHelpers = exports.checkSameStructure = exports.deepSearchKey = exports.deleteNestedObjectByKey = exports.setNestedObjectByKey = exports.getNestedObjectByKey = exports.deepMergeObject = exports.isObject = exports.defineProperty = exports.initClassData = exports.checkIsEqual = exports.checkObjMatch = exports.filterObjectKeys = void 0;
const Util_1 = require("./Util");
const filterObjectKeys = (allowed, object) => {
    return allowed.reduce((acc, allowedAttribute) => {
        if (object && Object.prototype.hasOwnProperty.call(object, allowedAttribute)) {
            acc[allowedAttribute] = object[allowedAttribute];
        }
        return acc;
    }, {});
};
exports.filterObjectKeys = filterObjectKeys;
const checkObjMatch = (item, query, ignoreEmptyArray = false) => {
    const diffKeys = Object.keys(query).filter((key) => {
        let attrQuery = (0, Util_1.lowerCaseAndStringifyIfNumber)(item[key]);
        if (Array.isArray(query[key])) {
            if (!query[key].length)
                return ignoreEmptyArray;
            return !(0, Util_1.remapArrayToLowerCaseIfString)(query[key]).includes(attrQuery);
        }
        return !(0, exports.checkIsEqual)(attrQuery, query[key]);
    });
    if (diffKeys.length)
        return false;
    return item;
};
exports.checkObjMatch = checkObjMatch;
const checkIsEqual = (value, query) => {
    if (typeof (query) === 'string' && typeof (value) === 'string')
        return value.toLowerCase() == query.toLowerCase();
    return value == query;
};
exports.checkIsEqual = checkIsEqual;
const initClassData = (fillable, instance, obj = {}) => {
    for (const attr of fillable) {
        if (typeof (obj[attr.key]) != 'undefined') {
            instance[attr.key] = obj[attr.key];
        }
        else {
            instance[attr.key] = attr.default;
        }
        Object.defineProperty(instance, 'getFillableKeys', {
            get() { return fillable.map((item) => item.key); },
            configurable: true
        });
    }
};
exports.initClassData = initClassData;
const defineProperty = (object, key, value) => {
    Object.defineProperty(object, key, {
        value: value,
        writable: true,
        enumerable: true,
        configurable: true
    });
    return object;
};
exports.defineProperty = defineProperty;
const isObject = (item) => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};
exports.isObject = isObject;
const deepMergeObject = (target, ...sources) => {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if ((0, exports.isObject)(target) && (0, exports.isObject)(source)) {
        for (const key in source) {
            if ((0, exports.isObject)(source[key])) {
                if (!target[key])
                    Object.assign(target, {
                        [key]: {}
                    });
                (0, exports.deepMergeObject)(target[key], source[key]);
            }
            else {
                Object.assign(target, {
                    [key]: source[key]
                });
            }
        }
    }
    return (0, exports.deepMergeObject)(target, ...sources);
};
exports.deepMergeObject = deepMergeObject;
const getNestedObjectByKey = (obj = {}, key = '') => {
    return key.split('.').reduce((acc, k) => {
        if (acc === undefined || acc === null)
            return undefined;
        const arrayMatch = k.match(/^([^\[]+)\[(\d+)\]$/);
        if (arrayMatch) {
            const arrayKey = arrayMatch[1];
            const arrayIndex = parseInt(arrayMatch[2], 10);
            if (!Array.isArray(acc[arrayKey]) || acc[arrayKey][arrayIndex] === undefined) {
                return undefined;
            }
            return acc[arrayKey][arrayIndex];
        }
        return acc[k];
    }, obj);
};
exports.getNestedObjectByKey = getNestedObjectByKey;
const setNestedObjectByKey = (obj = {}, key, value, allowNonExistingArrayIndex = false) => {
    obj = Object.assign({}, obj);
    key.split('.').reduce((acc, k, index, keys) => {
        const arrayMatch = k.match(/^([^\[]+)\[(\d+)\]$/);
        if (arrayMatch) {
            const arrayKey = arrayMatch[1];
            const arrayIndex = parseInt(arrayMatch[2], 10);
            if (!Array.isArray(acc[arrayKey])) {
                if (acc[arrayKey] !== undefined && (typeof acc[arrayKey] !== 'object')) {
                    throw new TypeError(`Cannot set property '${arrayKey}[${arrayIndex}]' on non-object type (${typeof acc[arrayKey]}) at path '${keys.slice(0, index + 1).join('.')}'`);
                }
                acc[arrayKey] = [];
            }
            // Check if the array has the specified index
            if (!allowNonExistingArrayIndex && arrayIndex >= acc[arrayKey].length) {
                throw new RangeError(`Array '${arrayKey}' does not have index ${arrayIndex} at path '${keys.slice(0, index + 1).join('.')}'`);
            }
            // Set the current accumulator to the specified index in the array
            acc = acc[arrayKey];
            // @ts-ignore
            k = arrayIndex;
        }
        if (index === keys.length - 1) {
            acc[k] = value;
        }
        else {
            // Throw an error if the current level is not an object
            if (acc[k] !== undefined && (typeof acc[k] !== 'object')) {
                throw new TypeError(`Cannot set property '${k}' on non-object type (${typeof acc[k]}) at path '${keys.slice(0, index + 1).join('.')}'`);
            }
            acc[k] = acc[k] || {};
        }
        return acc[k];
    }, obj);
    return obj;
};
exports.setNestedObjectByKey = setNestedObjectByKey;
const deleteNestedObjectByKey = (obj, key, ignoreNonExisting = true) => {
    const keys = key.split('.');
    keys.reduce((acc, k, index) => {
        const arrayMatch = k.match(/^([^\[]+)\[(\d+)\]$/);
        if (arrayMatch) {
            const arrayKey = arrayMatch[1];
            const arrayIndex = parseInt(arrayMatch[2], 10);
            if (!Array.isArray(acc[arrayKey]) && !ignoreNonExisting) {
                throw new TypeError(`Cannot delete property '${arrayKey}[${arrayIndex}]' on non-array type at path '${keys.slice(0, index + 1).join('.')}'`);
            }
            if (index === keys.length - 1) {
                // Last element in path: delete array item
                if (arrayIndex >= acc[arrayKey].length && !ignoreNonExisting) {
                    throw new RangeError(`Array '${arrayKey}' does not have index ${arrayIndex} at path '${keys.slice(0, index + 1).join('.')}'`);
                }
                acc[arrayKey].splice(arrayIndex, 1);
            }
            else {
                acc = acc[arrayKey][arrayIndex];
            }
        }
        else {
            if (index === keys.length - 1) {
                // Last element in path: delete object key
                if (acc && acc.hasOwnProperty(k)) {
                    delete acc[k];
                }
                else if (!ignoreNonExisting) {
                    throw new Error(`Cannot delete non-existent property '${k}' at path '${keys.slice(0, index + 1).join('.')}'`);
                }
            }
            else {
                // Traverse the object, ensuring we don't try to access a non-object
                if (ignoreNonExisting) {
                    if (!acc[k] || typeof acc[k] !== 'object') {
                        return acc;
                    }
                }
                if (!ignoreNonExisting && (!acc[k] || typeof acc[k] !== 'object')) {
                    throw new TypeError(`Cannot delete property '${k}' on non-object type at path '${keys.slice(0, index + 1).join('.')}'`);
                }
                acc = acc[k];
            }
        }
        return acc;
    }, obj);
    return obj;
};
exports.deleteNestedObjectByKey = deleteNestedObjectByKey;
const deepSearchKey = (obj, targetKey, returnAll = false) => {
    const results = [];
    let firstResult = null;
    const search = (currentObj) => {
        if (!returnAll && firstResult !== null)
            return;
        if (typeof currentObj !== 'object' || currentObj === null)
            return;
        for (const key in currentObj) {
            if (key === targetKey) {
                if (returnAll) {
                    results.push(currentObj[key]);
                }
                else {
                    firstResult = currentObj[key];
                    return;
                }
            }
            search(currentObj[key]);
        }
    };
    search(obj);
    return returnAll ? results : firstResult;
};
exports.deepSearchKey = deepSearchKey;
const checkSameStructure = (baseObj, compareObj) => {
    if (typeof baseObj !== 'object' || baseObj === null) {
        return typeof baseObj === typeof compareObj;
    }
    if (typeof compareObj !== 'object' || compareObj === null) {
        return false;
    }
    for (const key in baseObj) {
        if (!(key in compareObj))
            return false;
        if (!(0, exports.checkSameStructure)(baseObj[key], compareObj[key]))
            return false;
    }
    return true;
};
exports.checkSameStructure = checkSameStructure;
exports.ObjectHelpers = {
    filterObjectKeys: exports.filterObjectKeys,
    checkObjMatch: exports.checkObjMatch,
    checkIsEqual: exports.checkIsEqual,
    initClassData: exports.initClassData,
    defineProperty: exports.defineProperty,
    isObject: exports.isObject,
    deepMergeObject: exports.deepMergeObject,
    getNestedObjectByKey: exports.getNestedObjectByKey,
    setNestedObjectByKey: exports.setNestedObjectByKey,
    deleteNestedObjectByKey: exports.deleteNestedObjectByKey,
    deepSearchKey: exports.deepSearchKey
};
