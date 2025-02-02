
  /**
   * @license
   * author: igortrindade.dev
   * lazyfy.js v2.34.0
   * Released under the MIT license.
   */

var lazyfy = (function (exports) {
    'use strict';

    const remapArrayToLowerCaseIfString = (arr = []) => {
        return arr.map(item => lowerCaseAndStringifyIfNumber(item));
    };
    const lowerCaseAndStringifyIfNumber = (item) => {
        if (typeof (item) === 'string')
            return item.toLowerCase();
        if (typeof (item) === 'number')
            return item.toString();
        return item;
    };

    const filterObjectKeys = (allowed, object) => {
        return allowed.reduce((acc, allowedAttribute) => {
            if (object && Object.prototype.hasOwnProperty.call(object, allowedAttribute)) {
                acc[allowedAttribute] = object[allowedAttribute];
            }
            return acc;
        }, {});
    };
    const checkObjMatch = (item, query, ignoreEmptyArray = false) => {
        const diffKeys = Object.keys(query).filter((key) => {
            let attrQuery = lowerCaseAndStringifyIfNumber(item[key]);
            if (Array.isArray(query[key])) {
                if (!query[key].length)
                    return ignoreEmptyArray;
                return !remapArrayToLowerCaseIfString(query[key]).includes(attrQuery);
            }
            return !checkIsEqual(attrQuery, query[key]);
        });
        if (diffKeys.length)
            return false;
        return item;
    };
    const checkIsEqual = (value, query) => {
        if (typeof (query) === 'string' && typeof (value) === 'string')
            return value.toLowerCase() == query.toLowerCase();
        return value == query;
    };
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
    const defineProperty = (object, key, value) => {
        Object.defineProperty(object, key, {
            value: value,
            writable: true,
            enumerable: true,
            configurable: true
        });
        return object;
    };
    const isObject = (item) => {
        return (item && typeof item === 'object' && !Array.isArray(item));
    };
    const deepMergeObject = (target, ...sources) => {
        if (!sources.length)
            return target;
        const source = sources.shift();
        if (isObject(target) && isObject(source)) {
            for (const key in source) {
                if (isObject(source[key])) {
                    if (!target[key])
                        Object.assign(target, {
                            [key]: {}
                        });
                    deepMergeObject(target[key], source[key]);
                }
                else {
                    Object.assign(target, {
                        [key]: source[key]
                    });
                }
            }
        }
        return deepMergeObject(target, ...sources);
    };
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
            if (!checkSameStructure(baseObj[key], compareObj[key]))
                return false;
        }
        return true;
    };
    const ObjectHelpers = {
        filterObjectKeys,
        checkObjMatch,
        checkIsEqual,
        initClassData,
        defineProperty,
        isObject,
        deepMergeObject,
        getNestedObjectByKey,
        setNestedObjectByKey,
        deleteNestedObjectByKey,
        deepSearchKey
    };

    const findByObj = (arr, obj, asBoolean = false) => {
        for (const item of arr) {
            if (!checkObjMatch(item, obj))
                continue;
            return asBoolean ? true : item;
        }
        return false;
    };
    const findByString = (arr, item, asBoolean = false) => {
        for (const arrItem of arr) {
            if (typeof (arrItem) === 'string' && typeof (item) === 'string') {
                if (arrItem.toLowerCase() == item.toLowerCase())
                    return asBoolean ? true : arrItem;
            }
            if (arrItem == item) {
                return asBoolean ? true : arrItem;
            }
        }
        return false;
    };
    const find = (arr, query, asBoolean = false) => {
        if (Array.isArray(query))
            return false;
        if (typeof (query) === 'object')
            return findByObj(arr, query, asBoolean);
        return findByString(arr, query, asBoolean);
    };
    const findIndex = (arr, query) => {
        if (typeof (query) === 'object') {
            const findedByObj = findByObj(arr, query);
            return findedByObj != false ? arr.indexOf(findedByObj) : -1;
        }
        const findedByString = findByString(arr, query);
        return findedByString !== false ? arr.indexOf(findedByString) : -1;
    };
    const findAll = (arr, query, ignoreEmptyArray = false) => {
        if (!query)
            return arr;
        return arr.filter((item) => {
            const itemToMatch = typeof (item) === 'string' ? item.toLowerCase() : item;
            if (typeof (query) == 'string')
                return checkIsEqual(item, query);
            if (Array.isArray(query))
                return remapArrayToLowerCaseIfString(query).includes(itemToMatch) ? true : false;
            return checkObjMatch(item, query, !ignoreEmptyArray) ? true : false;
        });
    };
    const removeAll = (arr, query, ignoreEmptyArray = true) => {
        if (!query)
            return arr;
        return arr.filter((item) => {
            const itemToMatch = typeof (item) === 'string' ? item.toLowerCase() : item;
            if (typeof (query) === 'string')
                return !checkIsEqual(item, query);
            if (Array.isArray(query))
                return remapArrayToLowerCaseIfString(query).includes(itemToMatch) ? false : true;
            return checkObjMatch(item, query, ignoreEmptyArray) ? false : true;
        });
    };
    const remove = (arr, query = null) => {
        if (!query)
            return arr;
        const index = findIndex(arr, query);
        if (index > -1)
            arr.splice(index, 1);
        return arr;
    };
    const uniqueByKey = (arr, query = null) => {
        const uniqueItems = [];
        for (const item of arr) {
            let search;
            if (!query) {
                search = item;
            }
            else if (typeof (query) === 'string') {
                search = { [query]: item[query] };
            }
            else {
                search = query;
            }
            const finded = find(uniqueItems, search);
            if (!finded)
                uniqueItems.push(item);
        }
        return uniqueItems;
    };
    const objArrayToCsv = (arr, delimiter = ',') => {
        if (!Array.isArray(arr) || typeof (arr[0]) != 'object')
            throw new Error(`First parameter must be an array of objects`);
        const header = Object.keys(arr[0]);
        return [header.join(delimiter), arr.map(row => header.map(key => row[key]).join(delimiter)).join("\n")].join("\n");
    };
    const toggleInArray = (arr, obj) => {
        const finded = findIndex(arr, obj);
        if (finded > -1) {
            arr.splice(finded, 1);
        }
        else {
            arr.push(obj);
        }
        return arr;
    };
    const compareArray = (arrFrom, arrToCompare, key = null) => {
        if (arrFrom.length !== arrToCompare.length)
            return false;
        for (const item of arrFrom) {
            let search;
            if (typeof (item) === 'string') {
                search = item;
            }
            else {
                if (typeof (key) !== 'string')
                    throw new Error('Third parameter must be a string');
                search = { [key]: item[key] };
            }
            const finded = find(arrToCompare, search);
            if (!finded)
                return false;
        }
        return true;
    };
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    const getRandomElement = (list) => list[Math.floor(Math.random() * list.length)];
    const ArrayHelpers = {
        findByObj,
        findByString,
        find,
        findIndex,
        findAll,
        removeAll,
        remove,
        uniqueByKey,
        objArrayToCsv,
        toggleInArray,
        compareArray,
        shuffle,
        getRandomElement
    };

    /**
     *
     * get amount of a given % of a value
     */
    const getAmountOfPercentage = (amount, percentage) => {
        const pct = getParsedValue(percentage);
        const amt = getParsedValue(amount);
        return Number(amt / 100 * pct);
    };
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
    const round = (value, decimals = 2) => {
        const vl = getParsedValue(value);
        var p = Math.pow(10, decimals);
        return Math.round(vl * p) / p;
    };
    const randomInt = (max, min = 0) => {
        return min + Math.floor((max - min) * Math.random());
    };
    /**
     * add a raw percentage value to a number
     */
    const addPercentage = (value, percentage) => {
        const pct = getParsedValue(percentage);
        const vl = getParsedValue(value);
        return vl * (1 + (pct / 100));
    };
    /**
     *
     * returns a min value using a percentage as references
     */
    const getValueOrMinPercentage = (amount, value, percentage = 10) => {
        const amt = getParsedValue(amount);
        const vl = getParsedValue(value);
        const pct = getParsedValue(percentage);
        if ((amt / 100 * pct) > vl)
            return getAmountOfPercentage(amt, pct);
        return vl;
    };
    const getParsedValue = (value) => {
        return typeof (value) === 'number' ? value : parseFloat(value);
    };
    const MathHelpers = {
        getAmountOfPercentage,
        getPercentageOfAmount,
        round,
        randomInt,
        addPercentage,
        getValueOrMinPercentage
    };

    const downloadRawData = (data, fileName = 'file.txt') => {
        if (!window)
            throw new Error(`Method downloadRawData must run in "window" context.`);
        const blob = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.setAttribute('href', blob);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const copyToClipboard = (string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(string);
        }
        else {
            const dummy = document.createElement("input");
            document.body.appendChild(dummy);
            dummy.value = string;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
        }
    };
    const getLetterByNumber = (number) => {
        const string = 'abcdefghijklmnopqrstuvwxyz';
        if (string.length - 1 < number)
            return '--';
        return string[number];
    };
    const removeAllCookies = () => {
        if (document) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf('=');
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                const path = '/';
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=' + path;
            }
        }
    };
    const clearBrowserCache = (removeCookies = true) => {
        localStorage.clear();
        sessionStorage.clear();
        if (removeCookies) {
            removeAllCookies();
        }
    };
    const clearBrowserCacheListener = (hotKey = 'KeyX', removeCookies = true, cb = null) => {
        if (document) {
            document.addEventListener("keydown", function (event) {
                if (event.altKey && event.code === hotKey) {
                    event.preventDefault();
                    clearBrowserCache(removeCookies);
                    if (cb) {
                        cb();
                    }
                    else {
                        window.location.reload();
                    }
                }
            });
        }
    };
    const CommonHelpers = {
        downloadRawData,
        copyToClipboard,
        getLetterByNumber,
        clearBrowserCache,
        clearBrowserCacheListener,
        removeAllCookies
    };

    const defaultOptions = {
        prefix: 'US$ ',
        suffix: '',
        decimal: '.',
        thousand: ',',
        precision: 2,
        acceptNegative: true,
        isInteger: false
    };

    /*
     * igortrinidad/vue-number-format
     *
     * (c) Igor Trindade <igortrindade.me@gmail.com>
     *
     * Mostly of this file content was extracted from the https://github.com/maico910/vue-number-format/blob/vite-typescript-refactor/src/utils.ts
     *
     * For the full copyright and license information, please view the LICENSE
     * file that was distributed with this source code.
     */
    const formatNumber = (input = '0', opt = {}) => {
        const mergedOptions = Object.assign(Object.assign({}, defaultOptions), opt);
        let inputInString;
        if (!!input) {
            if (typeof input === 'number' && !mergedOptions.isInteger) {
                inputInString = input.toFixed(fixed(mergedOptions.precision));
            }
            else {
                inputInString = input.toString();
            }
        }
        else {
            inputInString = '';
        }
        const minusSymbol = isNegative(inputInString, mergedOptions.acceptNegative) ? '-' : '';
        const numbers = inputOnlyNumbers(inputInString.toString());
        const currencyInString = numbersToCurrency(numbers, mergedOptions.precision);
        const currencyParts = currencyInString.split('.');
        const decimal = currencyParts[1];
        const integer = addThousandSeparator(currencyParts[0], mergedOptions.thousand);
        return minusSymbol + mergedOptions.prefix + joinIntegerAndDecimal(integer, decimal, mergedOptions.decimal) + mergedOptions.suffix;
    };
    const unformatNumber = (input = 0, opt = {}) => {
        const mergedOptions = Object.assign({}, defaultOptions, opt);
        const userInput = input || 0;
        const numbers = inputOnlyNumbers(userInput);
        if (mergedOptions.isInteger) {
            return parseInt(`${isNegative(userInput, mergedOptions.acceptNegative) ? '-' : ''}${numbers.toString()}`);
        }
        const makeNumberNegative = (isNegative(userInput, mergedOptions.acceptNegative));
        const currency = numbersToCurrency(numbers, mergedOptions.precision);
        return makeNumberNegative ? parseFloat(currency) * -1 : parseFloat(currency);
    };
    function inputOnlyNumbers(input = 0) {
        return input ? input.toString().replace(/\D+/g, '') : '0';
    }
    // 123 RangeError: toFixed() digits argument must be between 0 and 20 at Number.toFixed
    function fixed(precision) {
        return Math.max(0, Math.min(precision, 20));
    }
    function numbersToCurrency(numbers, precision) {
        const exp = Math.pow(10, precision);
        const float = parseFloat(numbers) / exp;
        return float.toFixed(fixed(precision));
    }
    function addThousandSeparator(integer, separator) {
        return integer.replace(/(\d)(?=(?:\d{3})+\b)/gm, `$1${separator}`);
    }
    function joinIntegerAndDecimal(integer, decimal, separator) {
        if (decimal) {
            return integer + separator + decimal;
        }
        return integer;
    }
    function isNegative(string, acceptNegative = true) {
        if (!acceptNegative)
            return false;
        const value = string.toString();
        const isNegative = (value.startsWith('-') || value.endsWith('-'));
        const forcePositive = value.indexOf('+') > 0;
        return isNegative && !forcePositive;
    }
    const NumberFormat = {
        formatNumber,
        unformatNumber,
    };

    class UrlItem {
        constructor(urlItem) {
            this.lastModified = new Date().toISOString().substring(0, 10);
            this.changeFreq = 'monthly';
            this.priority = '1.0';
            this.image = null;
            if (!urlItem.url)
                throw new Error('Url is required');
            this.url = this.removeFirstSlashFromUrl(urlItem.url);
            if (urlItem.lastModified)
                this.lastModified = urlItem.lastModified;
            if (urlItem.changeFreq)
                this.changeFreq = urlItem.changeFreq;
            if (urlItem.priority)
                this.priority = urlItem.priority;
            if (urlItem.image)
                this.image = urlItem.image;
        }
        removeFirstSlashFromUrl(url) {
            if (url[0] == '/')
                return url.substring(1);
            return url;
        }
    }
    class SiteMapGenerator {
        constructor(baseUrl) {
            this.baseUrl = '';
            this.items = [];
            this.xmlStylesheetPath = '';
            this.baseUrl = baseUrl;
            this.items = [];
        }
        get getHeader() {
            const header = `
${this.xmlStylesheetPath ? `<?xml-stylesheet href="${this.xmlStylesheetPath}" type="text/xsl"?>` : ''}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;
            return header;
        }
        get getBody() {
            return this.items.map((item) => {
                var itemResult = `
  <url>
    <loc>${this.baseUrl}${(!item.url) ? '' : `/${item.url}`}</loc>
    <priority>${item.priority}</priority>
    <lastmod>${item.lastModified}</lastmod>
    <changefreq>${item.changeFreq}</changefreq>`;
                if (item.image) {
                    itemResult +=
                        `
      <image:image>
        <image:loc>${item.image.url}</image:loc>
        <image:caption>${item.image.caption}</image:caption>
        <image:title>${item.image.title}</image:title>
      </image:image>`;
                }
                itemResult +=
                    `
  </url>
`;
                return itemResult;
            })
                .join('');
        }
        get getFooter() {
            return `</urlset>`;
        }
        setXmlStyleSheetPath(path) {
            this.xmlStylesheetPath = path;
        }
        addItem(urlItem) {
            this.items.push(new UrlItem(urlItem));
        }
        generate() {
            const result = `
${this.getHeader}
${this.getBody}
${this.getFooter}
`;
            return result;
        }
    }

    const titleCaseString = (str) => {
        return str.toString().split(' ').map((str) => str.toUpperCase().charAt(0) + str.substring(1).toLowerCase()).join(' ');
    };
    const randomString = (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };
    const joinCommaPlusAnd = (a, unifierString = ' and ') => {
        return [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(a.length < 2 ? '' : unifierString);
    };
    function levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    }
    const checkStringSimilarity = (base, stringToCompare, caseInsensitive = true) => {
        if (caseInsensitive) {
            base = base.toLowerCase();
            stringToCompare = stringToCompare.toLowerCase();
        }
        const distance = levenshtein(base, stringToCompare);
        const maxLen = Math.max(base.length, stringToCompare.length);
        const similarity = 1 - distance / maxLen;
        return similarity;
    };
    const checkStringIsSimilar = (base, stringToCompare, threshold = 0.8, caseInsensitive = true) => {
        return checkStringSimilarity(base, stringToCompare, caseInsensitive) >= threshold;
    };
    const ensureStartsWithUpperCase = (str = '') => {
        if (!str)
            return '';
        const trimmedStart = str.trimStart();
        return str.slice(0, str.length - trimmedStart.length) + trimmedStart[0].toUpperCase() + trimmedStart.slice(1);
    };
    const truncateText = (text = '', max = 40) => {
        try {
            if (!text)
                return '';
            if (max <= 0)
                return text + '...';
            return text.length > max ? `${text.substring(0, max)}...` : text;
        }
        catch (error) {
            return text || '';
        }
    };
    const StringHelpers = {
        titleCaseString,
        randomString,
        joinCommaPlusAnd,
        checkStringSimilarity,
        checkStringIsSimilar,
        ensureStartsWithUpperCase,
        truncateText,
    };

    const extractMatchs = (text, regex) => {
        const matches = text.match(regex) || [];
        return [...new Set(matches)];
    };
    const extractUuidsV4 = (text) => {
        const regex = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/g;
        return extractMatchs(text, regex);
    };
    const RegexHelpers = {
        extractMatchs,
        extractUuidsV4
    };

    function maskit(value, mask, masked = true, tokens) {
        value = value || '';
        mask = mask || '';
        let iMask = 0;
        let iValue = 0;
        let output = '';
        while (iMask < mask.length && iValue < value.length) {
            var cMask = mask[iMask];
            const masker = tokens[cMask];
            const cValue = value[iValue];
            if (masker && !masker.escape) {
                if (masker.pattern.test(cValue)) {
                    output += masker.transform ? masker.transform(cValue) : cValue;
                    iMask++;
                }
                iValue++;
            }
            else {
                if (masker && masker.escape) {
                    iMask++; // take the next mask char and treat it as char
                    cMask = mask[iMask];
                }
                if (masked)
                    output += cMask;
                if (cValue === cMask)
                    iValue++; // user typed the same char
                iMask++;
            }
        }
        // fix mask that ends with a char: (#)
        let restOutput = '';
        while (iMask < mask.length && masked) {
            var cMask = mask[iMask];
            if (tokens[cMask]) {
                restOutput = '';
                break;
            }
            restOutput += cMask;
            iMask++;
        }
        return output + restOutput;
    }

    function dynamicMask(maskit, masks, tokens) {
        masks = masks.sort((a, b) => a.length - b.length);
        return function (value, mask, masked = true) {
            var i = 0;
            while (i < masks.length) {
                var currentMask = masks[i];
                i++;
                var nextMask = masks[i];
                if (!(nextMask && maskit(value, nextMask, true, tokens).length > currentMask.length)) {
                    return maskit(value, currentMask, masked, tokens);
                }
            }
            return '';
        };
    }

    var tokens = {
        '#': { pattern: /\d/ },
        X: { pattern: /[0-9a-zA-Z]/ },
        S: { pattern: /[a-zA-Z]/ },
        A: { pattern: /[a-zA-Z]/, transform: (v) => v.toLocaleUpperCase() },
        a: { pattern: /[a-zA-Z]/, transform: (v) => v.toLocaleLowerCase() },
        '!': { escape: true }
    };

    const masker = function (value, mask, masked = true) {
        value = String(value);
        return Array.isArray(mask)
            ? dynamicMask(maskit, mask, tokens)(value, mask, masked, tokens)
            : maskit(value, mask, masked, tokens);
    };

    const DEFAULT_PHONE_DDI = ['+###', '+##', '+#', '+#-###'];
    const DEFAULT_PHONE_MASK = ['(##) #####-####', '(##) ####-####'];
    const DEFAULT_PHONE_MASK_WITH_DDI = ['+## ### ## ## ##', '+# (###) ###-####', '+## (##) ####-####', '+## (##) #####-####',];

    const mask = (value, mask) => {
        return masker(value, mask, true);
    };
    const unmask = (value, mask) => {
        return masker(value, mask, false);
    };
    const Masker = {
        mask,
        unmask,
        DEFAULT_PHONE_DDI,
        DEFAULT_PHONE_MASK,
        DEFAULT_PHONE_MASK_WITH_DDI
    };

    const mapArrayToGraphQL = (array, key = null) => {
        const items = array.map((item) => `"${key ? item[key] : item}"`).join(',');
        return `[${items}]`;
    };
    const GraphQLHelpers = {
        mapArrayToGraphQL
    };

    exports.ArrayHelpers = ArrayHelpers;
    exports.CommonHelpers = CommonHelpers;
    exports.GraphQLHelpers = GraphQLHelpers;
    exports.Masker = Masker;
    exports.MathHelpers = MathHelpers;
    exports.NumberFormat = NumberFormat;
    exports.ObjectHelpers = ObjectHelpers;
    exports.RegexHelpers = RegexHelpers;
    exports.SiteMapGenerator = SiteMapGenerator;
    exports.StringHelpers = StringHelpers;
    exports.UrlItem = UrlItem;
    exports.addPercentage = addPercentage;
    exports.checkIsEqual = checkIsEqual;
    exports.checkObjMatch = checkObjMatch;
    exports.checkSameStructure = checkSameStructure;
    exports.checkStringIsSimilar = checkStringIsSimilar;
    exports.checkStringSimilarity = checkStringSimilarity;
    exports.clearBrowserCache = clearBrowserCache;
    exports.clearBrowserCacheListener = clearBrowserCacheListener;
    exports.compareArray = compareArray;
    exports.copyToClipboard = copyToClipboard;
    exports.deepMergeObject = deepMergeObject;
    exports.deepSearchKey = deepSearchKey;
    exports.defineProperty = defineProperty;
    exports.deleteNestedObjectByKey = deleteNestedObjectByKey;
    exports.downloadRawData = downloadRawData;
    exports.ensureStartsWithUpperCase = ensureStartsWithUpperCase;
    exports.extractMatchs = extractMatchs;
    exports.extractUuidsV4 = extractUuidsV4;
    exports.filterObjectKeys = filterObjectKeys;
    exports.find = find;
    exports.findAll = findAll;
    exports.findByObj = findByObj;
    exports.findByString = findByString;
    exports.findIndex = findIndex;
    exports.formatNumber = formatNumber;
    exports.getAmountOfPercentage = getAmountOfPercentage;
    exports.getLetterByNumber = getLetterByNumber;
    exports.getNestedObjectByKey = getNestedObjectByKey;
    exports.getPercentageOfAmount = getPercentageOfAmount;
    exports.getRandomElement = getRandomElement;
    exports.getValueOrMinPercentage = getValueOrMinPercentage;
    exports.initClassData = initClassData;
    exports.isObject = isObject;
    exports.joinCommaPlusAnd = joinCommaPlusAnd;
    exports.mapArrayToGraphQL = mapArrayToGraphQL;
    exports.mask = mask;
    exports.objArrayToCsv = objArrayToCsv;
    exports.randomInt = randomInt;
    exports.randomString = randomString;
    exports.remove = remove;
    exports.removeAll = removeAll;
    exports.removeAllCookies = removeAllCookies;
    exports.round = round;
    exports.setNestedObjectByKey = setNestedObjectByKey;
    exports.shuffle = shuffle;
    exports.titleCaseString = titleCaseString;
    exports.toggleInArray = toggleInArray;
    exports.truncateText = truncateText;
    exports.unformatNumber = unformatNumber;
    exports.uniqueByKey = uniqueByKey;
    exports.unmask = unmask;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eWZ5LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvVXRpbC50cyIsIi4uLy4uLy4uL3NyYy9PYmplY3RIZWxwZXJzLnRzIiwiLi4vLi4vLi4vc3JjL0FycmF5SGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9NYXRoSGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9Db21tb25IZWxwZXJzLnRzIiwiLi4vLi4vLi4vc3JjL3R5cGVzL051bWJlckZvcm1hdE9wdGlvbnMudHMiLCIuLi8uLi8uLi9zcmMvTnVtYmVyRm9ybWF0LnRzIiwiLi4vLi4vLi4vc3JjL1NpdGVNYXBHZW5lcmF0b3IudHMiLCIuLi8uLi8uLi9zcmMvU3RyaW5nSGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9SZWdleEhlbHBlcnMudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9tYXNraXQudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9keW5hbWljLW1hc2sudHMiLCIuLi8uLi8uLi9zcmMvbWFzay90b2tlbnMudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9tYXNrZXIudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9lbnVtcy50cyIsIi4uLy4uLy4uL3NyYy9NYXNrZXIudHMiLCIuLi8uLi8uLi9zcmMvR3JhcGhRTC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgcmVtYXBBcnJheVRvTG93ZXJDYXNlSWZTdHJpbmcgPSAoYXJyOiBhbnlbXSA9IFtdKSA9PiB7XG4gIHJldHVybiBhcnIubWFwKGl0ZW0gPT4gbG93ZXJDYXNlQW5kU3RyaW5naWZ5SWZOdW1iZXIoaXRlbSkpXG59XG5cblxuZXhwb3J0IGNvbnN0IGxvd2VyQ2FzZUFuZFN0cmluZ2lmeUlmTnVtYmVyID0gKGl0ZW06IGFueSkgPT4ge1xuICBpZih0eXBlb2YoaXRlbSkgPT09ICdzdHJpbmcnKSByZXR1cm4gaXRlbS50b0xvd2VyQ2FzZSgpXG4gIGlmKHR5cGVvZihpdGVtKSA9PT0gJ251bWJlcicpIHJldHVybiBpdGVtLnRvU3RyaW5nKClcbiAgcmV0dXJuIGl0ZW1cbn0iLCJpbXBvcnQgeyByZW1hcEFycmF5VG9Mb3dlckNhc2VJZlN0cmluZywgbG93ZXJDYXNlQW5kU3RyaW5naWZ5SWZOdW1iZXIgfSBmcm9tICcuL1V0aWwnXG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJPYmplY3RLZXlzID0gKGFsbG93ZWQ6IGFueVtdLCBvYmplY3Q6IGFueSk6IGFueSA9PiB7XG4gIHJldHVybiBhbGxvd2VkLnJlZHVjZSgoYWNjLCBhbGxvd2VkQXR0cmlidXRlKSA9PiB7XG4gICAgaWYgKG9iamVjdCAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBhbGxvd2VkQXR0cmlidXRlKSkgeyBhY2NbYWxsb3dlZEF0dHJpYnV0ZV0gPSBvYmplY3RbYWxsb3dlZEF0dHJpYnV0ZV0gfVxuICAgIHJldHVybiBhY2NcbiAgfSwge30pXG59XG5cbmV4cG9ydCBjb25zdCBjaGVja09iak1hdGNoID0gKGl0ZW06IGFueSwgcXVlcnk6IGFueSwgaWdub3JlRW1wdHlBcnJheTogYm9vbGVhbiA9IGZhbHNlKTogYW55ID0+IHtcbiAgY29uc3QgZGlmZktleXMgPSBPYmplY3Qua2V5cyhxdWVyeSkuZmlsdGVyKChrZXkpID0+IHtcbiAgICBsZXQgYXR0clF1ZXJ5ID0gbG93ZXJDYXNlQW5kU3RyaW5naWZ5SWZOdW1iZXIoaXRlbVtrZXldKVxuICAgIGlmKEFycmF5LmlzQXJyYXkocXVlcnlba2V5XSkpIHtcbiAgICAgIGlmKCFxdWVyeVtrZXldLmxlbmd0aCkgcmV0dXJuIGlnbm9yZUVtcHR5QXJyYXlcbiAgICAgIHJldHVybiAhcmVtYXBBcnJheVRvTG93ZXJDYXNlSWZTdHJpbmcocXVlcnlba2V5XSkuaW5jbHVkZXMoYXR0clF1ZXJ5KVxuICAgIH1cbiAgICByZXR1cm4gIWNoZWNrSXNFcXVhbChhdHRyUXVlcnksIHF1ZXJ5W2tleV0pXG4gIH0pXG4gIGlmKGRpZmZLZXlzLmxlbmd0aCkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBpdGVtXG59XG5cbmV4cG9ydCBjb25zdCBjaGVja0lzRXF1YWwgPSAodmFsdWU6IGFueSwgcXVlcnk6IGFueSk6IGJvb2xlYW4gPT4ge1xuICBpZih0eXBlb2YocXVlcnkpID09PSAnc3RyaW5nJyAmJiB0eXBlb2YodmFsdWUpID09PSAnc3RyaW5nJykgcmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCkgPT0gcXVlcnkudG9Mb3dlckNhc2UoKVxuICByZXR1cm4gdmFsdWUgPT0gcXVlcnlcbn1cblxuZXhwb3J0IGNvbnN0IGluaXRDbGFzc0RhdGEgPSAoZmlsbGFibGU6IGFueVtdLCBpbnN0YW5jZTogYW55LCBvYmo6IGFueSA9IHt9KSA9PiB7ICBcbiAgZm9yKGNvbnN0IGF0dHIgb2YgZmlsbGFibGUpIHtcbiAgICBpZih0eXBlb2Yob2JqW2F0dHIua2V5XSkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGluc3RhbmNlW2F0dHIua2V5XSA9IG9ialthdHRyLmtleV1cbiAgICB9IGVsc2Uge1xuICAgICAgaW5zdGFuY2VbYXR0ci5rZXldID0gYXR0ci5kZWZhdWx0XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3RhbmNlLCAnZ2V0RmlsbGFibGVLZXlzJywge1xuICAgICAgZ2V0KCkgeyByZXR1cm4gZmlsbGFibGUubWFwKChpdGVtKSA9PiBpdGVtLmtleSkgfSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGRlZmluZVByb3BlcnR5ID0gKG9iamVjdDogYW55LCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkgPT4ge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSlcbiAgcmV0dXJuIG9iamVjdFxufVxuXG5leHBvcnQgY29uc3QgaXNPYmplY3QgPSAoaXRlbTogYW55KTogYm9vbGVhbiA9PiB7XG4gIHJldHVybiAoaXRlbSAmJiB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoaXRlbSkpO1xufVxuXG5leHBvcnQgY29uc3QgZGVlcE1lcmdlT2JqZWN0ID0gKHRhcmdldDogYW55LCAuLi5zb3VyY2VzOiBhbnkpOiBhbnkgPT4ge1xuICBpZiAoIXNvdXJjZXMubGVuZ3RoKSByZXR1cm4gdGFyZ2V0O1xuICBjb25zdCBzb3VyY2UgPSBzb3VyY2VzLnNoaWZ0KCk7XG5cbiAgaWYgKGlzT2JqZWN0KHRhcmdldCkgJiYgaXNPYmplY3Qoc291cmNlKSkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIHNvdXJjZSkge1xuICAgICAgaWYgKGlzT2JqZWN0KHNvdXJjZVtrZXldKSkge1xuICAgICAgICBpZiAoIXRhcmdldFtrZXldKSBPYmplY3QuYXNzaWduKHRhcmdldCwge1xuICAgICAgICAgIFtrZXldOiB7fVxuICAgICAgICB9KTtcbiAgICAgICAgZGVlcE1lcmdlT2JqZWN0KHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRhcmdldCwge1xuICAgICAgICAgIFtrZXldOiBzb3VyY2Vba2V5XVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGVlcE1lcmdlT2JqZWN0KHRhcmdldCwgLi4uc291cmNlcyk7XG59XG5cbmV4cG9ydCBjb25zdCBnZXROZXN0ZWRPYmplY3RCeUtleSA9IChvYmo6IGFueSA9IHt9LCBrZXk6IHN0cmluZyA9ICcnKTogYW55ID0+IHtcbiAgcmV0dXJuIGtleS5zcGxpdCgnLicpLnJlZHVjZSgoYWNjLCBrKSA9PiB7XG4gICAgaWYgKGFjYyA9PT0gdW5kZWZpbmVkIHx8IGFjYyA9PT0gbnVsbCkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgY29uc3QgYXJyYXlNYXRjaCA9IGsubWF0Y2goL14oW15cXFtdKylcXFsoXFxkKylcXF0kLylcbiAgICBpZiAoYXJyYXlNYXRjaCkge1xuICAgICAgY29uc3QgYXJyYXlLZXkgPSBhcnJheU1hdGNoWzFdXG4gICAgICBjb25zdCBhcnJheUluZGV4ID0gcGFyc2VJbnQoYXJyYXlNYXRjaFsyXSwgMTApXG5cbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShhY2NbYXJyYXlLZXldKSB8fCBhY2NbYXJyYXlLZXldW2FycmF5SW5kZXhdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgcmV0dXJuIGFjY1thcnJheUtleV1bYXJyYXlJbmRleF1cbiAgICB9XG5cbiAgICByZXR1cm4gYWNjW2tdXG4gIH0sIG9iailcbn1cblxuZXhwb3J0IGNvbnN0IHNldE5lc3RlZE9iamVjdEJ5S2V5ID0gKG9iajogYW55ID0ge30sIGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCBhbGxvd05vbkV4aXN0aW5nQXJyYXlJbmRleDogYm9vbGVhbiA9IGZhbHNlKTogYW55ID0+IHtcbiAgb2JqID0gT2JqZWN0LmFzc2lnbih7fSwgb2JqKVxuICBrZXkuc3BsaXQoJy4nKS5yZWR1Y2UoKGFjYywgaywgaW5kZXgsIGtleXMpID0+IHtcbiAgICBjb25zdCBhcnJheU1hdGNoID0gay5tYXRjaCgvXihbXlxcW10rKVxcWyhcXGQrKVxcXSQvKVxuXG4gICAgaWYgKGFycmF5TWF0Y2gpIHtcbiAgICAgIGNvbnN0IGFycmF5S2V5ID0gYXJyYXlNYXRjaFsxXVxuICAgICAgY29uc3QgYXJyYXlJbmRleCA9IHBhcnNlSW50KGFycmF5TWF0Y2hbMl0sIDEwKVxuXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWNjW2FycmF5S2V5XSkpIHtcbiAgICAgICAgaWYgKGFjY1thcnJheUtleV0gIT09IHVuZGVmaW5lZCAmJiAodHlwZW9mIGFjY1thcnJheUtleV0gIT09ICdvYmplY3QnKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYENhbm5vdCBzZXQgcHJvcGVydHkgJyR7YXJyYXlLZXl9WyR7YXJyYXlJbmRleH1dJyBvbiBub24tb2JqZWN0IHR5cGUgKCR7dHlwZW9mIGFjY1thcnJheUtleV19KSBhdCBwYXRoICcke2tleXMuc2xpY2UoMCwgaW5kZXggKyAxKS5qb2luKCcuJyl9J2ApXG4gICAgICAgIH1cbiAgICAgICAgYWNjW2FycmF5S2V5XSA9IFtdXG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGlmIHRoZSBhcnJheSBoYXMgdGhlIHNwZWNpZmllZCBpbmRleFxuICAgICAgaWYgKCFhbGxvd05vbkV4aXN0aW5nQXJyYXlJbmRleCAmJiBhcnJheUluZGV4ID49IGFjY1thcnJheUtleV0ubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBBcnJheSAnJHthcnJheUtleX0nIGRvZXMgbm90IGhhdmUgaW5kZXggJHthcnJheUluZGV4fSBhdCBwYXRoICcke2tleXMuc2xpY2UoMCwgaW5kZXggKyAxKS5qb2luKCcuJyl9J2ApXG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB0aGUgY3VycmVudCBhY2N1bXVsYXRvciB0byB0aGUgc3BlY2lmaWVkIGluZGV4IGluIHRoZSBhcnJheVxuICAgICAgYWNjID0gYWNjW2FycmF5S2V5XVxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgayA9IGFycmF5SW5kZXhcbiAgICB9XG5cbiAgICBpZiAoaW5kZXggPT09IGtleXMubGVuZ3RoIC0gMSkge1xuICAgICAgYWNjW2tdID0gdmFsdWVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhyb3cgYW4gZXJyb3IgaWYgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgbm90IGFuIG9iamVjdFxuICAgICAgaWYgKGFjY1trXSAhPT0gdW5kZWZpbmVkICYmICh0eXBlb2YgYWNjW2tdICE9PSAnb2JqZWN0JykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQ2Fubm90IHNldCBwcm9wZXJ0eSAnJHtrfScgb24gbm9uLW9iamVjdCB0eXBlICgke3R5cGVvZiBhY2Nba119KSBhdCBwYXRoICcke2tleXMuc2xpY2UoMCwgaW5kZXggKyAxKS5qb2luKCcuJyl9J2ApXG4gICAgICB9XG4gICAgICBhY2Nba10gPSBhY2Nba10gfHwge31cbiAgICB9XG5cbiAgICByZXR1cm4gYWNjW2tdXG4gIH0sIG9iailcblxuICByZXR1cm4gb2JqXG59XG5cbmV4cG9ydCBjb25zdCBkZWxldGVOZXN0ZWRPYmplY3RCeUtleSA9IChvYmo6IGFueSwga2V5OiBzdHJpbmcsIGlnbm9yZU5vbkV4aXN0aW5nOiBib29sZWFuID0gdHJ1ZSk6IGFueSA9PiB7XG4gIGNvbnN0IGtleXMgPSBrZXkuc3BsaXQoJy4nKVxuXG4gIGtleXMucmVkdWNlKChhY2M6IGFueSwgaywgaW5kZXgpID0+IHtcbiAgICBjb25zdCBhcnJheU1hdGNoID0gay5tYXRjaCgvXihbXlxcW10rKVxcWyhcXGQrKVxcXSQvKVxuXG4gICAgaWYgKGFycmF5TWF0Y2gpIHtcbiAgICAgIGNvbnN0IGFycmF5S2V5ID0gYXJyYXlNYXRjaFsxXVxuICAgICAgY29uc3QgYXJyYXlJbmRleCA9IHBhcnNlSW50KGFycmF5TWF0Y2hbMl0sIDEwKVxuXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWNjW2FycmF5S2V5XSkgJiYgIWlnbm9yZU5vbkV4aXN0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYENhbm5vdCBkZWxldGUgcHJvcGVydHkgJyR7YXJyYXlLZXl9WyR7YXJyYXlJbmRleH1dJyBvbiBub24tYXJyYXkgdHlwZSBhdCBwYXRoICcke2tleXMuc2xpY2UoMCwgaW5kZXggKyAxKS5qb2luKCcuJyl9J2ApXG4gICAgICB9XG5cbiAgICAgIGlmIChpbmRleCA9PT0ga2V5cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIC8vIExhc3QgZWxlbWVudCBpbiBwYXRoOiBkZWxldGUgYXJyYXkgaXRlbVxuICAgICAgICBpZiAoYXJyYXlJbmRleCA+PSBhY2NbYXJyYXlLZXldLmxlbmd0aCAmJiAhaWdub3JlTm9uRXhpc3RpbmcpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgQXJyYXkgJyR7YXJyYXlLZXl9JyBkb2VzIG5vdCBoYXZlIGluZGV4ICR7YXJyYXlJbmRleH0gYXQgcGF0aCAnJHtrZXlzLnNsaWNlKDAsIGluZGV4ICsgMSkuam9pbignLicpfSdgKVxuICAgICAgICB9XG4gICAgICAgIGFjY1thcnJheUtleV0uc3BsaWNlKGFycmF5SW5kZXgsIDEpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY2MgPSBhY2NbYXJyYXlLZXldW2FycmF5SW5kZXhdXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpbmRleCA9PT0ga2V5cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIC8vIExhc3QgZWxlbWVudCBpbiBwYXRoOiBkZWxldGUgb2JqZWN0IGtleVxuICAgICAgICBpZiAoYWNjICYmIGFjYy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgIGRlbGV0ZSBhY2Nba11cbiAgICAgICAgfSBlbHNlIGlmKCFpZ25vcmVOb25FeGlzdGluZykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGRlbGV0ZSBub24tZXhpc3RlbnQgcHJvcGVydHkgJyR7a30nIGF0IHBhdGggJyR7a2V5cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKX0nYClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVHJhdmVyc2UgdGhlIG9iamVjdCwgZW5zdXJpbmcgd2UgZG9uJ3QgdHJ5IHRvIGFjY2VzcyBhIG5vbi1vYmplY3RcbiAgICAgICAgaWYoaWdub3JlTm9uRXhpc3RpbmcpIHtcbiAgICAgICAgICBpZiAoIWFjY1trXSB8fCB0eXBlb2YgYWNjW2tdICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIGFjY1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlnbm9yZU5vbkV4aXN0aW5nICYmICghYWNjW2tdIHx8IHR5cGVvZiBhY2Nba10gIT09ICdvYmplY3QnKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYENhbm5vdCBkZWxldGUgcHJvcGVydHkgJyR7a30nIG9uIG5vbi1vYmplY3QgdHlwZSBhdCBwYXRoICcke2tleXMuc2xpY2UoMCwgaW5kZXggKyAxKS5qb2luKCcuJyl9J2ApXG4gICAgICAgIH1cbiAgICAgICAgYWNjID0gYWNjW2tdXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjY1xuICB9LCBvYmopXG5cbiAgcmV0dXJuIG9ialxufVxuXG50eXBlIEFueU9iamVjdCA9IFJlY29yZDxzdHJpbmcsIGFueT5cblxuZXhwb3J0IGNvbnN0IGRlZXBTZWFyY2hLZXkgPSAoXG4gIG9iajogQW55T2JqZWN0LFxuICB0YXJnZXRLZXk6IHN0cmluZyxcbiAgcmV0dXJuQWxsOiBib29sZWFuID0gZmFsc2Vcbik6IGFueVtdIHwgYW55ID0+IHtcbiAgY29uc3QgcmVzdWx0czogYW55W10gPSBbXVxuICBsZXQgZmlyc3RSZXN1bHQ6IGFueSA9IG51bGxcblxuICBjb25zdCBzZWFyY2ggPSAoY3VycmVudE9iajogQW55T2JqZWN0KSA9PiB7XG4gICAgaWYgKCFyZXR1cm5BbGwgJiYgZmlyc3RSZXN1bHQgIT09IG51bGwpIHJldHVyblxuICAgIGlmICh0eXBlb2YgY3VycmVudE9iaiAhPT0gJ29iamVjdCcgfHwgY3VycmVudE9iaiA9PT0gbnVsbCkgcmV0dXJuXG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBjdXJyZW50T2JqKSB7XG4gICAgICBpZiAoa2V5ID09PSB0YXJnZXRLZXkpIHtcbiAgICAgICAgaWYgKHJldHVybkFsbCkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaChjdXJyZW50T2JqW2tleV0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZmlyc3RSZXN1bHQgPSBjdXJyZW50T2JqW2tleV1cbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2VhcmNoKGN1cnJlbnRPYmpba2V5XSlcbiAgICB9XG4gIH1cblxuICBzZWFyY2gob2JqKVxuICByZXR1cm4gcmV0dXJuQWxsID8gcmVzdWx0cyA6IGZpcnN0UmVzdWx0XG59XG5cbmV4cG9ydCBjb25zdCBjaGVja1NhbWVTdHJ1Y3R1cmUgPSAoXG4gIGJhc2VPYmo6IEFueU9iamVjdCxcbiAgY29tcGFyZU9iajogQW55T2JqZWN0XG4pOiBib29sZWFuID0+IHtcbiAgaWYgKHR5cGVvZiBiYXNlT2JqICE9PSAnb2JqZWN0JyB8fCBiYXNlT2JqID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBiYXNlT2JqID09PSB0eXBlb2YgY29tcGFyZU9ialxuICB9XG4gIGlmICh0eXBlb2YgY29tcGFyZU9iaiAhPT0gJ29iamVjdCcgfHwgY29tcGFyZU9iaiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGZvciAoY29uc3Qga2V5IGluIGJhc2VPYmopIHtcbiAgICBpZiAoIShrZXkgaW4gY29tcGFyZU9iaikpIHJldHVybiBmYWxzZVxuICAgIGlmICghY2hlY2tTYW1lU3RydWN0dXJlKGJhc2VPYmpba2V5XSwgY29tcGFyZU9ialtrZXldKSkgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcmV0dXJuIHRydWVcbn1cblxuZXhwb3J0IGNvbnN0IE9iamVjdEhlbHBlcnMgPSB7XG4gIGZpbHRlck9iamVjdEtleXMsXG4gIGNoZWNrT2JqTWF0Y2gsXG4gIGNoZWNrSXNFcXVhbCxcbiAgaW5pdENsYXNzRGF0YSxcbiAgZGVmaW5lUHJvcGVydHksXG4gIGlzT2JqZWN0LFxuICBkZWVwTWVyZ2VPYmplY3QsXG4gIGdldE5lc3RlZE9iamVjdEJ5S2V5LFxuICBzZXROZXN0ZWRPYmplY3RCeUtleSxcbiAgZGVsZXRlTmVzdGVkT2JqZWN0QnlLZXksXG4gIGRlZXBTZWFyY2hLZXlcbn0iLCJpbXBvcnQgeyBjaGVja09iak1hdGNoLCBjaGVja0lzRXF1YWwgfSBmcm9tICcuL09iamVjdEhlbHBlcnMnXG5pbXBvcnQgeyByZW1hcEFycmF5VG9Mb3dlckNhc2VJZlN0cmluZyB9IGZyb20gJy4vVXRpbCdcblxuZXhwb3J0IGNvbnN0IGZpbmRCeU9iaiA9IChhcnI6IGFueVtdLCBvYmo6IGFueSwgYXNCb29sZWFuOiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBmb3IoY29uc3QgaXRlbSBvZiBhcnIpIHtcbiAgICBpZighY2hlY2tPYmpNYXRjaChpdGVtLCBvYmopKSBjb250aW51ZVxuICAgIHJldHVybiBhc0Jvb2xlYW4gPyB0cnVlIDogaXRlbVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5leHBvcnQgY29uc3QgZmluZEJ5U3RyaW5nID0gKGFycjogYW55W10sIGl0ZW06IGFueSwgYXNCb29sZWFuOiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBmb3IoY29uc3QgYXJySXRlbSBvZiBhcnIpIHtcbiAgICBpZih0eXBlb2YoYXJySXRlbSkgPT09ICdzdHJpbmcnICYmIHR5cGVvZihpdGVtKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmKGFyckl0ZW0udG9Mb3dlckNhc2UoKSA9PSBpdGVtLnRvTG93ZXJDYXNlKCkpIHJldHVybiBhc0Jvb2xlYW4gPyB0cnVlIDogYXJySXRlbVxuICAgIH0gXG5cbiAgICBpZihhcnJJdGVtID09IGl0ZW0pIHtcbiAgICAgIHJldHVybiBhc0Jvb2xlYW4gPyB0cnVlIDogYXJySXRlbVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZXhwb3J0IGNvbnN0IGZpbmQgPSAoYXJyOiBhbnlbXSwgcXVlcnk6IGFueSwgYXNCb29sZWFuOiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBpZihBcnJheS5pc0FycmF5KHF1ZXJ5KSApIHJldHVybiBmYWxzZVxuICBpZih0eXBlb2YocXVlcnkpID09PSAnb2JqZWN0JykgcmV0dXJuIGZpbmRCeU9iaihhcnIsIHF1ZXJ5LCBhc0Jvb2xlYW4pXG4gIHJldHVybiBmaW5kQnlTdHJpbmcoYXJyLCBxdWVyeSwgYXNCb29sZWFuKVxufVxuXG5leHBvcnQgY29uc3QgZmluZEluZGV4ID0gKGFycjogYW55W10sIHF1ZXJ5OiBhbnkpOiBudW1iZXIgPT4ge1xuICBpZih0eXBlb2YocXVlcnkpID09PSAnb2JqZWN0Jykge1xuICAgIGNvbnN0IGZpbmRlZEJ5T2JqID0gZmluZEJ5T2JqKGFyciwgcXVlcnkpXG4gICAgcmV0dXJuIGZpbmRlZEJ5T2JqICE9IGZhbHNlID8gYXJyLmluZGV4T2YoZmluZGVkQnlPYmopIDogLTEgXG4gIH1cbiAgY29uc3QgZmluZGVkQnlTdHJpbmcgPSBmaW5kQnlTdHJpbmcoYXJyLCBxdWVyeSlcbiAgcmV0dXJuIGZpbmRlZEJ5U3RyaW5nICE9PSBmYWxzZSA/IGFyci5pbmRleE9mKGZpbmRlZEJ5U3RyaW5nKSA6IC0xICBcbn1cblxuZXhwb3J0IGNvbnN0IGZpbmRBbGwgPSAoYXJyOiBhbnlbXSwgcXVlcnk6IGFueSwgaWdub3JlRW1wdHlBcnJheTogYm9vbGVhbiA9IGZhbHNlKTogYW55W10gPT4ge1xuICBpZiAoIXF1ZXJ5KSByZXR1cm4gYXJyXG4gIHJldHVybiBhcnIuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgY29uc3QgaXRlbVRvTWF0Y2ggPSB0eXBlb2YoaXRlbSkgPT09ICdzdHJpbmcnID8gaXRlbS50b0xvd2VyQ2FzZSgpIDogaXRlbVxuICAgIGlmKHR5cGVvZihxdWVyeSkgPT0gJ3N0cmluZycpIHJldHVybiBjaGVja0lzRXF1YWwoaXRlbSwgcXVlcnkpXG4gICAgaWYoQXJyYXkuaXNBcnJheShxdWVyeSkpIHJldHVybiByZW1hcEFycmF5VG9Mb3dlckNhc2VJZlN0cmluZyhxdWVyeSkuaW5jbHVkZXMoaXRlbVRvTWF0Y2gpID8gdHJ1ZSA6IGZhbHNlXG4gICAgcmV0dXJuIGNoZWNrT2JqTWF0Y2goaXRlbSwgcXVlcnksICFpZ25vcmVFbXB0eUFycmF5KSA/IHRydWUgOiBmYWxzZVxuICB9KVxufVxuXG5leHBvcnQgY29uc3QgcmVtb3ZlQWxsID0gKGFycjogYW55W10sIHF1ZXJ5OiBhbnksIGlnbm9yZUVtcHR5QXJyYXk6IGJvb2xlYW4gPSB0cnVlKTogYW55W10gPT4ge1xuICBpZiAoIXF1ZXJ5KSByZXR1cm4gYXJyXG4gIHJldHVybiBhcnIuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgY29uc3QgaXRlbVRvTWF0Y2ggPSB0eXBlb2YoaXRlbSkgPT09ICdzdHJpbmcnID8gaXRlbS50b0xvd2VyQ2FzZSgpIDogaXRlbVxuICAgIGlmKHR5cGVvZihxdWVyeSkgPT09ICdzdHJpbmcnKSByZXR1cm4gIWNoZWNrSXNFcXVhbChpdGVtLCBxdWVyeSlcbiAgICBpZihBcnJheS5pc0FycmF5KHF1ZXJ5KSkgcmV0dXJuIHJlbWFwQXJyYXlUb0xvd2VyQ2FzZUlmU3RyaW5nKHF1ZXJ5KS5pbmNsdWRlcyhpdGVtVG9NYXRjaCkgPyBmYWxzZSA6IHRydWVcbiAgICByZXR1cm4gY2hlY2tPYmpNYXRjaChpdGVtLCBxdWVyeSwgaWdub3JlRW1wdHlBcnJheSkgPyBmYWxzZSA6IHRydWVcbiAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHJlbW92ZSA9IChhcnI6IGFueVtdLCBxdWVyeTogYW55ID0gbnVsbCk6IGFueSA9PiB7XG4gIGlmICghcXVlcnkpIHJldHVybiBhcnJcbiAgY29uc3QgaW5kZXggPSBmaW5kSW5kZXgoYXJyLCBxdWVyeSlcbiAgaWYoaW5kZXggPiAtMSkgYXJyLnNwbGljZShpbmRleCwgMSlcbiAgcmV0dXJuIGFyclxufVxuXG5leHBvcnQgY29uc3QgdW5pcXVlQnlLZXkgPSAoYXJyOiBhbnlbXSwgcXVlcnk6IGFueSA9IG51bGwpOiBhbnlbXSA9PiB7XG4gIGNvbnN0IHVuaXF1ZUl0ZW1zID0gW11cbiAgZm9yKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XG4gICAgbGV0IHNlYXJjaFxuICAgIGlmKCFxdWVyeSkge1xuICAgICAgc2VhcmNoID0gaXRlbVxuICAgIH0gZWxzZSBpZih0eXBlb2YocXVlcnkpID09PSAnc3RyaW5nJykge1xuICAgICAgc2VhcmNoID0geyBbcXVlcnldOiBpdGVtW3F1ZXJ5XSB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlYXJjaCA9IHF1ZXJ5XG4gICAgfVxuICAgIGNvbnN0IGZpbmRlZCA9IGZpbmQodW5pcXVlSXRlbXMsIHNlYXJjaClcbiAgICBpZighZmluZGVkKSB1bmlxdWVJdGVtcy5wdXNoKGl0ZW0pXG4gIH1cbiAgcmV0dXJuIHVuaXF1ZUl0ZW1zXG59XG5cbmV4cG9ydCBjb25zdCBvYmpBcnJheVRvQ3N2ID0gKGFycjogYW55W10sIGRlbGltaXRlcjogc3RyaW5nID0gJywnKTogc3RyaW5nID0+IHtcbiAgaWYoIUFycmF5LmlzQXJyYXkoYXJyKSB8fCB0eXBlb2YoYXJyWzBdKSAhPSAnb2JqZWN0JykgdGhyb3cgbmV3IEVycm9yKGBGaXJzdCBwYXJhbWV0ZXIgbXVzdCBiZSBhbiBhcnJheSBvZiBvYmplY3RzYClcbiAgY29uc3QgaGVhZGVyID0gT2JqZWN0LmtleXMoYXJyWzBdKVxuXHRyZXR1cm4gW2hlYWRlci5qb2luKGRlbGltaXRlcikgLCBhcnIubWFwKHJvdyA9PiBoZWFkZXIubWFwKGtleSA9PiByb3dba2V5XSkuam9pbihkZWxpbWl0ZXIpKS5qb2luKFwiXFxuXCIpXS5qb2luKFwiXFxuXCIpXG59XG5cbmV4cG9ydCBjb25zdCB0b2dnbGVJbkFycmF5ID0gKGFycjogYW55W10sIG9iajogYW55KTogYW55W10gPT4ge1xuICBjb25zdCBmaW5kZWQgPSBmaW5kSW5kZXgoYXJyLCBvYmopXG4gIGlmKGZpbmRlZCA+IC0xKSB7XG4gICAgYXJyLnNwbGljZShmaW5kZWQsIDEpXG4gIH0gZWxzZSB7XG4gICAgYXJyLnB1c2gob2JqKVxuICB9XG4gIHJldHVybiBhcnJcbn1cblxuZXhwb3J0IGNvbnN0IGNvbXBhcmVBcnJheSA9IChhcnJGcm9tOiBhbnlbXSwgYXJyVG9Db21wYXJlOiBhbnlbXSwga2V5OiBzdHJpbmcgPSBudWxsKTogYm9vbGVhbiA9PiB7XG4gIGlmKGFyckZyb20ubGVuZ3RoICE9PSBhcnJUb0NvbXBhcmUubGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgZm9yKGNvbnN0IGl0ZW0gb2YgYXJyRnJvbSkge1xuICAgIGxldCBzZWFyY2hcbiAgICBpZih0eXBlb2YoaXRlbSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBzZWFyY2ggPSBpdGVtXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKHR5cGVvZihrZXkpICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdUaGlyZCBwYXJhbWV0ZXIgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICBzZWFyY2ggPXsgW2tleV06IGl0ZW1ba2V5XSB9XG4gICAgfVxuICAgIGNvbnN0IGZpbmRlZCA9IGZpbmQoYXJyVG9Db21wYXJlLCBzZWFyY2gpXG4gICAgaWYoIWZpbmRlZCkgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcmV0dXJuIHRydWVcbn1cblxuZXhwb3J0IGNvbnN0IHNodWZmbGUgPSAoYXJyYXk6IGFueVtdKSA9PiB7XG4gIGZvciAobGV0IGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgY29uc3QgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpIGFzIG51bWJlclxuICAgIFthcnJheVtpXSwgYXJyYXlbal1dID0gW2FycmF5W2pdLCBhcnJheVtpXV1cbiAgfVxuICByZXR1cm4gYXJyYXlcbn1cblxuZXhwb3J0IGNvbnN0IGdldFJhbmRvbUVsZW1lbnQgPSAobGlzdDogYW55W10pOiBhbnkgPT4gbGlzdFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsaXN0Lmxlbmd0aCldXG5cbmV4cG9ydCBjb25zdCBBcnJheUhlbHBlcnMgPSB7XG4gIGZpbmRCeU9iaixcbiAgZmluZEJ5U3RyaW5nLFxuICBmaW5kLFxuICBmaW5kSW5kZXgsXG4gIGZpbmRBbGwsXG4gIHJlbW92ZUFsbCxcbiAgcmVtb3ZlLFxuICB1bmlxdWVCeUtleSxcbiAgb2JqQXJyYXlUb0NzdixcbiAgdG9nZ2xlSW5BcnJheSxcbiAgY29tcGFyZUFycmF5LFxuICBzaHVmZmxlLFxuICBnZXRSYW5kb21FbGVtZW50XG59XG5cbiIsIlxuLyoqXG4gKiBcbiAqIGdldCBhbW91bnQgb2YgYSBnaXZlbiAlIG9mIGEgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFtb3VudE9mUGVyY2VudGFnZSA9IChhbW91bnQ6IG51bWJlciwgcGVyY2VudGFnZTogbnVtYmVyIHwgc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHBjdCA9IGdldFBhcnNlZFZhbHVlKHBlcmNlbnRhZ2UpXG4gIGNvbnN0IGFtdCA9IGdldFBhcnNlZFZhbHVlKGFtb3VudClcbiAgcmV0dXJuIE51bWJlcihhbXQgLyAxMDAgKiBwY3QpXG59XG5cbi8qKlxuICogXG4gKiBnZXQgdGhlICUgb2YgYSBnaXZlbiBhbW91bnQgYW5kIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQZXJjZW50YWdlT2ZBbW91bnQgPSAoYW1vdW50OiBudW1iZXIsIHZhbHVlOiBudW1iZXIsIHBlcmNlbnRhZ2VTaWduOiBib29sZWFuID0gZmFsc2UsIGRpZ2l0czpudW1iZXIgPSAyKTogbnVtYmVyIHwgc3RyaW5nID0+IHtcbiAgY29uc3QgYW10ID0gZ2V0UGFyc2VkVmFsdWUoYW1vdW50KVxuICBjb25zdCByZXN1bHQgPSBOdW1iZXIoMTAwIC8gYW10ICogdmFsdWUpXG4gIGlmKCFwZXJjZW50YWdlU2lnbikgcmV0dXJuIHJlc3VsdFxuICBpZihpc05hTihOdW1iZXIoIHJlc3VsdCAvIDEwMCApKSkgcmV0dXJuIE51bWJlcihyZXN1bHQvMTAwKVxuICByZXR1cm4gTnVtYmVyKCByZXN1bHQgLyAxMDAgKS50b0xvY2FsZVN0cmluZyh1bmRlZmluZWQsIHsgc3R5bGU6ICdwZXJjZW50JywgbWluaW11bUZyYWN0aW9uRGlnaXRzOiBkaWdpdHMgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHJvdW5kID0gKHZhbHVlOiBudW1iZXIsIGRlY2ltYWxzOiBudW1iZXIgPSAyKSA9PiB7XG4gIGNvbnN0IHZsID0gZ2V0UGFyc2VkVmFsdWUodmFsdWUpXG4gIHZhciBwID0gTWF0aC5wb3coMTAsIGRlY2ltYWxzKVxuICByZXR1cm4gTWF0aC5yb3VuZCh2bCAqIHApIC8gcFxufVxuXG5leHBvcnQgY29uc3QgcmFuZG9tSW50ID0gKG1heDogbnVtYmVyLCBtaW46IG51bWJlciA9IDApID0+IHtcbiAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoKG1heCAtIG1pbikgKiBNYXRoLnJhbmRvbSgpKTtcbn1cblxuLyoqXG4gKiBhZGQgYSByYXcgcGVyY2VudGFnZSB2YWx1ZSB0byBhIG51bWJlclxuICovXG5leHBvcnQgY29uc3QgYWRkUGVyY2VudGFnZSA9ICh2YWx1ZTogbnVtYmVyLCBwZXJjZW50YWdlOiBzdHJpbmcgfCBudW1iZXIpID0+IHtcbiAgY29uc3QgcGN0ID0gZ2V0UGFyc2VkVmFsdWUocGVyY2VudGFnZSlcbiAgY29uc3QgdmwgPSBnZXRQYXJzZWRWYWx1ZSh2YWx1ZSlcbiAgcmV0dXJuIHZsICogKDEgKyAocGN0IC8gMTAwKSlcbn1cblxuLyoqXG4gKiBcbiAqIHJldHVybnMgYSBtaW4gdmFsdWUgdXNpbmcgYSBwZXJjZW50YWdlIGFzIHJlZmVyZW5jZXNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFZhbHVlT3JNaW5QZXJjZW50YWdlID0gKGFtb3VudDogbnVtYmVyLCB2YWx1ZTogbnVtYmVyLCBwZXJjZW50YWdlOiBudW1iZXIgPSAxMCkgPT4ge1xuICBjb25zdCBhbXQgPSBnZXRQYXJzZWRWYWx1ZShhbW91bnQpXG4gIGNvbnN0IHZsID0gZ2V0UGFyc2VkVmFsdWUodmFsdWUpXG4gIGNvbnN0IHBjdCA9IGdldFBhcnNlZFZhbHVlKHBlcmNlbnRhZ2UpXG4gIGlmKChhbXQgLyAxMDAgKiBwY3QpID4gdmwpIHJldHVybiBnZXRBbW91bnRPZlBlcmNlbnRhZ2UoYW10LCBwY3QpXG4gIHJldHVybiB2bFxufVxuXG5jb25zdCBnZXRQYXJzZWRWYWx1ZSA9ICh2YWx1ZTogbnVtYmVyIHwgc3RyaW5nKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIHR5cGVvZih2YWx1ZSkgPT09ICdudW1iZXInID8gdmFsdWUgOiBwYXJzZUZsb2F0KHZhbHVlKVxufVxuXG5leHBvcnQgY29uc3QgTWF0aEhlbHBlcnMgPSB7XG4gIGdldEFtb3VudE9mUGVyY2VudGFnZSxcbiAgZ2V0UGVyY2VudGFnZU9mQW1vdW50LFxuICByb3VuZCxcbiAgcmFuZG9tSW50LFxuICBhZGRQZXJjZW50YWdlLFxuICBnZXRWYWx1ZU9yTWluUGVyY2VudGFnZVxufSIsIlxuZXhwb3J0IGNvbnN0IGRvd25sb2FkUmF3RGF0YSA9IChkYXRhOiBzdHJpbmcsIGZpbGVOYW1lOnN0cmluZyA9ICdmaWxlLnR4dCcpOiB2b2lkID0+IHtcbiAgaWYoIXdpbmRvdykgdGhyb3cgbmV3IEVycm9yKGBNZXRob2QgZG93bmxvYWRSYXdEYXRhIG11c3QgcnVuIGluIFwid2luZG93XCIgY29udGV4dC5gKVxuICBjb25zdCBibG9iID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW2RhdGFdKSlcblx0Y29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuXHRsaW5rLnNldEF0dHJpYnV0ZSgnaHJlZicsIGJsb2IpXG5cdGxpbmsuc2V0QXR0cmlidXRlKCdkb3dubG9hZCcsIGZpbGVOYW1lKVxuXHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspXG5cdGxpbmsuY2xpY2soKVxuXHRkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspXG59XG5cbmV4cG9ydCBjb25zdCBjb3B5VG9DbGlwYm9hcmQgPSAoc3RyaW5nOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgaWYobmF2aWdhdG9yLmNsaXBib2FyZCkge1xuICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHN0cmluZylcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBkdW1teSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKVxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZHVtbXkpXG4gICAgZHVtbXkudmFsdWUgPSBzdHJpbmdcbiAgICBkdW1teS5zZWxlY3QoKVxuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiY29weVwiKVxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZHVtbXkpXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGdldExldHRlckJ5TnVtYmVyID0gKG51bWJlcjogbnVtYmVyKTogc3RyaW5nID0+IHtcbiAgY29uc3Qgc3RyaW5nID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6J1xuICBpZihzdHJpbmcubGVuZ3RoLTEgPCBudW1iZXIpIHJldHVybiAnLS0nXG4gIHJldHVybiBzdHJpbmdbbnVtYmVyXVxufVxuXG5leHBvcnQgY29uc3QgcmVtb3ZlQWxsQ29va2llcyA9ICgpOiB2b2lkID0+IHtcbiAgaWYoZG9jdW1lbnQpIHtcbiAgICBjb25zdCBjb29raWVzID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjb29raWUgPSBjb29raWVzW2ldO1xuICAgICAgY29uc3QgZXFQb3MgPSBjb29raWUuaW5kZXhPZignPScpO1xuICAgICAgY29uc3QgbmFtZSA9IGVxUG9zID4gLTEgPyBjb29raWUuc3Vic3RyKDAsIGVxUG9zKSA6IGNvb2tpZTtcbiAgICAgIGNvbnN0IHBhdGggPSAnLyc7XG4gICAgICBkb2N1bWVudC5jb29raWUgPSBuYW1lICsgJz07ZXhwaXJlcz1UaHUsIDAxIEphbiAxOTcwIDAwOjAwOjAwIEdNVDtwYXRoPScgKyBwYXRoO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgY2xlYXJCcm93c2VyQ2FjaGUgPSAocmVtb3ZlQ29va2llczogYm9vbGVhbiA9IHRydWUpID0+IHtcbiAgbG9jYWxTdG9yYWdlLmNsZWFyKClcbiAgc2Vzc2lvblN0b3JhZ2UuY2xlYXIoKVxuICBpZihyZW1vdmVDb29raWVzKSB7XG4gICAgcmVtb3ZlQWxsQ29va2llcygpXG4gIH1cbn1cblxuXG5leHBvcnQgY29uc3QgY2xlYXJCcm93c2VyQ2FjaGVMaXN0ZW5lciA9IChob3RLZXk6IHN0cmluZyA9ICdLZXlYJywgcmVtb3ZlQ29va2llczogYm9vbGVhbiA9IHRydWUsIGNiOiBGdW5jdGlvbiB8IG51bGwgPSBudWxsKTogdm9pZCA9PiB7XG4gIGlmKGRvY3VtZW50KSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC5hbHRLZXkgJiYgZXZlbnQuY29kZSA9PT0gaG90S2V5KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgY2xlYXJCcm93c2VyQ2FjaGUocmVtb3ZlQ29va2llcylcbiAgICAgICAgaWYoY2IpIHtcbiAgICAgICAgICBjYigpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBDb21tb25IZWxwZXJzID0ge1xuICBkb3dubG9hZFJhd0RhdGEsXG4gIGNvcHlUb0NsaXBib2FyZCxcbiAgZ2V0TGV0dGVyQnlOdW1iZXIsXG4gIGNsZWFyQnJvd3NlckNhY2hlLFxuICBjbGVhckJyb3dzZXJDYWNoZUxpc3RlbmVyLFxuICByZW1vdmVBbGxDb29raWVzXG59IiwiXG5cbmV4cG9ydCB0eXBlIFR5cGVOdW1iZXJGb3JtYXRPcHRpb25zID0ge1xuICBwcmVmaXg6IHN0cmluZ1xuICBzdWZmaXg6IHN0cmluZ1xuICBkZWNpbWFsOiBzdHJpbmdcbiAgdGhvdXNhbmQ6IHN0cmluZ1xuICBwcmVjaXNpb246IG51bWJlclxuICBhY2NlcHROZWdhdGl2ZTogYm9vbGVhblxuICBpc0ludGVnZXI6IGJvb2xlYW5cbiAgdnVlVmVyc2lvbj86IHN0cmluZ1xufVxuXG5jb25zdCBkZWZhdWx0T3B0aW9uczogVHlwZU51bWJlckZvcm1hdE9wdGlvbnMgPSB7XG4gIHByZWZpeDogJ1VTJCAnLFxuICBzdWZmaXg6ICcnLFxuICBkZWNpbWFsOiAnLicsXG4gIHRob3VzYW5kOiAnLCcsXG4gIHByZWNpc2lvbjogMixcbiAgYWNjZXB0TmVnYXRpdmU6IHRydWUsXG4gIGlzSW50ZWdlcjogZmFsc2Vcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmYXVsdE9wdGlvbnMiLCIvKlxuICogaWdvcnRyaW5pZGFkL3Z1ZS1udW1iZXItZm9ybWF0XG4gKlxuICogKGMpIElnb3IgVHJpbmRhZGUgPGlnb3J0cmluZGFkZS5tZUBnbWFpbC5jb20+XG4gKiBcbiAqIE1vc3RseSBvZiB0aGlzIGZpbGUgY29udGVudCB3YXMgZXh0cmFjdGVkIGZyb20gdGhlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYWljbzkxMC92dWUtbnVtYmVyLWZvcm1hdC9ibG9iL3ZpdGUtdHlwZXNjcmlwdC1yZWZhY3Rvci9zcmMvdXRpbHMudHNcbiAqXG4gKiBGb3IgdGhlIGZ1bGwgY29weXJpZ2h0IGFuZCBsaWNlbnNlIGluZm9ybWF0aW9uLCBwbGVhc2UgdmlldyB0aGUgTElDRU5TRVxuICogZmlsZSB0aGF0IHdhcyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgc291cmNlIGNvZGUuXG4gKi9cblxuaW1wb3J0IGRlZmF1bHRPcHRpb25zLCB7IHR5cGUgVHlwZU51bWJlckZvcm1hdE9wdGlvbnMgfSBmcm9tICcuL3R5cGVzL051bWJlckZvcm1hdE9wdGlvbnMnXG5cbmV4cG9ydCBjb25zdCBmb3JtYXROdW1iZXIgPSAoaW5wdXQ6IHN0cmluZyB8IG51bWJlciB8IG51bGwgPSAnMCcsIG9wdDogUGFydGlhbDxUeXBlTnVtYmVyRm9ybWF0T3B0aW9ucz4gPSB7fSkgPT4ge1xuICBjb25zdCBtZXJnZWRPcHRpb25zID0gey4uLmRlZmF1bHRPcHRpb25zLCAuLi5vcHR9O1xuXG4gIGxldCBpbnB1dEluU3RyaW5nO1xuXG4gIGlmICghIWlucHV0KSB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ251bWJlcicgJiYgIW1lcmdlZE9wdGlvbnMuaXNJbnRlZ2VyKSB7XG4gICAgICBpbnB1dEluU3RyaW5nID0gaW5wdXQudG9GaXhlZChmaXhlZChtZXJnZWRPcHRpb25zLnByZWNpc2lvbikpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlucHV0SW5TdHJpbmcgPSBpbnB1dC50b1N0cmluZygpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlucHV0SW5TdHJpbmcgPSAnJ1xuICB9XG5cblxuICBjb25zdCBtaW51c1N5bWJvbCA9IGlzTmVnYXRpdmUoaW5wdXRJblN0cmluZywgbWVyZ2VkT3B0aW9ucy5hY2NlcHROZWdhdGl2ZSkgID8gJy0nIDogJydcbiAgY29uc3QgbnVtYmVycyA9IGlucHV0T25seU51bWJlcnMoaW5wdXRJblN0cmluZy50b1N0cmluZygpKVxuICBjb25zdCBjdXJyZW5jeUluU3RyaW5nID0gbnVtYmVyc1RvQ3VycmVuY3kobnVtYmVycywgbWVyZ2VkT3B0aW9ucy5wcmVjaXNpb24pXG5cbiAgY29uc3QgY3VycmVuY3lQYXJ0cyA9IGN1cnJlbmN5SW5TdHJpbmcuc3BsaXQoJy4nKVxuICBjb25zdCBkZWNpbWFsID0gY3VycmVuY3lQYXJ0c1sxXVxuICBjb25zdCBpbnRlZ2VyID0gYWRkVGhvdXNhbmRTZXBhcmF0b3IoY3VycmVuY3lQYXJ0c1swXSwgbWVyZ2VkT3B0aW9ucy50aG91c2FuZClcblxuICByZXR1cm4gbWludXNTeW1ib2wgKyBtZXJnZWRPcHRpb25zLnByZWZpeCArIGpvaW5JbnRlZ2VyQW5kRGVjaW1hbChpbnRlZ2VyLCBkZWNpbWFsLCBtZXJnZWRPcHRpb25zLmRlY2ltYWwpICsgbWVyZ2VkT3B0aW9ucy5zdWZmaXhcbn1cblxuZXhwb3J0IGNvbnN0IHVuZm9ybWF0TnVtYmVyID0gKGlucHV0OiBzdHJpbmcgfCBudW1iZXIgfCBudWxsID0gMCwgb3B0OiBQYXJ0aWFsPFR5cGVOdW1iZXJGb3JtYXRPcHRpb25zPiA9IHt9KSA9PiB7XG4gIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0KTtcblxuICBjb25zdCB1c2VySW5wdXQgPSBpbnB1dCB8fCAwO1xuXG4gIGNvbnN0IG51bWJlcnMgPSBpbnB1dE9ubHlOdW1iZXJzKHVzZXJJbnB1dClcblxuICBpZihtZXJnZWRPcHRpb25zLmlzSW50ZWdlcikge1xuICAgIHJldHVybiBwYXJzZUludChgJHtpc05lZ2F0aXZlKHVzZXJJbnB1dCwgbWVyZ2VkT3B0aW9ucy5hY2NlcHROZWdhdGl2ZSkgPyAnLScgOiAnJ30ke251bWJlcnMudG9TdHJpbmcoKX1gKVxuICB9XG5cbiAgY29uc3QgbWFrZU51bWJlck5lZ2F0aXZlID0gKGlzTmVnYXRpdmUodXNlcklucHV0LCBtZXJnZWRPcHRpb25zLmFjY2VwdE5lZ2F0aXZlKSlcbiAgY29uc3QgY3VycmVuY3kgPSBudW1iZXJzVG9DdXJyZW5jeShudW1iZXJzLCBtZXJnZWRPcHRpb25zLnByZWNpc2lvbilcbiAgcmV0dXJuIG1ha2VOdW1iZXJOZWdhdGl2ZSA/IHBhcnNlRmxvYXQoY3VycmVuY3kpICogLSAxIDogcGFyc2VGbG9hdChjdXJyZW5jeSlcbn1cblxuZnVuY3Rpb24gaW5wdXRPbmx5TnVtYmVycyAoaW5wdXQ6IHN0cmluZyB8IG51bWJlciA9IDApIHtcbiAgcmV0dXJuIGlucHV0ID8gaW5wdXQudG9TdHJpbmcoKS5yZXBsYWNlKC9cXEQrL2csICcnKSA6ICcwJ1xufVxuXG4vLyAxMjMgUmFuZ2VFcnJvcjogdG9GaXhlZCgpIGRpZ2l0cyBhcmd1bWVudCBtdXN0IGJlIGJldHdlZW4gMCBhbmQgMjAgYXQgTnVtYmVyLnRvRml4ZWRcbmZ1bmN0aW9uIGZpeGVkKHByZWNpc2lvbjogbnVtYmVyKSB7XG4gIHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1pbihwcmVjaXNpb24sIDIwKSlcbn1cblxuZnVuY3Rpb24gbnVtYmVyc1RvQ3VycmVuY3kgKG51bWJlcnM6IHN0cmluZywgcHJlY2lzaW9uOiBudW1iZXIpIHtcbiAgY29uc3QgZXhwID0gTWF0aC5wb3coMTAsIHByZWNpc2lvbilcbiAgY29uc3QgZmxvYXQgPSBwYXJzZUZsb2F0KG51bWJlcnMpIC8gZXhwXG4gIHJldHVybiBmbG9hdC50b0ZpeGVkKGZpeGVkKHByZWNpc2lvbikpXG59XG5cbmZ1bmN0aW9uIGFkZFRob3VzYW5kU2VwYXJhdG9yIChpbnRlZ2VyOiBzdHJpbmcsIHNlcGFyYXRvcjogc3RyaW5nKSB7XG4gIHJldHVybiBpbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KD86XFxkezN9KStcXGIpL2dtLCBgJDEke3NlcGFyYXRvcn1gKVxufVxuXG5mdW5jdGlvbiBqb2luSW50ZWdlckFuZERlY2ltYWwgKGludGVnZXI6IHN0cmluZywgZGVjaW1hbDogc3RyaW5nLCBzZXBhcmF0b3I6IHN0cmluZykge1xuICBpZiAoZGVjaW1hbCkge1xuICAgIHJldHVybiBpbnRlZ2VyICsgc2VwYXJhdG9yICsgZGVjaW1hbDtcbiAgfVxuXG4gIHJldHVybiBpbnRlZ2VyO1xufVxuXG5mdW5jdGlvbiBpc05lZ2F0aXZlKHN0cmluZzogbnVtYmVyIHwgc3RyaW5nLCBhY2NlcHROZWdhdGl2ZSA9IHRydWUpIHtcbiAgaWYoIWFjY2VwdE5lZ2F0aXZlKSByZXR1cm4gZmFsc2VcblxuICBjb25zdCB2YWx1ZSA9IHN0cmluZy50b1N0cmluZygpO1xuICBjb25zdCBpc05lZ2F0aXZlID0gKHZhbHVlLnN0YXJ0c1dpdGgoJy0nKSB8fCB2YWx1ZS5lbmRzV2l0aCgnLScpKVxuICBjb25zdCBmb3JjZVBvc2l0aXZlID0gdmFsdWUuaW5kZXhPZignKycpID4gMFxuXG4gIHJldHVybiBpc05lZ2F0aXZlICYmICFmb3JjZVBvc2l0aXZlXG59XG5cbmV4cG9ydCBjb25zdCBOdW1iZXJGb3JtYXQgPSB7XG4gIGZvcm1hdE51bWJlcixcbiAgdW5mb3JtYXROdW1iZXIsXG59IiwiXG5pbnRlcmZhY2UgVXJsSW1hZ2Uge1xuICB1cmw6IHN0cmluZ1xuICB0aXRsZTogc3RyaW5nXG4gIGNhcHRpb246IHN0cmluZ1xufVxuXG50eXBlIENoYW5nZUZyZXFzID0gJ2Fsd2F5cycgfCAnaG91cmx5JyB8ICdkYWlseScgfCAnd2Vla2x5JyB8ICdtb250aGx5JyB8ICdhbnVhbCcgfCAnbmV2ZXInXG5cbmludGVyZmFjZSBVcmxJdGVtSW50ZXJmYWNlIHtcbiAgdXJsOiBzdHJpbmdcbiAgbGFzdE1vZGlmaWVkPzogc3RyaW5nXG4gIGNoYW5nZUZyZXE/OiBDaGFuZ2VGcmVxc1xuICBwcmlvcml0eT86IHN0cmluZ1xuICBpbWFnZT86IFVybEltYWdlXG59XG5cbmV4cG9ydCBjbGFzcyBVcmxJdGVtIHtcblxuICB1cmw6IHN0cmluZ1xuICBsYXN0TW9kaWZpZWQ6IHN0cmluZyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwxMClcbiAgY2hhbmdlRnJlcTogQ2hhbmdlRnJlcXMgPSAnbW9udGhseSdcbiAgcHJpb3JpdHk6IHN0cmluZyA9ICcxLjAnXG4gIGltYWdlPzogVXJsSW1hZ2UgPSBudWxsXG5cbiAgY29uc3RydWN0b3IodXJsSXRlbTogVXJsSXRlbUludGVyZmFjZSl7XG4gICAgaWYoIXVybEl0ZW0udXJsKSB0aHJvdyBuZXcgRXJyb3IoJ1VybCBpcyByZXF1aXJlZCcpXG4gICAgdGhpcy51cmwgPSB0aGlzLnJlbW92ZUZpcnN0U2xhc2hGcm9tVXJsKHVybEl0ZW0udXJsKVxuICAgIGlmKHVybEl0ZW0ubGFzdE1vZGlmaWVkICkgdGhpcy5sYXN0TW9kaWZpZWQgPSB1cmxJdGVtLmxhc3RNb2RpZmllZFxuICAgIGlmKHVybEl0ZW0uY2hhbmdlRnJlcSApIHRoaXMuY2hhbmdlRnJlcSA9IHVybEl0ZW0uY2hhbmdlRnJlcVxuICAgIGlmKHVybEl0ZW0ucHJpb3JpdHkgKSB0aGlzLnByaW9yaXR5ID0gdXJsSXRlbS5wcmlvcml0eVxuICAgIGlmKHVybEl0ZW0uaW1hZ2UgKSB0aGlzLmltYWdlID0gdXJsSXRlbS5pbWFnZVxuICB9XG5cbiAgcmVtb3ZlRmlyc3RTbGFzaEZyb21VcmwodXJsOiBzdHJpbmcpIHtcbiAgICBpZih1cmxbMF0gPT0gJy8nKSByZXR1cm4gdXJsLnN1YnN0cmluZygxKVxuICAgIHJldHVybiB1cmxcbiAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBTaXRlTWFwR2VuZXJhdG9yIHtcblxuICBiYXNlVXJsOiBzdHJpbmcgPSAnJ1xuICBpdGVtczogVXJsSXRlbVtdID0gW11cbiAgeG1sU3R5bGVzaGVldFBhdGg6IHN0cmluZyA9ICcnXG5cbiAgY29uc3RydWN0b3IoYmFzZVVybDogc3RyaW5nKSB7XG4gICAgdGhpcy5iYXNlVXJsID0gYmFzZVVybFxuICAgIHRoaXMuaXRlbXMgPSBbXVxuICB9XG5cbiAgcHJpdmF0ZSBnZXQgZ2V0SGVhZGVyICgpIHtcbmNvbnN0IGhlYWRlciA9IFxuYFxuJHsgdGhpcy54bWxTdHlsZXNoZWV0UGF0aCA/IGA8P3htbC1zdHlsZXNoZWV0IGhyZWY9XCIkeyB0aGlzLnhtbFN0eWxlc2hlZXRQYXRoIH1cIiB0eXBlPVwidGV4dC94c2xcIj8+YCA6ICcnIH1cbjx1cmxzZXQgeG1sbnM9XCJodHRwOi8vd3d3LnNpdGVtYXBzLm9yZy9zY2hlbWFzL3NpdGVtYXAvMC45XCIgeG1sbnM6eGh0bWw9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIgeG1sbnM6aW1hZ2U9XCJodHRwOi8vd3d3Lmdvb2dsZS5jb20vc2NoZW1hcy9zaXRlbWFwLWltYWdlLzEuMVwiIHhtbG5zOnZpZGVvPVwiaHR0cDovL3d3dy5nb29nbGUuY29tL3NjaGVtYXMvc2l0ZW1hcC12aWRlby8xLjFcIj5cbmBcbnJldHVybiBoZWFkZXJcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGdldEJvZHkgKCkge1xuICAgIHJldHVybiB0aGlzLml0ZW1zLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgdmFyIGl0ZW1SZXN1bHQgPSAgXG5gXG4gIDx1cmw+XG4gICAgPGxvYz4keyB0aGlzLmJhc2VVcmwgfSR7ICghaXRlbS51cmwpID8gJycgOiBgLyR7IGl0ZW0udXJsIH1gIH08L2xvYz5cbiAgICA8cHJpb3JpdHk+JHtpdGVtLnByaW9yaXR5fTwvcHJpb3JpdHk+XG4gICAgPGxhc3Rtb2Q+JHtpdGVtLmxhc3RNb2RpZmllZH08L2xhc3Rtb2Q+XG4gICAgPGNoYW5nZWZyZXE+JHtpdGVtLmNoYW5nZUZyZXF9PC9jaGFuZ2VmcmVxPmBcblxuICAgIGlmKGl0ZW0uaW1hZ2UpIHtcbiAgICAgIFxuICAgICAgaXRlbVJlc3VsdCArPSBcbmBcbiAgICAgIDxpbWFnZTppbWFnZT5cbiAgICAgICAgPGltYWdlOmxvYz4ke2l0ZW0uaW1hZ2UudXJsfTwvaW1hZ2U6bG9jPlxuICAgICAgICA8aW1hZ2U6Y2FwdGlvbj4ke2l0ZW0uaW1hZ2UuY2FwdGlvbn08L2ltYWdlOmNhcHRpb24+XG4gICAgICAgIDxpbWFnZTp0aXRsZT4ke2l0ZW0uaW1hZ2UudGl0bGV9PC9pbWFnZTp0aXRsZT5cbiAgICAgIDwvaW1hZ2U6aW1hZ2U+YFxuICAgIH1cbiAgICBpdGVtUmVzdWx0ICs9IFxuYFxuICA8L3VybD5cbmBcbnJldHVybiBpdGVtUmVzdWx0XG4gICAgXG4gIH0pXG4gIC5qb2luKCcnKVxuXG4gIH1cblxuICBwcml2YXRlIGdldCBnZXRGb290ZXIgKCkge1xuICAgIHJldHVybiBgPC91cmxzZXQ+YFxuICB9XG5cbiAgcHVibGljIHNldFhtbFN0eWxlU2hlZXRQYXRoKHBhdGg6IHN0cmluZykge1xuICAgIHRoaXMueG1sU3R5bGVzaGVldFBhdGggPSBwYXRoXG4gIH1cblxuICBwdWJsaWMgYWRkSXRlbSh1cmxJdGVtOiBVcmxJdGVtSW50ZXJmYWNlKTogdm9pZCB7XG4gICAgdGhpcy5pdGVtcy5wdXNoKG5ldyBVcmxJdGVtKHVybEl0ZW0pKVxuICB9XG5cbiAgcHVibGljIGdlbmVyYXRlKCk6IHN0cmluZ3tcbiAgICBjb25zdCByZXN1bHQgPSBcbmBcbiR7IHRoaXMuZ2V0SGVhZGVyIH1cbiR7IHRoaXMuZ2V0Qm9keSB9XG4keyB0aGlzLmdldEZvb3RlciB9XG5gXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbn1cblxuIiwiZXhwb3J0IGNvbnN0IHRpdGxlQ2FzZVN0cmluZyA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIHJldHVybiBzdHIudG9TdHJpbmcoKS5zcGxpdCgnICcpLm1hcCgoc3RyKSA9PiBzdHIudG9VcHBlckNhc2UoKS5jaGFyQXQoMCkgKyBzdHIuc3Vic3RyaW5nKDEpLnRvTG93ZXJDYXNlKCkpLmpvaW4oJyAnKVxufVxuXG5leHBvcnQgY29uc3QgcmFuZG9tU3RyaW5nID0gKGxlbmd0aDogbnVtYmVyKTogc3RyaW5nID0+IHtcbiAgdmFyIHJlc3VsdCAgICAgICAgICAgPSAnJ1xuICB2YXIgY2hhcmFjdGVycyAgICAgICA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSdcbiAgdmFyIGNoYXJhY3RlcnNMZW5ndGggPSBjaGFyYWN0ZXJzLmxlbmd0aFxuICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAgcmVzdWx0ICs9IGNoYXJhY3RlcnMuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNoYXJhY3RlcnNMZW5ndGgpKVxuICB9XG4gIHJldHVybiByZXN1bHRcbn1cblxuZXhwb3J0IGNvbnN0IGpvaW5Db21tYVBsdXNBbmQgPSAoYTogQXJyYXk8YW55PiwgdW5pZmllclN0cmluZyA9ICcgYW5kICcpID0+IHtcbiAgcmV0dXJuIFthLnNsaWNlKDAsIC0xKS5qb2luKCcsICcpLCBhLnNsaWNlKC0xKVswXV0uam9pbihhLmxlbmd0aCA8IDIgPyAnJyA6IHVuaWZpZXJTdHJpbmcpXG59XG5cbmZ1bmN0aW9uIGxldmVuc2h0ZWluKGE6IHN0cmluZywgYjogc3RyaW5nKSB7XG4gIGNvbnN0IG1hdHJpeCA9IFtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gYi5sZW5ndGg7IGkrKykge1xuICAgICAgbWF0cml4W2ldID0gW2ldXG4gIH1cblxuICBmb3IgKGxldCBqID0gMDsgaiA8PSBhLmxlbmd0aDsgaisrKSB7XG4gICAgICBtYXRyaXhbMF1bal0gPSBqXG4gIH1cblxuICBmb3IgKGxldCBpID0gMTsgaSA8PSBiLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMTsgaiA8PSBhLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKGIuY2hhckF0KGkgLSAxKSA9PT0gYS5jaGFyQXQoaiAtIDEpKSB7XG4gICAgICAgICAgICAgIG1hdHJpeFtpXVtqXSA9IG1hdHJpeFtpIC0gMV1baiAtIDFdXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWF0cml4W2ldW2pdID0gTWF0aC5taW4oXG4gICAgICAgICAgICAgICAgICBtYXRyaXhbaSAtIDFdW2ogLSAxXSArIDEsXG4gICAgICAgICAgICAgICAgICBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICAgICAgICBtYXRyaXhbaV1baiAtIDFdICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICBtYXRyaXhbaSAtIDFdW2pdICsgMVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgfVxuICB9XG5cbiAgcmV0dXJuIG1hdHJpeFtiLmxlbmd0aF1bYS5sZW5ndGhdXG59XG5cbmV4cG9ydCBjb25zdCBjaGVja1N0cmluZ1NpbWlsYXJpdHkgPSAoYmFzZTogc3RyaW5nLCBzdHJpbmdUb0NvbXBhcmU6IHN0cmluZywgY2FzZUluc2Vuc2l0aXZlOiBib29sZWFuID0gdHJ1ZSk6IG51bWJlciA9PiB7XG4gIGlmKGNhc2VJbnNlbnNpdGl2ZSkge1xuICAgIGJhc2UgPSBiYXNlLnRvTG93ZXJDYXNlKClcbiAgICBzdHJpbmdUb0NvbXBhcmUgPSBzdHJpbmdUb0NvbXBhcmUudG9Mb3dlckNhc2UoKVxuICB9XG4gIGNvbnN0IGRpc3RhbmNlID0gbGV2ZW5zaHRlaW4oYmFzZSwgc3RyaW5nVG9Db21wYXJlKVxuICBjb25zdCBtYXhMZW4gPSBNYXRoLm1heChiYXNlLmxlbmd0aCwgc3RyaW5nVG9Db21wYXJlLmxlbmd0aClcbiAgY29uc3Qgc2ltaWxhcml0eSA9IDEgLSBkaXN0YW5jZSAvIG1heExlblxuICByZXR1cm4gc2ltaWxhcml0eVxufVxuXG5leHBvcnQgY29uc3QgY2hlY2tTdHJpbmdJc1NpbWlsYXIgPSAoYmFzZTogc3RyaW5nLCBzdHJpbmdUb0NvbXBhcmU6IHN0cmluZywgdGhyZXNob2xkOiBudW1iZXIgPSAwLjgsIGNhc2VJbnNlbnNpdGl2ZTogYm9vbGVhbiA9IHRydWUpOiBib29sZWFuID0+IHtcbiAgcmV0dXJuIGNoZWNrU3RyaW5nU2ltaWxhcml0eShiYXNlLCBzdHJpbmdUb0NvbXBhcmUsIGNhc2VJbnNlbnNpdGl2ZSkgPj0gdGhyZXNob2xkXG59XG5cbmV4cG9ydCBjb25zdCBlbnN1cmVTdGFydHNXaXRoVXBwZXJDYXNlID0gKHN0ciA9ICcnKSA9PiB7XG4gIGlmICghc3RyKSByZXR1cm4gJydcbiAgY29uc3QgdHJpbW1lZFN0YXJ0ID0gc3RyLnRyaW1TdGFydCgpXG4gIHJldHVybiBzdHIuc2xpY2UoMCwgc3RyLmxlbmd0aCAtIHRyaW1tZWRTdGFydC5sZW5ndGgpICsgdHJpbW1lZFN0YXJ0WzBdLnRvVXBwZXJDYXNlKCkgKyB0cmltbWVkU3RhcnQuc2xpY2UoMSlcbn1cblxuZXhwb3J0IGNvbnN0IHRydW5jYXRlVGV4dCA9ICh0ZXh0OiBzdHJpbmcgPSAnJywgbWF4OiBudW1iZXIgPSA0MCkgPT4ge1xuICB0cnkge1xuICAgIGlmKCF0ZXh0KSByZXR1cm4gJydcbiAgICBpZihtYXggPD0gMCkgcmV0dXJuIHRleHQgKyAnLi4uJ1xuICAgIHJldHVybiB0ZXh0Lmxlbmd0aCA+IG1heCA/IGAke3RleHQuc3Vic3RyaW5nKDAsIG1heCl9Li4uYCA6IHRleHRcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gdGV4dCB8fCAnJ1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBTdHJpbmdIZWxwZXJzID0ge1xuICB0aXRsZUNhc2VTdHJpbmcsXG4gIHJhbmRvbVN0cmluZyxcbiAgam9pbkNvbW1hUGx1c0FuZCxcbiAgY2hlY2tTdHJpbmdTaW1pbGFyaXR5LFxuICBjaGVja1N0cmluZ0lzU2ltaWxhcixcbiAgZW5zdXJlU3RhcnRzV2l0aFVwcGVyQ2FzZSxcbiAgdHJ1bmNhdGVUZXh0LFxufSIsIlxuZXhwb3J0IGNvbnN0IGV4dHJhY3RNYXRjaHMgPSAodGV4dDogc3RyaW5nLCByZWdleDogUmVnRXhwKTogQXJyYXk8c3RyaW5nPiA9PiB7XG4gIGNvbnN0IG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKHJlZ2V4KSB8fCBbXVxuICByZXR1cm4gWy4uLm5ldyBTZXQobWF0Y2hlcyldXG59XG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VXVpZHNWNCA9ICh0ZXh0OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+ID0+IHtcbiAgY29uc3QgcmVnZXggPSAvW2EtZkEtRjAtOV17OH0tW2EtZkEtRjAtOV17NH0tNFthLWZBLUYwLTldezN9LVthLWZBLUYwLTldezR9LVthLWZBLUYwLTldezEyfS9nXG4gIHJldHVybiBleHRyYWN0TWF0Y2hzKHRleHQsIHJlZ2V4KVxufVxuXG5leHBvcnQgY29uc3QgUmVnZXhIZWxwZXJzID0ge1xuICBleHRyYWN0TWF0Y2hzLFxuICBleHRyYWN0VXVpZHNWNFxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1hc2tpdCAodmFsdWU6IHN0cmluZyB8IG51bGwsIG1hc2s6IGFueSwgbWFza2VkID0gdHJ1ZSwgdG9rZW5zOiBhbnkpIHtcbiAgdmFsdWUgPSB2YWx1ZSB8fCAnJ1xuICBtYXNrID0gbWFzayB8fCAnJ1xuICBsZXQgaU1hc2sgPSAwXG4gIGxldCBpVmFsdWUgPSAwXG4gIGxldCBvdXRwdXQgPSAnJ1xuICB3aGlsZSAoaU1hc2sgPCBtYXNrLmxlbmd0aCAmJiBpVmFsdWUgPCB2YWx1ZS5sZW5ndGgpIHtcbiAgICB2YXIgY01hc2sgPSBtYXNrW2lNYXNrXVxuICAgIGNvbnN0IG1hc2tlciA9IHRva2Vuc1tjTWFza11cbiAgICBjb25zdCBjVmFsdWUgPSB2YWx1ZVtpVmFsdWVdXG4gICAgaWYgKG1hc2tlciAmJiAhbWFza2VyLmVzY2FwZSkge1xuICAgICAgaWYgKG1hc2tlci5wYXR0ZXJuLnRlc3QoY1ZhbHVlKSkge1xuICAgICAgXHRvdXRwdXQgKz0gbWFza2VyLnRyYW5zZm9ybSA/IG1hc2tlci50cmFuc2Zvcm0oY1ZhbHVlKSA6IGNWYWx1ZVxuICAgICAgICBpTWFzaysrXG4gICAgICB9XG4gICAgICBpVmFsdWUrK1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWFza2VyICYmIG1hc2tlci5lc2NhcGUpIHtcbiAgICAgICAgaU1hc2srKyAvLyB0YWtlIHRoZSBuZXh0IG1hc2sgY2hhciBhbmQgdHJlYXQgaXQgYXMgY2hhclxuICAgICAgICBjTWFzayA9IG1hc2tbaU1hc2tdXG4gICAgICB9XG4gICAgICBpZiAobWFza2VkKSBvdXRwdXQgKz0gY01hc2tcbiAgICAgIGlmIChjVmFsdWUgPT09IGNNYXNrKSBpVmFsdWUrKyAvLyB1c2VyIHR5cGVkIHRoZSBzYW1lIGNoYXJcbiAgICAgIGlNYXNrKytcbiAgICB9XG4gIH1cblxuICAvLyBmaXggbWFzayB0aGF0IGVuZHMgd2l0aCBhIGNoYXI6ICgjKVxuICBsZXQgcmVzdE91dHB1dCA9ICcnXG4gIHdoaWxlIChpTWFzayA8IG1hc2subGVuZ3RoICYmIG1hc2tlZCkge1xuICAgIHZhciBjTWFzayA9IG1hc2tbaU1hc2tdXG4gICAgaWYgKHRva2Vuc1tjTWFza10pIHtcbiAgICAgIHJlc3RPdXRwdXQgPSAnJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gICAgcmVzdE91dHB1dCArPSBjTWFza1xuICAgIGlNYXNrKytcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQgKyByZXN0T3V0cHV0XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZHluYW1pY01hc2sgKG1hc2tpdDogYW55LCBtYXNrczogYW55W10sIHRva2VuczogYW55KTogYW55IHtcbiAgbWFza3MgPSBtYXNrcy5zb3J0KChhLCBiKSA9PiBhLmxlbmd0aCAtIGIubGVuZ3RoKVxuICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlOiBhbnksIG1hc2s6IGFueSwgbWFza2VkID0gdHJ1ZSkge1xuICAgIHZhciBpID0gMFxuICAgIHdoaWxlIChpIDwgbWFza3MubGVuZ3RoKSB7XG4gICAgICB2YXIgY3VycmVudE1hc2sgPSBtYXNrc1tpXVxuICAgICAgaSsrXG4gICAgICB2YXIgbmV4dE1hc2sgPSBtYXNrc1tpXVxuICAgICAgaWYgKCEgKG5leHRNYXNrICYmIG1hc2tpdCh2YWx1ZSwgbmV4dE1hc2ssIHRydWUsIHRva2VucykubGVuZ3RoID4gY3VycmVudE1hc2subGVuZ3RoKSApIHtcbiAgICAgICAgcmV0dXJuIG1hc2tpdCh2YWx1ZSwgY3VycmVudE1hc2ssIG1hc2tlZCwgdG9rZW5zKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gJydcbiAgfVxufSIsImV4cG9ydCBkZWZhdWx0IHtcbiAgJyMnOiB7IHBhdHRlcm46IC9cXGQvIH0sXG4gIFg6IHsgcGF0dGVybjogL1swLTlhLXpBLVpdLyB9LFxuICBTOiB7IHBhdHRlcm46IC9bYS16QS1aXS8gfSxcbiAgQTogeyBwYXR0ZXJuOiAvW2EtekEtWl0vLCB0cmFuc2Zvcm06ICh2OiBzdHJpbmcpID0+IHYudG9Mb2NhbGVVcHBlckNhc2UoKSB9LFxuICBhOiB7IHBhdHRlcm46IC9bYS16QS1aXS8sIHRyYW5zZm9ybTogKHY6IHN0cmluZykgPT4gdi50b0xvY2FsZUxvd2VyQ2FzZSgpIH0sXG4gICchJzogeyBlc2NhcGU6IHRydWUgfVxufSIsImltcG9ydCBtYXNraXQgZnJvbSAnLi9tYXNraXQnXG5pbXBvcnQgZHluYW1pY01hc2sgZnJvbSAnLi9keW5hbWljLW1hc2snXG5pbXBvcnQgdG9rZW5zIGZyb20gJy4vdG9rZW5zJ1xuXG5leHBvcnQgY29uc3QgbWFza2VyID0gZnVuY3Rpb24gKHZhbHVlOiBhbnksIG1hc2s6IGFueSwgbWFza2VkID0gdHJ1ZSkge1xuXG4gIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICBcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkobWFzaylcbiAgICA/IGR5bmFtaWNNYXNrKG1hc2tpdCwgbWFzaywgdG9rZW5zKSh2YWx1ZSwgbWFzaywgbWFza2VkLCB0b2tlbnMpXG4gICAgOiBtYXNraXQodmFsdWUsIG1hc2ssIG1hc2tlZCwgdG9rZW5zKVxuICAgIFxufSIsIlxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUEhPTkVfRERJID0gWycrIyMjJywgJysjIycsICcrIycsICcrIy0jIyMnXVxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUEhPTkVfTUFTSyA9IFsnKCMjKSAjIyMjIy0jIyMjJywgJygjIykgIyMjIy0jIyMjJ11cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BIT05FX01BU0tfV0lUSF9EREkgPSBbJysjIyAjIyMgIyMgIyMgIyMnLCAnKyMgKCMjIykgIyMjLSMjIyMnLCAnKyMjICgjIykgIyMjIy0jIyMjJywgJysjIyAoIyMpICMjIyMjLSMjIyMnLCBdIiwiaW1wb3J0IHsgbWFza2VyIH0gZnJvbSAnLi9tYXNrL21hc2tlcidcbmltcG9ydCB7IERFRkFVTFRfUEhPTkVfRERJLCBERUZBVUxUX1BIT05FX01BU0ssIERFRkFVTFRfUEhPTkVfTUFTS19XSVRIX0RESX0gZnJvbSAnLi9tYXNrL2VudW1zJ1xuXG5leHBvcnQgY29uc3QgbWFzayA9ICh2YWx1ZTogYW55LCBtYXNrOiBhbnkpID0+IHtcbiAgcmV0dXJuIG1hc2tlcih2YWx1ZSwgbWFzaywgdHJ1ZSlcbn1cblxuZXhwb3J0IGNvbnN0IHVubWFzayA9ICh2YWx1ZTogYW55LCBtYXNrOiBhbnkpID0+IHtcbiAgcmV0dXJuIG1hc2tlcih2YWx1ZSwgbWFzaywgZmFsc2UpXG59XG5cbmV4cG9ydCBjb25zdCBNYXNrZXIgPSB7XG4gIG1hc2ssXG4gIHVubWFzayxcbiAgREVGQVVMVF9QSE9ORV9EREksXG4gIERFRkFVTFRfUEhPTkVfTUFTSyxcbiAgREVGQVVMVF9QSE9ORV9NQVNLX1dJVEhfRERJXG59IiwiZXhwb3J0IGNvbnN0IG1hcEFycmF5VG9HcmFwaFFMID0gKGFycmF5OiBhbnlbXSwga2V5OiBzdHJpbmcgfCBudWxsID0gbnVsbCkgPT4ge1xuICBjb25zdCBpdGVtcyA9IGFycmF5Lm1hcCgoaXRlbSkgPT4gYFwiJHsga2V5ID8gaXRlbVtrZXldIDogaXRlbSB9XCJgKS5qb2luKCcsJylcbiAgcmV0dXJuIGBbJHsgaXRlbXMgfV1gXG59XG5cblxuZXhwb3J0IGNvbnN0IEdyYXBoUUxIZWxwZXJzID0ge1xuICBtYXBBcnJheVRvR3JhcGhRTFxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFPLE1BQU0sNkJBQTZCLEdBQUcsQ0FBQyxHQUFhLEdBQUEsRUFBRSxLQUFJO0lBQy9ELElBQUEsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQzdELENBQUMsQ0FBQTtJQUdNLE1BQU0sNkJBQTZCLEdBQUcsQ0FBQyxJQUFTLEtBQUk7SUFDekQsSUFBQSxJQUFHLFFBQU8sSUFBSSxDQUFDLEtBQUssUUFBUTtJQUFFLFFBQUEsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDdkQsSUFBQSxJQUFHLFFBQU8sSUFBSSxDQUFDLEtBQUssUUFBUTtJQUFFLFFBQUEsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDcEQsSUFBQSxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7O1VDUFksZ0JBQWdCLEdBQUcsQ0FBQyxPQUFjLEVBQUUsTUFBVyxLQUFTO1FBQ25FLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsS0FBSTtJQUM5QyxRQUFBLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsRUFBRTtnQkFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUFFLFNBQUE7SUFDbEksUUFBQSxPQUFPLEdBQUcsQ0FBQTtTQUNYLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDUixFQUFDO0FBRU0sVUFBTSxhQUFhLEdBQUcsQ0FBQyxJQUFTLEVBQUUsS0FBVSxFQUFFLGdCQUFBLEdBQTRCLEtBQUssS0FBUztJQUM3RixJQUFBLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxLQUFJO1lBQ2pELElBQUksU0FBUyxHQUFHLDZCQUE2QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1lBQ3hELElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtJQUM1QixZQUFBLElBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTTtJQUFFLGdCQUFBLE9BQU8sZ0JBQWdCLENBQUE7SUFDOUMsWUFBQSxPQUFPLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3RFLFNBQUE7WUFDRCxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUM3QyxLQUFDLENBQUMsQ0FBQTtRQUNGLElBQUcsUUFBUSxDQUFDLE1BQU07SUFBRSxRQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ2hDLElBQUEsT0FBTyxJQUFJLENBQUE7SUFDYixFQUFDO1VBRVksWUFBWSxHQUFHLENBQUMsS0FBVSxFQUFFLEtBQVUsS0FBYTtJQUM5RCxJQUFBLElBQUcsUUFBTyxLQUFLLENBQUMsS0FBSyxRQUFRLElBQUksUUFBTyxLQUFLLENBQUMsS0FBSyxRQUFRO1lBQUUsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQzlHLE9BQU8sS0FBSyxJQUFJLEtBQUssQ0FBQTtJQUN2QixFQUFDO0FBRU0sVUFBTSxhQUFhLEdBQUcsQ0FBQyxRQUFlLEVBQUUsUUFBYSxFQUFFLEdBQUEsR0FBVyxFQUFFLEtBQUk7SUFDN0UsSUFBQSxLQUFJLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRTtZQUMxQixJQUFHLFFBQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLFdBQVcsRUFBRTtJQUN2QyxZQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNuQyxTQUFBO0lBQU0sYUFBQTtnQkFDTCxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUE7SUFDbEMsU0FBQTtJQUVELFFBQUEsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLEVBQUU7SUFDakQsWUFBQSxHQUFHLEtBQUssT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQSxFQUFFO0lBQ2pELFlBQUEsWUFBWSxFQUFFLElBQUk7SUFDbkIsU0FBQSxDQUFDLENBQUE7SUFDSCxLQUFBO0lBQ0gsRUFBQztBQUVZLFVBQUEsY0FBYyxHQUFHLENBQUMsTUFBVyxFQUFFLEdBQVcsRUFBRSxLQUFVLEtBQUk7SUFDckUsSUFBQSxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7SUFDakMsUUFBQSxLQUFLLEVBQUUsS0FBSztJQUNaLFFBQUEsUUFBUSxFQUFFLElBQUk7SUFDZCxRQUFBLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLFFBQUEsWUFBWSxFQUFFLElBQUk7SUFDbkIsS0FBQSxDQUFDLENBQUE7SUFDRixJQUFBLE9BQU8sTUFBTSxDQUFBO0lBQ2YsRUFBQztBQUVZLFVBQUEsUUFBUSxHQUFHLENBQUMsSUFBUyxLQUFhO0lBQzdDLElBQUEsUUFBUSxJQUFJLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtJQUNwRSxFQUFDO0FBRVksVUFBQSxlQUFlLEdBQUcsQ0FBQyxNQUFXLEVBQUUsR0FBRyxPQUFZLEtBQVM7UUFDbkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNO0lBQUUsUUFBQSxPQUFPLE1BQU0sQ0FBQztJQUNuQyxJQUFBLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUvQixJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7SUFDeEMsUUFBQSxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRTtJQUN4QixZQUFBLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0lBQ3pCLGdCQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQUUsb0JBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7NEJBQ3RDLENBQUMsR0FBRyxHQUFHLEVBQUU7SUFDVixxQkFBQSxDQUFDLENBQUM7b0JBQ0gsZUFBZSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzQyxhQUFBO0lBQU0saUJBQUE7SUFDTCxnQkFBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtJQUNwQixvQkFBQSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ25CLGlCQUFBLENBQUMsQ0FBQztJQUNKLGFBQUE7SUFDRixTQUFBO0lBQ0YsS0FBQTtJQUVELElBQUEsT0FBTyxlQUFlLENBQUMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUM7SUFDN0MsRUFBQztBQUVZLFVBQUEsb0JBQW9CLEdBQUcsQ0FBQyxHQUFXLEdBQUEsRUFBRSxFQUFFLEdBQUEsR0FBYyxFQUFFLEtBQVM7SUFDM0UsSUFBQSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSTtJQUN0QyxRQUFBLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxHQUFHLEtBQUssSUFBSTtJQUFFLFlBQUEsT0FBTyxTQUFTLENBQUE7WUFFdkQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0lBQ2pELFFBQUEsSUFBSSxVQUFVLEVBQUU7SUFDZCxZQUFBLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDOUIsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtnQkFFOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLFNBQVMsRUFBRTtJQUM1RSxnQkFBQSxPQUFPLFNBQVMsQ0FBQTtJQUNqQixhQUFBO0lBQ0QsWUFBQSxPQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNqQyxTQUFBO0lBRUQsUUFBQSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUNkLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDVCxFQUFDO0FBRU0sVUFBTSxvQkFBb0IsR0FBRyxDQUFDLEdBQVcsR0FBQSxFQUFFLEVBQUUsR0FBVyxFQUFFLEtBQVUsRUFBRSwwQkFBc0MsR0FBQSxLQUFLLEtBQVM7UUFDL0gsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQzVCLElBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEtBQUk7WUFDNUMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0lBRWpELFFBQUEsSUFBSSxVQUFVLEVBQUU7SUFDZCxZQUFBLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDOUIsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtnQkFFOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7SUFDakMsZ0JBQUEsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssU0FBUyxLQUFLLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxFQUFFO0lBQ3RFLG9CQUFBLE1BQU0sSUFBSSxTQUFTLENBQUMsQ0FBQSxxQkFBQSxFQUF3QixRQUFRLENBQUEsQ0FBQSxFQUFJLFVBQVUsQ0FBQSx1QkFBQSxFQUEwQixPQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBYyxXQUFBLEVBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFBLENBQUcsQ0FBQyxDQUFBO0lBQ3JLLGlCQUFBO0lBQ0QsZ0JBQUEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtJQUNuQixhQUFBOztnQkFHRCxJQUFJLENBQUMsMEJBQTBCLElBQUksVUFBVSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUU7b0JBQ3JFLE1BQU0sSUFBSSxVQUFVLENBQUMsQ0FBVSxPQUFBLEVBQUEsUUFBUSx5QkFBeUIsVUFBVSxDQUFBLFVBQUEsRUFBYSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFHLENBQUEsQ0FBQSxDQUFDLENBQUE7SUFDOUgsYUFBQTs7SUFHRCxZQUFBLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7O2dCQUVuQixDQUFDLEdBQUcsVUFBVSxDQUFBO0lBQ2YsU0FBQTtJQUVELFFBQUEsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7SUFDN0IsWUFBQSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO0lBQ2YsU0FBQTtJQUFNLGFBQUE7O0lBRUwsWUFBQSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEtBQUssT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLEVBQUU7SUFDeEQsZ0JBQUEsTUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFBLHFCQUFBLEVBQXdCLENBQUMsQ0FBQSxzQkFBQSxFQUF5QixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQSxXQUFBLEVBQWMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFBLENBQUcsQ0FBQyxDQUFBO0lBQ3hJLGFBQUE7Z0JBQ0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDdEIsU0FBQTtJQUVELFFBQUEsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDZCxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBRVAsSUFBQSxPQUFPLEdBQUcsQ0FBQTtJQUNaLEVBQUM7QUFFTSxVQUFNLHVCQUF1QixHQUFHLENBQUMsR0FBUSxFQUFFLEdBQVcsRUFBRSxpQkFBQSxHQUE2QixJQUFJLEtBQVM7UUFDdkcsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUUzQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEtBQUk7WUFDakMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0lBRWpELFFBQUEsSUFBSSxVQUFVLEVBQUU7SUFDZCxZQUFBLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDOUIsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUU5QyxZQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7b0JBQ3ZELE1BQU0sSUFBSSxTQUFTLENBQUMsQ0FBMkIsd0JBQUEsRUFBQSxRQUFRLElBQUksVUFBVSxDQUFBLDhCQUFBLEVBQWlDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQSxDQUFBLENBQUMsQ0FBQTtJQUM3SSxhQUFBO0lBRUQsWUFBQSxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTs7b0JBRTdCLElBQUksVUFBVSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRTt3QkFDNUQsTUFBTSxJQUFJLFVBQVUsQ0FBQyxDQUFVLE9BQUEsRUFBQSxRQUFRLHlCQUF5QixVQUFVLENBQUEsVUFBQSxFQUFhLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQSxDQUFBLENBQUMsQ0FBQTtJQUM5SCxpQkFBQTtvQkFDRCxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNwQyxhQUFBO0lBQU0saUJBQUE7b0JBQ0wsR0FBRyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNoQyxhQUFBO0lBQ0YsU0FBQTtJQUFNLGFBQUE7SUFDTCxZQUFBLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFOztvQkFFN0IsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUNoQyxvQkFBQSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNkLGlCQUFBO3lCQUFNLElBQUcsQ0FBQyxpQkFBaUIsRUFBRTt3QkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFBLHFDQUFBLEVBQXdDLENBQUMsQ0FBYyxXQUFBLEVBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBRyxDQUFBLENBQUEsQ0FBQyxDQUFBO0lBQzlHLGlCQUFBO0lBQ0YsYUFBQTtJQUFNLGlCQUFBOztJQUVMLGdCQUFBLElBQUcsaUJBQWlCLEVBQUU7SUFDcEIsb0JBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7SUFDekMsd0JBQUEsT0FBTyxHQUFHLENBQUE7SUFDWCxxQkFBQTtJQUNGLGlCQUFBO0lBQ0QsZ0JBQUEsSUFBSSxDQUFDLGlCQUFpQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxFQUFFO3dCQUNqRSxNQUFNLElBQUksU0FBUyxDQUFDLENBQUEsd0JBQUEsRUFBMkIsQ0FBQyxDQUFpQyw4QkFBQSxFQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQSxDQUFBLENBQUMsQ0FBQTtJQUN4SCxpQkFBQTtJQUNELGdCQUFBLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDYixhQUFBO0lBQ0YsU0FBQTtJQUVELFFBQUEsT0FBTyxHQUFHLENBQUE7U0FDWCxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBRVAsSUFBQSxPQUFPLEdBQUcsQ0FBQTtJQUNaLEVBQUM7QUFJTSxVQUFNLGFBQWEsR0FBRyxDQUMzQixHQUFjLEVBQ2QsU0FBaUIsRUFDakIsU0FBQSxHQUFxQixLQUFLLEtBQ1g7UUFDZixNQUFNLE9BQU8sR0FBVSxFQUFFLENBQUE7UUFDekIsSUFBSSxXQUFXLEdBQVEsSUFBSSxDQUFBO0lBRTNCLElBQUEsTUFBTSxNQUFNLEdBQUcsQ0FBQyxVQUFxQixLQUFJO0lBQ3ZDLFFBQUEsSUFBSSxDQUFDLFNBQVMsSUFBSSxXQUFXLEtBQUssSUFBSTtnQkFBRSxPQUFNO0lBQzlDLFFBQUEsSUFBSSxPQUFPLFVBQVUsS0FBSyxRQUFRLElBQUksVUFBVSxLQUFLLElBQUk7Z0JBQUUsT0FBTTtJQUVqRSxRQUFBLEtBQUssTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFO2dCQUM1QixJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7SUFDckIsZ0JBQUEsSUFBSSxTQUFTLEVBQUU7d0JBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUM5QixpQkFBQTtJQUFNLHFCQUFBO0lBQ0wsb0JBQUEsV0FBVyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQTt3QkFDN0IsT0FBTTtJQUNQLGlCQUFBO0lBQ0YsYUFBQTtJQUNELFlBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ3hCLFNBQUE7SUFDSCxLQUFDLENBQUE7UUFFRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLFNBQVMsR0FBRyxPQUFPLEdBQUcsV0FBVyxDQUFBO0lBQzFDLEVBQUM7VUFFWSxrQkFBa0IsR0FBRyxDQUNoQyxPQUFrQixFQUNsQixVQUFxQixLQUNWO1FBQ1gsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtJQUNuRCxRQUFBLE9BQU8sT0FBTyxPQUFPLEtBQUssT0FBTyxVQUFVLENBQUE7SUFDNUMsS0FBQTtRQUNELElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7SUFDekQsUUFBQSxPQUFPLEtBQUssQ0FBQTtJQUNiLEtBQUE7SUFDRCxJQUFBLEtBQUssTUFBTSxHQUFHLElBQUksT0FBTyxFQUFFO0lBQ3pCLFFBQUEsSUFBSSxFQUFFLEdBQUcsSUFBSSxVQUFVLENBQUM7SUFBRSxZQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ3RDLFFBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFBRSxZQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ3JFLEtBQUE7SUFDRCxJQUFBLE9BQU8sSUFBSSxDQUFBO0lBQ2IsRUFBQztBQUVZLFVBQUEsYUFBYSxHQUFHO1FBQzNCLGdCQUFnQjtRQUNoQixhQUFhO1FBQ2IsWUFBWTtRQUNaLGFBQWE7UUFDYixjQUFjO1FBQ2QsUUFBUTtRQUNSLGVBQWU7UUFDZixvQkFBb0I7UUFDcEIsb0JBQW9CO1FBQ3BCLHVCQUF1QjtRQUN2QixhQUFhOzs7QUN2UFIsVUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFVLEVBQUUsR0FBUSxFQUFFLFNBQUEsR0FBcUIsS0FBSyxLQUFTO0lBQ2pGLElBQUEsS0FBSSxNQUFNLElBQUksSUFBSSxHQUFHLEVBQUU7SUFDckIsUUFBQSxJQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7Z0JBQUUsU0FBUTtZQUN0QyxPQUFPLFNBQVMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQy9CLEtBQUE7SUFDRCxJQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ2QsRUFBQztBQUVNLFVBQU0sWUFBWSxHQUFHLENBQUMsR0FBVSxFQUFFLElBQVMsRUFBRSxTQUFBLEdBQXFCLEtBQUssS0FBUztJQUNyRixJQUFBLEtBQUksTUFBTSxPQUFPLElBQUksR0FBRyxFQUFFO0lBQ3hCLFFBQUEsSUFBRyxRQUFPLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxRQUFPLElBQUksQ0FBQyxLQUFLLFFBQVEsRUFBRTtnQkFDNUQsSUFBRyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFBRSxPQUFPLFNBQVMsR0FBRyxJQUFJLEdBQUcsT0FBTyxDQUFBO0lBQ2xGLFNBQUE7WUFFRCxJQUFHLE9BQU8sSUFBSSxJQUFJLEVBQUU7Z0JBQ2xCLE9BQU8sU0FBUyxHQUFHLElBQUksR0FBRyxPQUFPLENBQUE7SUFDbEMsU0FBQTtJQUNGLEtBQUE7SUFDRCxJQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ2QsRUFBQztBQUVNLFVBQU0sSUFBSSxHQUFHLENBQUMsR0FBVSxFQUFFLEtBQVUsRUFBRSxTQUFBLEdBQXFCLEtBQUssS0FBUztJQUM5RSxJQUFBLElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFBRyxRQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ3RDLElBQUEsSUFBRyxRQUFPLEtBQUssQ0FBQyxLQUFLLFFBQVE7WUFBRSxPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQ3RFLE9BQU8sWUFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDNUMsRUFBQztVQUVZLFNBQVMsR0FBRyxDQUFDLEdBQVUsRUFBRSxLQUFVLEtBQVk7SUFDMUQsSUFBQSxJQUFHLFFBQU8sS0FBSyxDQUFDLEtBQUssUUFBUSxFQUFFO1lBQzdCLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDekMsUUFBQSxPQUFPLFdBQVcsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUM1RCxLQUFBO1FBQ0QsTUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUMvQyxJQUFBLE9BQU8sY0FBYyxLQUFLLEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ3BFLEVBQUM7QUFFTSxVQUFNLE9BQU8sR0FBRyxDQUFDLEdBQVUsRUFBRSxLQUFVLEVBQUUsZ0JBQUEsR0FBNEIsS0FBSyxLQUFXO0lBQzFGLElBQUEsSUFBSSxDQUFDLEtBQUs7SUFBRSxRQUFBLE9BQU8sR0FBRyxDQUFBO0lBQ3RCLElBQUEsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxLQUFJO0lBQ3pCLFFBQUEsTUFBTSxXQUFXLEdBQUcsUUFBTyxJQUFJLENBQUMsS0FBSyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQTtJQUN6RSxRQUFBLElBQUcsUUFBTyxLQUFLLENBQUMsSUFBSSxRQUFRO0lBQUUsWUFBQSxPQUFPLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDOUQsUUFBQSxJQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQUUsWUFBQSxPQUFPLDZCQUE2QixDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFBO0lBQ3pHLFFBQUEsT0FBTyxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQTtJQUNyRSxLQUFDLENBQUMsQ0FBQTtJQUNKLEVBQUM7QUFFTSxVQUFNLFNBQVMsR0FBRyxDQUFDLEdBQVUsRUFBRSxLQUFVLEVBQUUsZ0JBQUEsR0FBNEIsSUFBSSxLQUFXO0lBQzNGLElBQUEsSUFBSSxDQUFDLEtBQUs7SUFBRSxRQUFBLE9BQU8sR0FBRyxDQUFBO0lBQ3RCLElBQUEsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxLQUFJO0lBQ3pCLFFBQUEsTUFBTSxXQUFXLEdBQUcsUUFBTyxJQUFJLENBQUMsS0FBSyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQTtJQUN6RSxRQUFBLElBQUcsUUFBTyxLQUFLLENBQUMsS0FBSyxRQUFRO0lBQUUsWUFBQSxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNoRSxRQUFBLElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFBRSxZQUFBLE9BQU8sNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUE7SUFDekcsUUFBQSxPQUFPLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQTtJQUNwRSxLQUFDLENBQUMsQ0FBQTtJQUNKLEVBQUM7QUFFWSxVQUFBLE1BQU0sR0FBRyxDQUFDLEdBQVUsRUFBRSxLQUFBLEdBQWEsSUFBSSxLQUFTO0lBQzNELElBQUEsSUFBSSxDQUFDLEtBQUs7SUFBRSxRQUFBLE9BQU8sR0FBRyxDQUFBO1FBQ3RCLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDbkMsSUFBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQUUsUUFBQSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNuQyxJQUFBLE9BQU8sR0FBRyxDQUFBO0lBQ1osRUFBQztBQUVZLFVBQUEsV0FBVyxHQUFHLENBQUMsR0FBVSxFQUFFLEtBQUEsR0FBYSxJQUFJLEtBQVc7UUFDbEUsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFBO0lBQ3RCLElBQUEsS0FBSSxNQUFNLElBQUksSUFBSSxHQUFHLEVBQUU7SUFDckIsUUFBQSxJQUFJLE1BQU0sQ0FBQTtZQUNWLElBQUcsQ0FBQyxLQUFLLEVBQUU7Z0JBQ1QsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUNkLFNBQUE7SUFBTSxhQUFBLElBQUcsUUFBTyxLQUFLLENBQUMsS0FBSyxRQUFRLEVBQUU7Z0JBQ3BDLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFBO0lBQ2xDLFNBQUE7SUFBTSxhQUFBO2dCQUNMLE1BQU0sR0FBRyxLQUFLLENBQUE7SUFDZixTQUFBO1lBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUN4QyxRQUFBLElBQUcsQ0FBQyxNQUFNO0lBQUUsWUFBQSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ25DLEtBQUE7SUFDRCxJQUFBLE9BQU8sV0FBVyxDQUFBO0lBQ3BCLEVBQUM7QUFFWSxVQUFBLGFBQWEsR0FBRyxDQUFDLEdBQVUsRUFBRSxTQUFBLEdBQW9CLEdBQUcsS0FBWTtJQUMzRSxJQUFBLElBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFFBQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUTtJQUFFLFFBQUEsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFBLDJDQUFBLENBQTZDLENBQUMsQ0FBQTtRQUNwSCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25DLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNwSCxFQUFDO1VBRVksYUFBYSxHQUFHLENBQUMsR0FBVSxFQUFFLEdBQVEsS0FBVztRQUMzRCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ2xDLElBQUEsSUFBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUU7SUFDZCxRQUFBLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3RCLEtBQUE7SUFBTSxTQUFBO0lBQ0wsUUFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ2QsS0FBQTtJQUNELElBQUEsT0FBTyxHQUFHLENBQUE7SUFDWixFQUFDO0FBRU0sVUFBTSxZQUFZLEdBQUcsQ0FBQyxPQUFjLEVBQUUsWUFBbUIsRUFBRSxHQUFBLEdBQWMsSUFBSSxLQUFhO0lBQy9GLElBQUEsSUFBRyxPQUFPLENBQUMsTUFBTSxLQUFLLFlBQVksQ0FBQyxNQUFNO0lBQUUsUUFBQSxPQUFPLEtBQUssQ0FBQTtJQUN2RCxJQUFBLEtBQUksTUFBTSxJQUFJLElBQUksT0FBTyxFQUFFO0lBQ3pCLFFBQUEsSUFBSSxNQUFNLENBQUE7SUFDVixRQUFBLElBQUcsUUFBTyxJQUFJLENBQUMsS0FBSyxRQUFRLEVBQUU7Z0JBQzVCLE1BQU0sR0FBRyxJQUFJLENBQUE7SUFDZCxTQUFBO0lBQU0sYUFBQTtJQUNMLFlBQUEsSUFBRyxRQUFPLEdBQUcsQ0FBQyxLQUFLLFFBQVE7SUFBRSxnQkFBQSxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUE7Z0JBQ2hGLE1BQU0sR0FBRSxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFBO0lBQzdCLFNBQUE7WUFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQ3pDLFFBQUEsSUFBRyxDQUFDLE1BQU07SUFBRSxZQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ3pCLEtBQUE7SUFDRCxJQUFBLE9BQU8sSUFBSSxDQUFBO0lBQ2IsRUFBQztBQUVZLFVBQUEsT0FBTyxHQUFHLENBQUMsS0FBWSxLQUFJO0lBQ3RDLElBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3pDLFFBQUEsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFXLENBQUE7WUFDdkQsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDNUMsS0FBQTtJQUNELElBQUEsT0FBTyxLQUFLLENBQUE7SUFDZCxFQUFDO0FBRVksVUFBQSxnQkFBZ0IsR0FBRyxDQUFDLElBQVcsS0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFDO0FBRXRGLFVBQUEsWUFBWSxHQUFHO1FBQzFCLFNBQVM7UUFDVCxZQUFZO1FBQ1osSUFBSTtRQUNKLFNBQVM7UUFDVCxPQUFPO1FBQ1AsU0FBUztRQUNULE1BQU07UUFDTixXQUFXO1FBQ1gsYUFBYTtRQUNiLGFBQWE7UUFDYixZQUFZO1FBQ1osT0FBTztRQUNQLGdCQUFnQjs7O0lDeklsQjs7O0lBR0c7VUFDVSxxQkFBcUIsR0FBRyxDQUFDLE1BQWMsRUFBRSxVQUEyQixLQUFJO0lBQ25GLElBQUEsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ3RDLElBQUEsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2xDLE9BQU8sTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDaEMsRUFBQztJQUVEOzs7SUFHRztBQUNJLFVBQU0scUJBQXFCLEdBQUcsQ0FBQyxNQUFjLEVBQUUsS0FBYSxFQUFFLGlCQUEwQixLQUFLLEVBQUUsTUFBZ0IsR0FBQSxDQUFDLEtBQXFCO0lBQzFJLElBQUEsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2xDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFBO0lBQ3hDLElBQUEsSUFBRyxDQUFDLGNBQWM7SUFBRSxRQUFBLE9BQU8sTUFBTSxDQUFBO1FBQ2pDLElBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBRSxNQUFNLEdBQUcsR0FBRyxDQUFFLENBQUM7SUFBRSxRQUFBLE9BQU8sTUFBTSxDQUFDLE1BQU0sR0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMzRCxPQUFPLE1BQU0sQ0FBRSxNQUFNLEdBQUcsR0FBRyxDQUFFLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUM5RyxFQUFDO0FBRVksVUFBQSxLQUFLLEdBQUcsQ0FBQyxLQUFhLEVBQUUsUUFBQSxHQUFtQixDQUFDLEtBQUk7SUFDM0QsSUFBQSxNQUFNLEVBQUUsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDaEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDOUIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDL0IsRUFBQztBQUVZLFVBQUEsU0FBUyxHQUFHLENBQUMsR0FBVyxFQUFFLEdBQUEsR0FBYyxDQUFDLEtBQUk7SUFDeEQsSUFBQSxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN2RCxFQUFDO0lBRUQ7O0lBRUc7VUFDVSxhQUFhLEdBQUcsQ0FBQyxLQUFhLEVBQUUsVUFBMkIsS0FBSTtJQUMxRSxJQUFBLE1BQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUN0QyxJQUFBLE1BQU0sRUFBRSxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNoQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDL0IsRUFBQztJQUVEOzs7SUFHRztBQUNJLFVBQU0sdUJBQXVCLEdBQUcsQ0FBQyxNQUFjLEVBQUUsS0FBYSxFQUFFLFVBQUEsR0FBcUIsRUFBRSxLQUFJO0lBQ2hHLElBQUEsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2xDLElBQUEsTUFBTSxFQUFFLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hDLElBQUEsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQ3RDLElBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxFQUFFO0lBQUUsUUFBQSxPQUFPLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUNqRSxJQUFBLE9BQU8sRUFBRSxDQUFBO0lBQ1gsRUFBQztJQUVELE1BQU0sY0FBYyxHQUFHLENBQUMsS0FBc0IsS0FBWTtJQUN4RCxJQUFBLE9BQU8sUUFBTyxLQUFLLENBQUMsS0FBSyxRQUFRLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUMvRCxDQUFDLENBQUE7QUFFWSxVQUFBLFdBQVcsR0FBRztRQUN6QixxQkFBcUI7UUFDckIscUJBQXFCO1FBQ3JCLEtBQUs7UUFDTCxTQUFTO1FBQ1QsYUFBYTtRQUNiLHVCQUF1Qjs7O0FDL0RaLFVBQUEsZUFBZSxHQUFHLENBQUMsSUFBWSxFQUFFLFFBQUEsR0FBa0IsVUFBVSxLQUFVO0lBQ2xGLElBQUEsSUFBRyxDQUFDLE1BQU07SUFBRSxRQUFBLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQSxvREFBQSxDQUFzRCxDQUFDLENBQUE7SUFDbkYsSUFBQSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMxRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hDLElBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDL0IsSUFBQSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUN2QyxJQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQy9CLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUNaLElBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEMsRUFBQztBQUVZLFVBQUEsZUFBZSxHQUFHLENBQUMsTUFBYyxLQUFVO1FBQ3RELElBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRTtJQUN0QixRQUFBLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3RDLEtBQUE7SUFBTSxTQUFBO1lBQ0wsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUM3QyxRQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hDLFFBQUEsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUE7WUFDcEIsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQ2QsUUFBQSxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzVCLFFBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDakMsS0FBQTtJQUNILEVBQUM7QUFFWSxVQUFBLGlCQUFpQixHQUFHLENBQUMsTUFBYyxLQUFZO1FBQzFELE1BQU0sTUFBTSxHQUFHLDRCQUE0QixDQUFBO0lBQzNDLElBQUEsSUFBRyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsR0FBRyxNQUFNO0lBQUUsUUFBQSxPQUFPLElBQUksQ0FBQTtJQUN4QyxJQUFBLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3ZCLEVBQUM7QUFFTSxVQUFNLGdCQUFnQixHQUFHLE1BQVc7SUFDekMsSUFBQSxJQUFHLFFBQVEsRUFBRTtZQUNYLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLFFBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDdkMsWUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xDLE1BQU0sSUFBSSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUM7Z0JBQzNELE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQztnQkFDakIsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsK0NBQStDLEdBQUcsSUFBSSxDQUFDO0lBQ2pGLFNBQUE7SUFDRixLQUFBO0lBQ0gsRUFBQztVQUVZLGlCQUFpQixHQUFHLENBQUMsYUFBeUIsR0FBQSxJQUFJLEtBQUk7UUFDakUsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ3BCLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUN0QixJQUFBLElBQUcsYUFBYSxFQUFFO0lBQ2hCLFFBQUEsZ0JBQWdCLEVBQUUsQ0FBQTtJQUNuQixLQUFBO0lBQ0gsRUFBQztBQUdNLFVBQU0seUJBQXlCLEdBQUcsQ0FBQyxNQUFpQixHQUFBLE1BQU0sRUFBRSxhQUFBLEdBQXlCLElBQUksRUFBRSxFQUFzQixHQUFBLElBQUksS0FBVTtJQUNwSSxJQUFBLElBQUcsUUFBUSxFQUFFO0lBQ1gsUUFBQSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQVMsS0FBSyxFQUFBO2dCQUNqRCxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7b0JBQ3pDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQTtvQkFDdEIsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDaEMsZ0JBQUEsSUFBRyxFQUFFLEVBQUU7SUFDTCxvQkFBQSxFQUFFLEVBQUUsQ0FBQTtJQUNMLGlCQUFBO0lBQU0scUJBQUE7SUFDTCxvQkFBQSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQ3pCLGlCQUFBO0lBQ0YsYUFBQTtJQUNILFNBQUMsQ0FBQyxDQUFBO0lBQ0gsS0FBQTtJQUNILEVBQUM7QUFFWSxVQUFBLGFBQWEsR0FBRztRQUMzQixlQUFlO1FBQ2YsZUFBZTtRQUNmLGlCQUFpQjtRQUNqQixpQkFBaUI7UUFDakIseUJBQXlCO1FBQ3pCLGdCQUFnQjs7O0lDOURsQixNQUFNLGNBQWMsR0FBNEI7SUFDOUMsSUFBQSxNQUFNLEVBQUUsTUFBTTtJQUNkLElBQUEsTUFBTSxFQUFFLEVBQUU7SUFDVixJQUFBLE9BQU8sRUFBRSxHQUFHO0lBQ1osSUFBQSxRQUFRLEVBQUUsR0FBRztJQUNiLElBQUEsU0FBUyxFQUFFLENBQUM7SUFDWixJQUFBLGNBQWMsRUFBRSxJQUFJO0lBQ3BCLElBQUEsU0FBUyxFQUFFLEtBQUs7S0FDakI7O0lDckJEOzs7Ozs7Ozs7SUFTRztBQUlVLFVBQUEsWUFBWSxHQUFHLENBQUMsS0FBZ0MsR0FBQSxHQUFHLEVBQUUsR0FBQSxHQUF3QyxFQUFFLEtBQUk7SUFDOUcsSUFBQSxNQUFNLGFBQWEsR0FBTyxNQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLGNBQWMsQ0FBSyxFQUFBLEdBQUcsQ0FBQyxDQUFDO0lBRWxELElBQUEsSUFBSSxhQUFhLENBQUM7UUFFbEIsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ1gsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFO0lBQ3pELFlBQUEsYUFBYSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO0lBQzlELFNBQUE7SUFBTSxhQUFBO0lBQ0wsWUFBQSxhQUFhLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFBO0lBQ2pDLFNBQUE7SUFDRixLQUFBO0lBQU0sU0FBQTtZQUNMLGFBQWEsR0FBRyxFQUFFLENBQUE7SUFDbkIsS0FBQTtJQUdELElBQUEsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsY0FBYyxDQUFDLEdBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUN2RixNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtRQUMxRCxNQUFNLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFNUUsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ2pELElBQUEsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ2hDLElBQUEsTUFBTSxPQUFPLEdBQUcsb0JBQW9CLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUU5RSxPQUFPLFdBQVcsR0FBRyxhQUFhLENBQUMsTUFBTSxHQUFHLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUE7SUFDbkksRUFBQztBQUVZLFVBQUEsY0FBYyxHQUFHLENBQUMsS0FBZ0MsR0FBQSxDQUFDLEVBQUUsR0FBQSxHQUF3QyxFQUFFLEtBQUk7SUFDOUcsSUFBQSxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFN0QsSUFBQSxNQUFNLFNBQVMsR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBRTdCLElBQUEsTUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFM0MsSUFBRyxhQUFhLENBQUMsU0FBUyxFQUFFO1lBQzFCLE9BQU8sUUFBUSxDQUFDLENBQUEsRUFBRyxVQUFVLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxjQUFjLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBLEVBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFFLENBQUEsQ0FBQyxDQUFBO0lBQzFHLEtBQUE7SUFFRCxJQUFBLE1BQU0sa0JBQWtCLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQTtRQUNoRixNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3BFLElBQUEsT0FBTyxrQkFBa0IsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQy9FLEVBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUFFLEtBQUEsR0FBeUIsQ0FBQyxFQUFBO0lBQ25ELElBQUEsT0FBTyxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO0lBQzNELENBQUM7SUFFRDtJQUNBLFNBQVMsS0FBSyxDQUFDLFNBQWlCLEVBQUE7SUFDOUIsSUFBQSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDN0MsQ0FBQztJQUVELFNBQVMsaUJBQWlCLENBQUUsT0FBZSxFQUFFLFNBQWlCLEVBQUE7UUFDNUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDbkMsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUN2QyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUVELFNBQVMsb0JBQW9CLENBQUUsT0FBZSxFQUFFLFNBQWlCLEVBQUE7UUFDL0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLENBQUssRUFBQSxFQUFBLFNBQVMsQ0FBRSxDQUFBLENBQUMsQ0FBQTtJQUNwRSxDQUFDO0lBRUQsU0FBUyxxQkFBcUIsQ0FBRSxPQUFlLEVBQUUsT0FBZSxFQUFFLFNBQWlCLEVBQUE7SUFDakYsSUFBQSxJQUFJLE9BQU8sRUFBRTtJQUNYLFFBQUEsT0FBTyxPQUFPLEdBQUcsU0FBUyxHQUFHLE9BQU8sQ0FBQztJQUN0QyxLQUFBO0lBRUQsSUFBQSxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQsU0FBUyxVQUFVLENBQUMsTUFBdUIsRUFBRSxjQUFjLEdBQUcsSUFBSSxFQUFBO0lBQ2hFLElBQUEsSUFBRyxDQUFDLGNBQWM7SUFBRSxRQUFBLE9BQU8sS0FBSyxDQUFBO0lBRWhDLElBQUEsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2hDLElBQUEsTUFBTSxVQUFVLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDakUsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFNUMsSUFBQSxPQUFPLFVBQVUsSUFBSSxDQUFDLGFBQWEsQ0FBQTtJQUNyQyxDQUFDO0FBRVksVUFBQSxZQUFZLEdBQUc7UUFDMUIsWUFBWTtRQUNaLGNBQWM7OztVQzlFSCxPQUFPLENBQUE7SUFRbEIsSUFBQSxXQUFBLENBQVksT0FBeUIsRUFBQTtJQUxyQyxRQUFBLElBQUEsQ0FBQSxZQUFZLEdBQVcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQy9ELElBQVUsQ0FBQSxVQUFBLEdBQWdCLFNBQVMsQ0FBQTtZQUNuQyxJQUFRLENBQUEsUUFBQSxHQUFXLEtBQUssQ0FBQTtZQUN4QixJQUFLLENBQUEsS0FBQSxHQUFjLElBQUksQ0FBQTtZQUdyQixJQUFHLENBQUMsT0FBTyxDQUFDLEdBQUc7SUFBRSxZQUFBLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtZQUNuRCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDcEQsSUFBRyxPQUFPLENBQUMsWUFBWTtJQUFHLFlBQUEsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFBO1lBQ2xFLElBQUcsT0FBTyxDQUFDLFVBQVU7SUFBRyxZQUFBLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQTtZQUM1RCxJQUFHLE9BQU8sQ0FBQyxRQUFRO0lBQUcsWUFBQSxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUE7WUFDdEQsSUFBRyxPQUFPLENBQUMsS0FBSztJQUFHLFlBQUEsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFBO1NBQzlDO0lBRUQsSUFBQSx1QkFBdUIsQ0FBQyxHQUFXLEVBQUE7SUFDakMsUUFBQSxJQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHO0lBQUUsWUFBQSxPQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDekMsUUFBQSxPQUFPLEdBQUcsQ0FBQTtTQUNYO0lBRUYsQ0FBQTtVQUVZLGdCQUFnQixDQUFBO0lBTTNCLElBQUEsV0FBQSxDQUFZLE9BQWUsRUFBQTtZQUozQixJQUFPLENBQUEsT0FBQSxHQUFXLEVBQUUsQ0FBQTtZQUNwQixJQUFLLENBQUEsS0FBQSxHQUFjLEVBQUUsQ0FBQTtZQUNyQixJQUFpQixDQUFBLGlCQUFBLEdBQVcsRUFBRSxDQUFBO0lBRzVCLFFBQUEsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7SUFDdEIsUUFBQSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQTtTQUNoQjtJQUVELElBQUEsSUFBWSxTQUFTLEdBQUE7SUFDdkIsUUFBQSxNQUFNLE1BQU0sR0FDWixDQUFBO0FBQ0csRUFBQSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQSx1QkFBQSxFQUEyQixJQUFJLENBQUMsaUJBQWtCLENBQUEsbUJBQUEsQ0FBcUIsR0FBRyxFQUFHLENBQUE7O0NBRXhHLENBQUE7SUFDRCxRQUFBLE9BQU8sTUFBTSxDQUFBO1NBQ1Y7SUFFRCxJQUFBLElBQVksT0FBTyxHQUFBO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUk7SUFDN0IsWUFBQSxJQUFJLFVBQVUsR0FDcEIsQ0FBQTs7V0FFWSxJQUFJLENBQUMsT0FBUSxDQUFJLEVBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxHQUFHLElBQUssSUFBSSxDQUFDLEdBQUksQ0FBRyxDQUFBLENBQUE7QUFDakQsY0FBQSxFQUFBLElBQUksQ0FBQyxRQUFRLENBQUE7QUFDZCxhQUFBLEVBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQTtrQkFDZCxJQUFJLENBQUMsVUFBVSxDQUFBLGFBQUEsQ0FBZSxDQUFBO2dCQUU1QyxJQUFHLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBRWIsVUFBVTtJQUNoQixvQkFBQSxDQUFBOztxQkFFcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUE7eUJBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUE7dUJBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFBO3FCQUNsQixDQUFBO0lBQ2hCLGFBQUE7Z0JBQ0QsVUFBVTtJQUNkLGdCQUFBLENBQUE7O0NBRUMsQ0FBQTtJQUNELFlBQUEsT0FBTyxVQUFVLENBQUE7SUFFZixTQUFDLENBQUM7aUJBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBRVI7SUFFRCxJQUFBLElBQVksU0FBUyxHQUFBO0lBQ25CLFFBQUEsT0FBTyxXQUFXLENBQUE7U0FDbkI7SUFFTSxJQUFBLG9CQUFvQixDQUFDLElBQVksRUFBQTtJQUN0QyxRQUFBLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUE7U0FDOUI7SUFFTSxJQUFBLE9BQU8sQ0FBQyxPQUF5QixFQUFBO1lBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7U0FDdEM7UUFFTSxRQUFRLEdBQUE7SUFDYixRQUFBLE1BQU0sTUFBTSxHQUNoQixDQUFBO0FBQ0csRUFBQSxJQUFJLENBQUMsU0FBVSxDQUFBO0FBQ2YsRUFBQSxJQUFJLENBQUMsT0FBUSxDQUFBO0FBQ2IsRUFBQSxJQUFJLENBQUMsU0FBVSxDQUFBO0NBQ2pCLENBQUE7SUFDRyxRQUFBLE9BQU8sTUFBTSxDQUFBO1NBQ2Q7SUFFRjs7QUNsSFksVUFBQSxlQUFlLEdBQUcsQ0FBQyxHQUFXLEtBQVk7SUFDckQsSUFBQSxPQUFPLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN2SCxFQUFDO0FBRVksVUFBQSxZQUFZLEdBQUcsQ0FBQyxNQUFjLEtBQVk7UUFDckQsSUFBSSxNQUFNLEdBQWEsRUFBRSxDQUFBO1FBQ3pCLElBQUksVUFBVSxHQUFTLGdFQUFnRSxDQUFBO0lBQ3ZGLElBQUEsSUFBSSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFBO1FBQ3hDLEtBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUc7SUFDaEMsUUFBQSxNQUFNLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUE7SUFDM0UsS0FBQTtJQUNELElBQUEsT0FBTyxNQUFNLENBQUE7SUFDZixFQUFDO0FBRVksVUFBQSxnQkFBZ0IsR0FBRyxDQUFDLENBQWEsRUFBRSxhQUFhLEdBQUcsT0FBTyxLQUFJO1FBQ3pFLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLGFBQWEsQ0FBQyxDQUFBO0lBQzVGLEVBQUM7SUFFRCxTQUFTLFdBQVcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFBO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTtJQUVqQixJQUFBLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ2hDLFFBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbEIsS0FBQTtJQUVELElBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNuQixLQUFBO0lBRUQsSUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUNoQyxRQUFBLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ2hDLFlBQUEsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtJQUNyQyxnQkFBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDdEMsYUFBQTtJQUFNLGlCQUFBO29CQUNILE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUNuQixNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ3hCLElBQUksQ0FBQyxHQUFHLENBQ0osTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ3BCLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUN2QixDQUNKLENBQUE7SUFDSixhQUFBO0lBQ0osU0FBQTtJQUNKLEtBQUE7UUFFRCxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ25DLENBQUM7QUFFTSxVQUFNLHFCQUFxQixHQUFHLENBQUMsSUFBWSxFQUFFLGVBQXVCLEVBQUUsZUFBQSxHQUEyQixJQUFJLEtBQVk7SUFDdEgsSUFBQSxJQUFHLGVBQWUsRUFBRTtJQUNsQixRQUFBLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDekIsUUFBQSxlQUFlLEdBQUcsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ2hELEtBQUE7UUFDRCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFBO0lBQ25ELElBQUEsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUM1RCxJQUFBLE1BQU0sVUFBVSxHQUFHLENBQUMsR0FBRyxRQUFRLEdBQUcsTUFBTSxDQUFBO0lBQ3hDLElBQUEsT0FBTyxVQUFVLENBQUE7SUFDbkIsRUFBQztBQUVNLFVBQU0sb0JBQW9CLEdBQUcsQ0FBQyxJQUFZLEVBQUUsZUFBdUIsRUFBRSxZQUFvQixHQUFHLEVBQUUsZUFBMkIsR0FBQSxJQUFJLEtBQWE7UUFDL0ksT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxJQUFJLFNBQVMsQ0FBQTtJQUNuRixFQUFDO1VBRVkseUJBQXlCLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxLQUFJO0lBQ3BELElBQUEsSUFBSSxDQUFDLEdBQUc7SUFBRSxRQUFBLE9BQU8sRUFBRSxDQUFBO0lBQ25CLElBQUEsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFBO0lBQ3BDLElBQUEsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUMvRyxFQUFDO0FBRVksVUFBQSxZQUFZLEdBQUcsQ0FBQyxJQUFlLEdBQUEsRUFBRSxFQUFFLEdBQUEsR0FBYyxFQUFFLEtBQUk7UUFDbEUsSUFBSTtJQUNGLFFBQUEsSUFBRyxDQUFDLElBQUk7SUFBRSxZQUFBLE9BQU8sRUFBRSxDQUFBO1lBQ25CLElBQUcsR0FBRyxJQUFJLENBQUM7Z0JBQUUsT0FBTyxJQUFJLEdBQUcsS0FBSyxDQUFBO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQSxFQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0lBQ2pFLEtBQUE7SUFBQyxJQUFBLE9BQU8sS0FBSyxFQUFFO1lBQ2QsT0FBTyxJQUFJLElBQUksRUFBRSxDQUFBO0lBQ2xCLEtBQUE7SUFDSCxFQUFDO0FBRVksVUFBQSxhQUFhLEdBQUc7UUFDM0IsZUFBZTtRQUNmLFlBQVk7UUFDWixnQkFBZ0I7UUFDaEIscUJBQXFCO1FBQ3JCLG9CQUFvQjtRQUNwQix5QkFBeUI7UUFDekIsWUFBWTs7O1VDckZELGFBQWEsR0FBRyxDQUFDLElBQVksRUFBRSxLQUFhLEtBQW1CO1FBQzFFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ3ZDLE9BQU8sQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7SUFDOUIsRUFBQztBQUVZLFVBQUEsY0FBYyxHQUFHLENBQUMsSUFBWSxLQUFtQjtRQUM1RCxNQUFNLEtBQUssR0FBRywrRUFBK0UsQ0FBQTtJQUM3RixJQUFBLE9BQU8sYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNuQyxFQUFDO0FBRVksVUFBQSxZQUFZLEdBQUc7UUFDMUIsYUFBYTtRQUNiLGNBQWM7OztJQ2JRLFNBQUEsTUFBTSxDQUFFLEtBQW9CLEVBQUUsSUFBUyxFQUFFLE1BQU0sR0FBRyxJQUFJLEVBQUUsTUFBVyxFQUFBO0lBQ3pGLElBQUEsS0FBSyxHQUFHLEtBQUssSUFBSSxFQUFFLENBQUE7SUFDbkIsSUFBQSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQTtRQUNqQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUE7UUFDYixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUE7UUFDZixPQUFPLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO0lBQ25ELFFBQUEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3ZCLFFBQUEsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzVCLFFBQUEsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzVCLFFBQUEsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUM1QixJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0lBQ2hDLGdCQUFBLE1BQU0sSUFBSSxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFBO0lBQzdELGdCQUFBLEtBQUssRUFBRSxDQUFBO0lBQ1IsYUFBQTtJQUNELFlBQUEsTUFBTSxFQUFFLENBQUE7SUFDVCxTQUFBO0lBQU0sYUFBQTtJQUNMLFlBQUEsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtvQkFDM0IsS0FBSyxFQUFFLENBQUE7SUFDUCxnQkFBQSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3BCLGFBQUE7SUFDRCxZQUFBLElBQUksTUFBTTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFBO2dCQUMzQixJQUFJLE1BQU0sS0FBSyxLQUFLO29CQUFFLE1BQU0sRUFBRSxDQUFBO0lBQzlCLFlBQUEsS0FBSyxFQUFFLENBQUE7SUFDUixTQUFBO0lBQ0YsS0FBQTs7UUFHRCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUE7SUFDbkIsSUFBQSxPQUFPLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sRUFBRTtJQUNwQyxRQUFBLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN2QixRQUFBLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNqQixVQUFVLEdBQUcsRUFBRSxDQUFBO2dCQUNmLE1BQUs7SUFDTixTQUFBO1lBQ0QsVUFBVSxJQUFJLEtBQUssQ0FBQTtJQUNuQixRQUFBLEtBQUssRUFBRSxDQUFBO0lBQ1IsS0FBQTtRQUVELE9BQU8sTUFBTSxHQUFHLFVBQVUsQ0FBQTtJQUM1Qjs7SUN4Q3dCLFNBQUEsV0FBVyxDQUFFLE1BQVcsRUFBRSxLQUFZLEVBQUUsTUFBVyxFQUFBO1FBQ3pFLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqRCxJQUFBLE9BQU8sVUFBVSxLQUFVLEVBQUUsSUFBUyxFQUFFLE1BQU0sR0FBRyxJQUFJLEVBQUE7WUFDbkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ1QsUUFBQSxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO0lBQ3ZCLFlBQUEsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzFCLFlBQUEsQ0FBQyxFQUFFLENBQUE7SUFDSCxZQUFBLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDdkIsSUFBSSxFQUFHLFFBQVEsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRztvQkFDdEYsT0FBTyxNQUFNLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDbEQsYUFBQTtJQUNGLFNBQUE7SUFDRCxRQUFBLE9BQU8sRUFBRSxDQUFBO0lBQ1gsS0FBQyxDQUFBO0lBQ0g7O0FDZEEsaUJBQWU7SUFDYixJQUFBLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7SUFDdEIsSUFBQSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFO0lBQzdCLElBQUEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRTtJQUMxQixJQUFBLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBUyxLQUFLLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO0lBQzNFLElBQUEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFTLEtBQUssQ0FBQyxDQUFDLGlCQUFpQixFQUFFLEVBQUU7SUFDM0UsSUFBQSxHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0tBQ3RCOztJQ0hNLE1BQU0sTUFBTSxHQUFHLFVBQVUsS0FBVSxFQUFFLElBQVMsRUFBRSxNQUFNLEdBQUcsSUFBSSxFQUFBO0lBRWxFLElBQUEsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUVyQixJQUFBLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDeEIsVUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7Y0FDOUQsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBRXpDLENBQUM7O0lDWE0sTUFBTSxpQkFBaUIsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ3pELE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFBO0lBQ2hFLE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxxQkFBcUIsRUFBRzs7VUNBdEgsSUFBSSxHQUFHLENBQUMsS0FBVSxFQUFFLElBQVMsS0FBSTtRQUM1QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ2xDLEVBQUM7VUFFWSxNQUFNLEdBQUcsQ0FBQyxLQUFVLEVBQUUsSUFBUyxLQUFJO1FBQzlDLE9BQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDbkMsRUFBQztBQUVZLFVBQUEsTUFBTSxHQUFHO1FBQ3BCLElBQUk7UUFDSixNQUFNO1FBQ04saUJBQWlCO1FBQ2pCLGtCQUFrQjtRQUNsQiwyQkFBMkI7OztBQ2hCaEIsVUFBQSxpQkFBaUIsR0FBRyxDQUFDLEtBQVksRUFBRSxHQUFBLEdBQXFCLElBQUksS0FBSTtJQUMzRSxJQUFBLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQSxDQUFBLEVBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFLLENBQUcsQ0FBQSxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDNUUsT0FBTyxDQUFBLENBQUEsRUFBSyxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUE7SUFDdkIsRUFBQztBQUdZLFVBQUEsY0FBYyxHQUFHO1FBQzVCLGlCQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=
