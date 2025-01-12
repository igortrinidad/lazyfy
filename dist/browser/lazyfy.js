
  /**
   * @license
   * author: igortrindade.dev
   * lazyfy.js v2.30.0
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

    exports.ArrayHelpers = ArrayHelpers;
    exports.CommonHelpers = CommonHelpers;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eWZ5LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvVXRpbC50cyIsIi4uLy4uLy4uL3NyYy9PYmplY3RIZWxwZXJzLnRzIiwiLi4vLi4vLi4vc3JjL0FycmF5SGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9NYXRoSGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9Db21tb25IZWxwZXJzLnRzIiwiLi4vLi4vLi4vc3JjL3R5cGVzL051bWJlckZvcm1hdE9wdGlvbnMudHMiLCIuLi8uLi8uLi9zcmMvTnVtYmVyRm9ybWF0LnRzIiwiLi4vLi4vLi4vc3JjL1NpdGVNYXBHZW5lcmF0b3IudHMiLCIuLi8uLi8uLi9zcmMvU3RyaW5nSGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9SZWdleEhlbHBlcnMudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9tYXNraXQudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9keW5hbWljLW1hc2sudHMiLCIuLi8uLi8uLi9zcmMvbWFzay90b2tlbnMudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9tYXNrZXIudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9lbnVtcy50cyIsIi4uLy4uLy4uL3NyYy9NYXNrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IHJlbWFwQXJyYXlUb0xvd2VyQ2FzZUlmU3RyaW5nID0gKGFycjogYW55W10gPSBbXSkgPT4ge1xuICByZXR1cm4gYXJyLm1hcChpdGVtID0+IGxvd2VyQ2FzZUFuZFN0cmluZ2lmeUlmTnVtYmVyKGl0ZW0pKVxufVxuXG5cbmV4cG9ydCBjb25zdCBsb3dlckNhc2VBbmRTdHJpbmdpZnlJZk51bWJlciA9IChpdGVtOiBhbnkpID0+IHtcbiAgaWYodHlwZW9mKGl0ZW0pID09PSAnc3RyaW5nJykgcmV0dXJuIGl0ZW0udG9Mb3dlckNhc2UoKVxuICBpZih0eXBlb2YoaXRlbSkgPT09ICdudW1iZXInKSByZXR1cm4gaXRlbS50b1N0cmluZygpXG4gIHJldHVybiBpdGVtXG59IiwiaW1wb3J0IHsgcmVtYXBBcnJheVRvTG93ZXJDYXNlSWZTdHJpbmcsIGxvd2VyQ2FzZUFuZFN0cmluZ2lmeUlmTnVtYmVyIH0gZnJvbSAnLi9VdGlsJ1xuXG5leHBvcnQgY29uc3QgZmlsdGVyT2JqZWN0S2V5cyA9IChhbGxvd2VkOiBhbnlbXSwgb2JqZWN0OiBhbnkpOiBhbnkgPT4ge1xuICByZXR1cm4gYWxsb3dlZC5yZWR1Y2UoKGFjYywgYWxsb3dlZEF0dHJpYnV0ZSkgPT4ge1xuICAgIGlmIChvYmplY3QgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgYWxsb3dlZEF0dHJpYnV0ZSkpIHsgYWNjW2FsbG93ZWRBdHRyaWJ1dGVdID0gb2JqZWN0W2FsbG93ZWRBdHRyaWJ1dGVdIH1cbiAgICByZXR1cm4gYWNjXG4gIH0sIHt9KVxufVxuXG5leHBvcnQgY29uc3QgY2hlY2tPYmpNYXRjaCA9IChpdGVtOiBhbnksIHF1ZXJ5OiBhbnksIGlnbm9yZUVtcHR5QXJyYXk6IGJvb2xlYW4gPSBmYWxzZSk6IGFueSA9PiB7XG4gIGNvbnN0IGRpZmZLZXlzID0gT2JqZWN0LmtleXMocXVlcnkpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgbGV0IGF0dHJRdWVyeSA9IGxvd2VyQ2FzZUFuZFN0cmluZ2lmeUlmTnVtYmVyKGl0ZW1ba2V5XSlcbiAgICBpZihBcnJheS5pc0FycmF5KHF1ZXJ5W2tleV0pKSB7XG4gICAgICBpZighcXVlcnlba2V5XS5sZW5ndGgpIHJldHVybiBpZ25vcmVFbXB0eUFycmF5XG4gICAgICByZXR1cm4gIXJlbWFwQXJyYXlUb0xvd2VyQ2FzZUlmU3RyaW5nKHF1ZXJ5W2tleV0pLmluY2x1ZGVzKGF0dHJRdWVyeSlcbiAgICB9XG4gICAgcmV0dXJuICFjaGVja0lzRXF1YWwoYXR0clF1ZXJ5LCBxdWVyeVtrZXldKVxuICB9KVxuICBpZihkaWZmS2V5cy5sZW5ndGgpIHJldHVybiBmYWxzZVxuICByZXR1cm4gaXRlbVxufVxuXG5leHBvcnQgY29uc3QgY2hlY2tJc0VxdWFsID0gKHZhbHVlOiBhbnksIHF1ZXJ5OiBhbnkpOiBib29sZWFuID0+IHtcbiAgaWYodHlwZW9mKHF1ZXJ5KSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mKHZhbHVlKSA9PT0gJ3N0cmluZycpIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpID09IHF1ZXJ5LnRvTG93ZXJDYXNlKClcbiAgcmV0dXJuIHZhbHVlID09IHF1ZXJ5XG59XG5cbmV4cG9ydCBjb25zdCBpbml0Q2xhc3NEYXRhID0gKGZpbGxhYmxlOiBhbnlbXSwgaW5zdGFuY2U6IGFueSwgb2JqOiBhbnkgPSB7fSkgPT4geyAgXG4gIGZvcihjb25zdCBhdHRyIG9mIGZpbGxhYmxlKSB7XG4gICAgaWYodHlwZW9mKG9ialthdHRyLmtleV0pICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICBpbnN0YW5jZVthdHRyLmtleV0gPSBvYmpbYXR0ci5rZXldXG4gICAgfSBlbHNlIHtcbiAgICAgIGluc3RhbmNlW2F0dHIua2V5XSA9IGF0dHIuZGVmYXVsdFxuICAgIH1cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpbnN0YW5jZSwgJ2dldEZpbGxhYmxlS2V5cycsIHtcbiAgICAgIGdldCgpIHsgcmV0dXJuIGZpbGxhYmxlLm1hcCgoaXRlbSkgPT4gaXRlbS5rZXkpIH0sXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBkZWZpbmVQcm9wZXJ0eSA9IChvYmplY3Q6IGFueSwga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpID0+IHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pXG4gIHJldHVybiBvYmplY3Rcbn1cblxuZXhwb3J0IGNvbnN0IGlzT2JqZWN0ID0gKGl0ZW06IGFueSk6IGJvb2xlYW4gPT4ge1xuICByZXR1cm4gKGl0ZW0gJiYgdHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGl0ZW0pKTtcbn1cblxuZXhwb3J0IGNvbnN0IGRlZXBNZXJnZU9iamVjdCA9ICh0YXJnZXQ6IGFueSwgLi4uc291cmNlczogYW55KTogYW55ID0+IHtcbiAgaWYgKCFzb3VyY2VzLmxlbmd0aCkgcmV0dXJuIHRhcmdldDtcbiAgY29uc3Qgc291cmNlID0gc291cmNlcy5zaGlmdCgpO1xuXG4gIGlmIChpc09iamVjdCh0YXJnZXQpICYmIGlzT2JqZWN0KHNvdXJjZSkpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChpc09iamVjdChzb3VyY2Vba2V5XSkpIHtcbiAgICAgICAgaWYgKCF0YXJnZXRba2V5XSkgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHtcbiAgICAgICAgICBba2V5XToge31cbiAgICAgICAgfSk7XG4gICAgICAgIGRlZXBNZXJnZU9iamVjdCh0YXJnZXRba2V5XSwgc291cmNlW2tleV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHtcbiAgICAgICAgICBba2V5XTogc291cmNlW2tleV1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlZXBNZXJnZU9iamVjdCh0YXJnZXQsIC4uLnNvdXJjZXMpO1xufVxuXG5leHBvcnQgY29uc3QgZ2V0TmVzdGVkT2JqZWN0QnlLZXkgPSAob2JqOiBhbnkgPSB7fSwga2V5OiBzdHJpbmcgPSAnJyk6IGFueSA9PiB7XG4gIHJldHVybiBrZXkuc3BsaXQoJy4nKS5yZWR1Y2UoKGFjYywgaykgPT4ge1xuICAgIGlmIChhY2MgPT09IHVuZGVmaW5lZCB8fCBhY2MgPT09IG51bGwpIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNvbnN0IGFycmF5TWF0Y2ggPSBrLm1hdGNoKC9eKFteXFxbXSspXFxbKFxcZCspXFxdJC8pXG4gICAgaWYgKGFycmF5TWF0Y2gpIHtcbiAgICAgIGNvbnN0IGFycmF5S2V5ID0gYXJyYXlNYXRjaFsxXVxuICAgICAgY29uc3QgYXJyYXlJbmRleCA9IHBhcnNlSW50KGFycmF5TWF0Y2hbMl0sIDEwKVxuXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWNjW2FycmF5S2V5XSkgfHwgYWNjW2FycmF5S2V5XVthcnJheUluZGV4XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2NbYXJyYXlLZXldW2FycmF5SW5kZXhdXG4gICAgfVxuXG4gICAgcmV0dXJuIGFjY1trXVxuICB9LCBvYmopXG59XG5cbmV4cG9ydCBjb25zdCBzZXROZXN0ZWRPYmplY3RCeUtleSA9IChvYmo6IGFueSA9IHt9LCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSwgYWxsb3dOb25FeGlzdGluZ0FycmF5SW5kZXg6IGJvb2xlYW4gPSBmYWxzZSk6IGFueSA9PiB7XG4gIG9iaiA9IE9iamVjdC5hc3NpZ24oe30sIG9iailcbiAga2V5LnNwbGl0KCcuJykucmVkdWNlKChhY2MsIGssIGluZGV4LCBrZXlzKSA9PiB7XG4gICAgY29uc3QgYXJyYXlNYXRjaCA9IGsubWF0Y2goL14oW15cXFtdKylcXFsoXFxkKylcXF0kLylcblxuICAgIGlmIChhcnJheU1hdGNoKSB7XG4gICAgICBjb25zdCBhcnJheUtleSA9IGFycmF5TWF0Y2hbMV1cbiAgICAgIGNvbnN0IGFycmF5SW5kZXggPSBwYXJzZUludChhcnJheU1hdGNoWzJdLCAxMClcblxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFjY1thcnJheUtleV0pKSB7XG4gICAgICAgIGlmIChhY2NbYXJyYXlLZXldICE9PSB1bmRlZmluZWQgJiYgKHR5cGVvZiBhY2NbYXJyYXlLZXldICE9PSAnb2JqZWN0JykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBDYW5ub3Qgc2V0IHByb3BlcnR5ICcke2FycmF5S2V5fVske2FycmF5SW5kZXh9XScgb24gbm9uLW9iamVjdCB0eXBlICgke3R5cGVvZiBhY2NbYXJyYXlLZXldfSkgYXQgcGF0aCAnJHtrZXlzLnNsaWNlKDAsIGluZGV4ICsgMSkuam9pbignLicpfSdgKVxuICAgICAgICB9XG4gICAgICAgIGFjY1thcnJheUtleV0gPSBbXVxuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiB0aGUgYXJyYXkgaGFzIHRoZSBzcGVjaWZpZWQgaW5kZXhcbiAgICAgIGlmICghYWxsb3dOb25FeGlzdGluZ0FycmF5SW5kZXggJiYgYXJyYXlJbmRleCA+PSBhY2NbYXJyYXlLZXldLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgQXJyYXkgJyR7YXJyYXlLZXl9JyBkb2VzIG5vdCBoYXZlIGluZGV4ICR7YXJyYXlJbmRleH0gYXQgcGF0aCAnJHtrZXlzLnNsaWNlKDAsIGluZGV4ICsgMSkuam9pbignLicpfSdgKVxuICAgICAgfVxuXG4gICAgICAvLyBTZXQgdGhlIGN1cnJlbnQgYWNjdW11bGF0b3IgdG8gdGhlIHNwZWNpZmllZCBpbmRleCBpbiB0aGUgYXJyYXlcbiAgICAgIGFjYyA9IGFjY1thcnJheUtleV1cbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGsgPSBhcnJheUluZGV4XG4gICAgfVxuXG4gICAgaWYgKGluZGV4ID09PSBrZXlzLmxlbmd0aCAtIDEpIHtcbiAgICAgIGFjY1trXSA9IHZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRocm93IGFuIGVycm9yIGlmIHRoZSBjdXJyZW50IGxldmVsIGlzIG5vdCBhbiBvYmplY3RcbiAgICAgIGlmIChhY2Nba10gIT09IHVuZGVmaW5lZCAmJiAodHlwZW9mIGFjY1trXSAhPT0gJ29iamVjdCcpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYENhbm5vdCBzZXQgcHJvcGVydHkgJyR7a30nIG9uIG5vbi1vYmplY3QgdHlwZSAoJHt0eXBlb2YgYWNjW2tdfSkgYXQgcGF0aCAnJHtrZXlzLnNsaWNlKDAsIGluZGV4ICsgMSkuam9pbignLicpfSdgKVxuICAgICAgfVxuICAgICAgYWNjW2tdID0gYWNjW2tdIHx8IHt9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjY1trXVxuICB9LCBvYmopXG5cbiAgcmV0dXJuIG9ialxufVxuXG5leHBvcnQgY29uc3QgZGVsZXRlTmVzdGVkT2JqZWN0QnlLZXkgPSAob2JqOiBhbnksIGtleTogc3RyaW5nLCBpZ25vcmVOb25FeGlzdGluZzogYm9vbGVhbiA9IHRydWUpOiBhbnkgPT4ge1xuICBjb25zdCBrZXlzID0ga2V5LnNwbGl0KCcuJylcblxuICBrZXlzLnJlZHVjZSgoYWNjOiBhbnksIGssIGluZGV4KSA9PiB7XG4gICAgY29uc3QgYXJyYXlNYXRjaCA9IGsubWF0Y2goL14oW15cXFtdKylcXFsoXFxkKylcXF0kLylcblxuICAgIGlmIChhcnJheU1hdGNoKSB7XG4gICAgICBjb25zdCBhcnJheUtleSA9IGFycmF5TWF0Y2hbMV1cbiAgICAgIGNvbnN0IGFycmF5SW5kZXggPSBwYXJzZUludChhcnJheU1hdGNoWzJdLCAxMClcblxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFjY1thcnJheUtleV0pICYmICFpZ25vcmVOb25FeGlzdGluZykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBDYW5ub3QgZGVsZXRlIHByb3BlcnR5ICcke2FycmF5S2V5fVske2FycmF5SW5kZXh9XScgb24gbm9uLWFycmF5IHR5cGUgYXQgcGF0aCAnJHtrZXlzLnNsaWNlKDAsIGluZGV4ICsgMSkuam9pbignLicpfSdgKVxuICAgICAgfVxuXG4gICAgICBpZiAoaW5kZXggPT09IGtleXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAvLyBMYXN0IGVsZW1lbnQgaW4gcGF0aDogZGVsZXRlIGFycmF5IGl0ZW1cbiAgICAgICAgaWYgKGFycmF5SW5kZXggPj0gYWNjW2FycmF5S2V5XS5sZW5ndGggJiYgIWlnbm9yZU5vbkV4aXN0aW5nKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEFycmF5ICcke2FycmF5S2V5fScgZG9lcyBub3QgaGF2ZSBpbmRleCAke2FycmF5SW5kZXh9IGF0IHBhdGggJyR7a2V5cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKX0nYClcbiAgICAgICAgfVxuICAgICAgICBhY2NbYXJyYXlLZXldLnNwbGljZShhcnJheUluZGV4LCAxKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWNjID0gYWNjW2FycmF5S2V5XVthcnJheUluZGV4XVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaW5kZXggPT09IGtleXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAvLyBMYXN0IGVsZW1lbnQgaW4gcGF0aDogZGVsZXRlIG9iamVjdCBrZXlcbiAgICAgICAgaWYgKGFjYyAmJiBhY2MuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICBkZWxldGUgYWNjW2tdXG4gICAgICAgIH0gZWxzZSBpZighaWdub3JlTm9uRXhpc3RpbmcpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBkZWxldGUgbm9uLWV4aXN0ZW50IHByb3BlcnR5ICcke2t9JyBhdCBwYXRoICcke2tleXMuc2xpY2UoMCwgaW5kZXggKyAxKS5qb2luKCcuJyl9J2ApXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRyYXZlcnNlIHRoZSBvYmplY3QsIGVuc3VyaW5nIHdlIGRvbid0IHRyeSB0byBhY2Nlc3MgYSBub24tb2JqZWN0XG4gICAgICAgIGlmKGlnbm9yZU5vbkV4aXN0aW5nKSB7XG4gICAgICAgICAgaWYgKCFhY2Nba10gfHwgdHlwZW9mIGFjY1trXSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBhY2NcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpZ25vcmVOb25FeGlzdGluZyAmJiAoIWFjY1trXSB8fCB0eXBlb2YgYWNjW2tdICE9PSAnb2JqZWN0JykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBDYW5ub3QgZGVsZXRlIHByb3BlcnR5ICcke2t9JyBvbiBub24tb2JqZWN0IHR5cGUgYXQgcGF0aCAnJHtrZXlzLnNsaWNlKDAsIGluZGV4ICsgMSkuam9pbignLicpfSdgKVxuICAgICAgICB9XG4gICAgICAgIGFjYyA9IGFjY1trXVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBhY2NcbiAgfSwgb2JqKVxuXG4gIHJldHVybiBvYmpcbn1cblxudHlwZSBBbnlPYmplY3QgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+XG5cbmV4cG9ydCBjb25zdCBkZWVwU2VhcmNoS2V5ID0gKFxuICBvYmo6IEFueU9iamVjdCxcbiAgdGFyZ2V0S2V5OiBzdHJpbmcsXG4gIHJldHVybkFsbDogYm9vbGVhbiA9IGZhbHNlXG4pOiBhbnlbXSB8IGFueSA9PiB7XG4gIGNvbnN0IHJlc3VsdHM6IGFueVtdID0gW11cbiAgbGV0IGZpcnN0UmVzdWx0OiBhbnkgPSBudWxsXG5cbiAgY29uc3Qgc2VhcmNoID0gKGN1cnJlbnRPYmo6IEFueU9iamVjdCkgPT4ge1xuICAgIGlmICghcmV0dXJuQWxsICYmIGZpcnN0UmVzdWx0ICE9PSBudWxsKSByZXR1cm5cbiAgICBpZiAodHlwZW9mIGN1cnJlbnRPYmogIT09ICdvYmplY3QnIHx8IGN1cnJlbnRPYmogPT09IG51bGwpIHJldHVyblxuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gY3VycmVudE9iaikge1xuICAgICAgaWYgKGtleSA9PT0gdGFyZ2V0S2V5KSB7XG4gICAgICAgIGlmIChyZXR1cm5BbGwpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goY3VycmVudE9ialtrZXldKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZpcnN0UmVzdWx0ID0gY3VycmVudE9ialtrZXldXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlYXJjaChjdXJyZW50T2JqW2tleV0pXG4gICAgfVxuICB9XG5cbiAgc2VhcmNoKG9iailcbiAgcmV0dXJuIHJldHVybkFsbCA/IHJlc3VsdHMgOiBmaXJzdFJlc3VsdFxufVxuXG5leHBvcnQgY29uc3QgY2hlY2tTYW1lU3RydWN0dXJlID0gKFxuICBiYXNlT2JqOiBBbnlPYmplY3QsXG4gIGNvbXBhcmVPYmo6IEFueU9iamVjdFxuKTogYm9vbGVhbiA9PiB7XG4gIGlmICh0eXBlb2YgYmFzZU9iaiAhPT0gJ29iamVjdCcgfHwgYmFzZU9iaiA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0eXBlb2YgYmFzZU9iaiA9PT0gdHlwZW9mIGNvbXBhcmVPYmpcbiAgfVxuICBpZiAodHlwZW9mIGNvbXBhcmVPYmogIT09ICdvYmplY3QnIHx8IGNvbXBhcmVPYmogPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBpbiBiYXNlT2JqKSB7XG4gICAgaWYgKCEoa2V5IGluIGNvbXBhcmVPYmopKSByZXR1cm4gZmFsc2VcbiAgICBpZiAoIWNoZWNrU2FtZVN0cnVjdHVyZShiYXNlT2JqW2tleV0sIGNvbXBhcmVPYmpba2V5XSkpIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbmV4cG9ydCBjb25zdCBPYmplY3RIZWxwZXJzID0ge1xuICBmaWx0ZXJPYmplY3RLZXlzLFxuICBjaGVja09iak1hdGNoLFxuICBjaGVja0lzRXF1YWwsXG4gIGluaXRDbGFzc0RhdGEsXG4gIGRlZmluZVByb3BlcnR5LFxuICBpc09iamVjdCxcbiAgZGVlcE1lcmdlT2JqZWN0LFxuICBnZXROZXN0ZWRPYmplY3RCeUtleSxcbiAgc2V0TmVzdGVkT2JqZWN0QnlLZXksXG4gIGRlbGV0ZU5lc3RlZE9iamVjdEJ5S2V5LFxuICBkZWVwU2VhcmNoS2V5XG59IiwiaW1wb3J0IHsgY2hlY2tPYmpNYXRjaCwgY2hlY2tJc0VxdWFsIH0gZnJvbSAnLi9PYmplY3RIZWxwZXJzJ1xuaW1wb3J0IHsgcmVtYXBBcnJheVRvTG93ZXJDYXNlSWZTdHJpbmcgfSBmcm9tICcuL1V0aWwnXG5cbmV4cG9ydCBjb25zdCBmaW5kQnlPYmogPSAoYXJyOiBhbnlbXSwgb2JqOiBhbnksIGFzQm9vbGVhbjogYm9vbGVhbiA9IGZhbHNlKTogYW55ID0+IHtcbiAgZm9yKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XG4gICAgaWYoIWNoZWNrT2JqTWF0Y2goaXRlbSwgb2JqKSkgY29udGludWVcbiAgICByZXR1cm4gYXNCb29sZWFuID8gdHJ1ZSA6IGl0ZW1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZXhwb3J0IGNvbnN0IGZpbmRCeVN0cmluZyA9IChhcnI6IGFueVtdLCBpdGVtOiBhbnksIGFzQm9vbGVhbjogYm9vbGVhbiA9IGZhbHNlKTogYW55ID0+IHtcbiAgZm9yKGNvbnN0IGFyckl0ZW0gb2YgYXJyKSB7XG4gICAgaWYodHlwZW9mKGFyckl0ZW0pID09PSAnc3RyaW5nJyAmJiB0eXBlb2YoaXRlbSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZihhcnJJdGVtLnRvTG93ZXJDYXNlKCkgPT0gaXRlbS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gYXNCb29sZWFuID8gdHJ1ZSA6IGFyckl0ZW1cbiAgICB9IFxuXG4gICAgaWYoYXJySXRlbSA9PSBpdGVtKSB7XG4gICAgICByZXR1cm4gYXNCb29sZWFuID8gdHJ1ZSA6IGFyckl0ZW1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmV4cG9ydCBjb25zdCBmaW5kID0gKGFycjogYW55W10sIHF1ZXJ5OiBhbnksIGFzQm9vbGVhbjogYm9vbGVhbiA9IGZhbHNlKTogYW55ID0+IHtcbiAgaWYoQXJyYXkuaXNBcnJheShxdWVyeSkgKSByZXR1cm4gZmFsc2VcbiAgaWYodHlwZW9mKHF1ZXJ5KSA9PT0gJ29iamVjdCcpIHJldHVybiBmaW5kQnlPYmooYXJyLCBxdWVyeSwgYXNCb29sZWFuKVxuICByZXR1cm4gZmluZEJ5U3RyaW5nKGFyciwgcXVlcnksIGFzQm9vbGVhbilcbn1cblxuZXhwb3J0IGNvbnN0IGZpbmRJbmRleCA9IChhcnI6IGFueVtdLCBxdWVyeTogYW55KTogbnVtYmVyID0+IHtcbiAgaWYodHlwZW9mKHF1ZXJ5KSA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCBmaW5kZWRCeU9iaiA9IGZpbmRCeU9iaihhcnIsIHF1ZXJ5KVxuICAgIHJldHVybiBmaW5kZWRCeU9iaiAhPSBmYWxzZSA/IGFyci5pbmRleE9mKGZpbmRlZEJ5T2JqKSA6IC0xIFxuICB9XG4gIGNvbnN0IGZpbmRlZEJ5U3RyaW5nID0gZmluZEJ5U3RyaW5nKGFyciwgcXVlcnkpXG4gIHJldHVybiBmaW5kZWRCeVN0cmluZyAhPT0gZmFsc2UgPyBhcnIuaW5kZXhPZihmaW5kZWRCeVN0cmluZykgOiAtMSAgXG59XG5cbmV4cG9ydCBjb25zdCBmaW5kQWxsID0gKGFycjogYW55W10sIHF1ZXJ5OiBhbnksIGlnbm9yZUVtcHR5QXJyYXk6IGJvb2xlYW4gPSBmYWxzZSk6IGFueVtdID0+IHtcbiAgaWYgKCFxdWVyeSkgcmV0dXJuIGFyclxuICByZXR1cm4gYXJyLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgIGNvbnN0IGl0ZW1Ub01hdGNoID0gdHlwZW9mKGl0ZW0pID09PSAnc3RyaW5nJyA/IGl0ZW0udG9Mb3dlckNhc2UoKSA6IGl0ZW1cbiAgICBpZih0eXBlb2YocXVlcnkpID09ICdzdHJpbmcnKSByZXR1cm4gY2hlY2tJc0VxdWFsKGl0ZW0sIHF1ZXJ5KVxuICAgIGlmKEFycmF5LmlzQXJyYXkocXVlcnkpKSByZXR1cm4gcmVtYXBBcnJheVRvTG93ZXJDYXNlSWZTdHJpbmcocXVlcnkpLmluY2x1ZGVzKGl0ZW1Ub01hdGNoKSA/IHRydWUgOiBmYWxzZVxuICAgIHJldHVybiBjaGVja09iak1hdGNoKGl0ZW0sIHF1ZXJ5LCAhaWdub3JlRW1wdHlBcnJheSkgPyB0cnVlIDogZmFsc2VcbiAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHJlbW92ZUFsbCA9IChhcnI6IGFueVtdLCBxdWVyeTogYW55LCBpZ25vcmVFbXB0eUFycmF5OiBib29sZWFuID0gdHJ1ZSk6IGFueVtdID0+IHtcbiAgaWYgKCFxdWVyeSkgcmV0dXJuIGFyclxuICByZXR1cm4gYXJyLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgIGNvbnN0IGl0ZW1Ub01hdGNoID0gdHlwZW9mKGl0ZW0pID09PSAnc3RyaW5nJyA/IGl0ZW0udG9Mb3dlckNhc2UoKSA6IGl0ZW1cbiAgICBpZih0eXBlb2YocXVlcnkpID09PSAnc3RyaW5nJykgcmV0dXJuICFjaGVja0lzRXF1YWwoaXRlbSwgcXVlcnkpXG4gICAgaWYoQXJyYXkuaXNBcnJheShxdWVyeSkpIHJldHVybiByZW1hcEFycmF5VG9Mb3dlckNhc2VJZlN0cmluZyhxdWVyeSkuaW5jbHVkZXMoaXRlbVRvTWF0Y2gpID8gZmFsc2UgOiB0cnVlXG4gICAgcmV0dXJuIGNoZWNrT2JqTWF0Y2goaXRlbSwgcXVlcnksIGlnbm9yZUVtcHR5QXJyYXkpID8gZmFsc2UgOiB0cnVlXG4gIH0pXG59XG5cbmV4cG9ydCBjb25zdCByZW1vdmUgPSAoYXJyOiBhbnlbXSwgcXVlcnk6IGFueSA9IG51bGwpOiBhbnkgPT4ge1xuICBpZiAoIXF1ZXJ5KSByZXR1cm4gYXJyXG4gIGNvbnN0IGluZGV4ID0gZmluZEluZGV4KGFyciwgcXVlcnkpXG4gIGlmKGluZGV4ID4gLTEpIGFyci5zcGxpY2UoaW5kZXgsIDEpXG4gIHJldHVybiBhcnJcbn1cblxuZXhwb3J0IGNvbnN0IHVuaXF1ZUJ5S2V5ID0gKGFycjogYW55W10sIHF1ZXJ5OiBhbnkgPSBudWxsKTogYW55W10gPT4ge1xuICBjb25zdCB1bmlxdWVJdGVtcyA9IFtdXG4gIGZvcihjb25zdCBpdGVtIG9mIGFycikge1xuICAgIGxldCBzZWFyY2hcbiAgICBpZighcXVlcnkpIHtcbiAgICAgIHNlYXJjaCA9IGl0ZW1cbiAgICB9IGVsc2UgaWYodHlwZW9mKHF1ZXJ5KSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHNlYXJjaCA9IHsgW3F1ZXJ5XTogaXRlbVtxdWVyeV0gfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWFyY2ggPSBxdWVyeVxuICAgIH1cbiAgICBjb25zdCBmaW5kZWQgPSBmaW5kKHVuaXF1ZUl0ZW1zLCBzZWFyY2gpXG4gICAgaWYoIWZpbmRlZCkgdW5pcXVlSXRlbXMucHVzaChpdGVtKVxuICB9XG4gIHJldHVybiB1bmlxdWVJdGVtc1xufVxuXG5leHBvcnQgY29uc3Qgb2JqQXJyYXlUb0NzdiA9IChhcnI6IGFueVtdLCBkZWxpbWl0ZXI6IHN0cmluZyA9ICcsJyk6IHN0cmluZyA9PiB7XG4gIGlmKCFBcnJheS5pc0FycmF5KGFycikgfHwgdHlwZW9mKGFyclswXSkgIT0gJ29iamVjdCcpIHRocm93IG5ldyBFcnJvcihgRmlyc3QgcGFyYW1ldGVyIG11c3QgYmUgYW4gYXJyYXkgb2Ygb2JqZWN0c2ApXG4gIGNvbnN0IGhlYWRlciA9IE9iamVjdC5rZXlzKGFyclswXSlcblx0cmV0dXJuIFtoZWFkZXIuam9pbihkZWxpbWl0ZXIpICwgYXJyLm1hcChyb3cgPT4gaGVhZGVyLm1hcChrZXkgPT4gcm93W2tleV0pLmpvaW4oZGVsaW1pdGVyKSkuam9pbihcIlxcblwiKV0uam9pbihcIlxcblwiKVxufVxuXG5leHBvcnQgY29uc3QgdG9nZ2xlSW5BcnJheSA9IChhcnI6IGFueVtdLCBvYmo6IGFueSk6IGFueVtdID0+IHtcbiAgY29uc3QgZmluZGVkID0gZmluZEluZGV4KGFyciwgb2JqKVxuICBpZihmaW5kZWQgPiAtMSkge1xuICAgIGFyci5zcGxpY2UoZmluZGVkLCAxKVxuICB9IGVsc2Uge1xuICAgIGFyci5wdXNoKG9iailcbiAgfVxuICByZXR1cm4gYXJyXG59XG5cbmV4cG9ydCBjb25zdCBjb21wYXJlQXJyYXkgPSAoYXJyRnJvbTogYW55W10sIGFyclRvQ29tcGFyZTogYW55W10sIGtleTogc3RyaW5nID0gbnVsbCk6IGJvb2xlYW4gPT4ge1xuICBpZihhcnJGcm9tLmxlbmd0aCAhPT0gYXJyVG9Db21wYXJlLmxlbmd0aCkgcmV0dXJuIGZhbHNlXG4gIGZvcihjb25zdCBpdGVtIG9mIGFyckZyb20pIHtcbiAgICBsZXQgc2VhcmNoXG4gICAgaWYodHlwZW9mKGl0ZW0pID09PSAnc3RyaW5nJykge1xuICAgICAgc2VhcmNoID0gaXRlbVxuICAgIH0gZWxzZSB7XG4gICAgICBpZih0eXBlb2Yoa2V5KSAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignVGhpcmQgcGFyYW1ldGVyIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgc2VhcmNoID17IFtrZXldOiBpdGVtW2tleV0gfVxuICAgIH1cbiAgICBjb25zdCBmaW5kZWQgPSBmaW5kKGFyclRvQ29tcGFyZSwgc2VhcmNoKVxuICAgIGlmKCFmaW5kZWQpIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbmV4cG9ydCBjb25zdCBzaHVmZmxlID0gKGFycmF5OiBhbnlbXSkgPT4ge1xuICBmb3IgKGxldCBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgIGNvbnN0IGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKSBhcyBudW1iZXJcbiAgICBbYXJyYXlbaV0sIGFycmF5W2pdXSA9IFthcnJheVtqXSwgYXJyYXlbaV1dXG4gIH1cbiAgcmV0dXJuIGFycmF5XG59XG5cbmV4cG9ydCBjb25zdCBnZXRSYW5kb21FbGVtZW50ID0gKGxpc3Q6IGFueVtdKTogYW55ID0+IGxpc3RbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGlzdC5sZW5ndGgpXVxuXG5leHBvcnQgY29uc3QgQXJyYXlIZWxwZXJzID0ge1xuICBmaW5kQnlPYmosXG4gIGZpbmRCeVN0cmluZyxcbiAgZmluZCxcbiAgZmluZEluZGV4LFxuICBmaW5kQWxsLFxuICByZW1vdmVBbGwsXG4gIHJlbW92ZSxcbiAgdW5pcXVlQnlLZXksXG4gIG9iakFycmF5VG9Dc3YsXG4gIHRvZ2dsZUluQXJyYXksXG4gIGNvbXBhcmVBcnJheSxcbiAgc2h1ZmZsZSxcbiAgZ2V0UmFuZG9tRWxlbWVudFxufVxuXG4iLCJcbi8qKlxuICogXG4gKiBnZXQgYW1vdW50IG9mIGEgZ2l2ZW4gJSBvZiBhIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBbW91bnRPZlBlcmNlbnRhZ2UgPSAoYW1vdW50OiBudW1iZXIsIHBlcmNlbnRhZ2U6IG51bWJlciB8IHN0cmluZykgPT4ge1xuICBjb25zdCBwY3QgPSBnZXRQYXJzZWRWYWx1ZShwZXJjZW50YWdlKVxuICBjb25zdCBhbXQgPSBnZXRQYXJzZWRWYWx1ZShhbW91bnQpXG4gIHJldHVybiBOdW1iZXIoYW10IC8gMTAwICogcGN0KVxufVxuXG4vKipcbiAqIFxuICogZ2V0IHRoZSAlIG9mIGEgZ2l2ZW4gYW1vdW50IGFuZCB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZ2V0UGVyY2VudGFnZU9mQW1vdW50ID0gKGFtb3VudDogbnVtYmVyLCB2YWx1ZTogbnVtYmVyLCBwZXJjZW50YWdlU2lnbjogYm9vbGVhbiA9IGZhbHNlLCBkaWdpdHM6bnVtYmVyID0gMik6IG51bWJlciB8IHN0cmluZyA9PiB7XG4gIGNvbnN0IGFtdCA9IGdldFBhcnNlZFZhbHVlKGFtb3VudClcbiAgY29uc3QgcmVzdWx0ID0gTnVtYmVyKDEwMCAvIGFtdCAqIHZhbHVlKVxuICBpZighcGVyY2VudGFnZVNpZ24pIHJldHVybiByZXN1bHRcbiAgaWYoaXNOYU4oTnVtYmVyKCByZXN1bHQgLyAxMDAgKSkpIHJldHVybiBOdW1iZXIocmVzdWx0LzEwMClcbiAgcmV0dXJuIE51bWJlciggcmVzdWx0IC8gMTAwICkudG9Mb2NhbGVTdHJpbmcodW5kZWZpbmVkLCB7IHN0eWxlOiAncGVyY2VudCcsIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogZGlnaXRzIH0pXG59XG5cbmV4cG9ydCBjb25zdCByb3VuZCA9ICh2YWx1ZTogbnVtYmVyLCBkZWNpbWFsczogbnVtYmVyID0gMikgPT4ge1xuICBjb25zdCB2bCA9IGdldFBhcnNlZFZhbHVlKHZhbHVlKVxuICB2YXIgcCA9IE1hdGgucG93KDEwLCBkZWNpbWFscylcbiAgcmV0dXJuIE1hdGgucm91bmQodmwgKiBwKSAvIHBcbn1cblxuZXhwb3J0IGNvbnN0IHJhbmRvbUludCA9IChtYXg6IG51bWJlciwgbWluOiBudW1iZXIgPSAwKSA9PiB7XG4gIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKChtYXggLSBtaW4pICogTWF0aC5yYW5kb20oKSk7XG59XG5cbi8qKlxuICogYWRkIGEgcmF3IHBlcmNlbnRhZ2UgdmFsdWUgdG8gYSBudW1iZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGFkZFBlcmNlbnRhZ2UgPSAodmFsdWU6IG51bWJlciwgcGVyY2VudGFnZTogc3RyaW5nIHwgbnVtYmVyKSA9PiB7XG4gIGNvbnN0IHBjdCA9IGdldFBhcnNlZFZhbHVlKHBlcmNlbnRhZ2UpXG4gIGNvbnN0IHZsID0gZ2V0UGFyc2VkVmFsdWUodmFsdWUpXG4gIHJldHVybiB2bCAqICgxICsgKHBjdCAvIDEwMCkpXG59XG5cbi8qKlxuICogXG4gKiByZXR1cm5zIGEgbWluIHZhbHVlIHVzaW5nIGEgcGVyY2VudGFnZSBhcyByZWZlcmVuY2VzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRWYWx1ZU9yTWluUGVyY2VudGFnZSA9IChhbW91bnQ6IG51bWJlciwgdmFsdWU6IG51bWJlciwgcGVyY2VudGFnZTogbnVtYmVyID0gMTApID0+IHtcbiAgY29uc3QgYW10ID0gZ2V0UGFyc2VkVmFsdWUoYW1vdW50KVxuICBjb25zdCB2bCA9IGdldFBhcnNlZFZhbHVlKHZhbHVlKVxuICBjb25zdCBwY3QgPSBnZXRQYXJzZWRWYWx1ZShwZXJjZW50YWdlKVxuICBpZigoYW10IC8gMTAwICogcGN0KSA+IHZsKSByZXR1cm4gZ2V0QW1vdW50T2ZQZXJjZW50YWdlKGFtdCwgcGN0KVxuICByZXR1cm4gdmxcbn1cblxuY29uc3QgZ2V0UGFyc2VkVmFsdWUgPSAodmFsdWU6IG51bWJlciB8IHN0cmluZyk6IG51bWJlciA9PiB7XG4gIHJldHVybiB0eXBlb2YodmFsdWUpID09PSAnbnVtYmVyJyA/IHZhbHVlIDogcGFyc2VGbG9hdCh2YWx1ZSlcbn1cblxuZXhwb3J0IGNvbnN0IE1hdGhIZWxwZXJzID0ge1xuICBnZXRBbW91bnRPZlBlcmNlbnRhZ2UsXG4gIGdldFBlcmNlbnRhZ2VPZkFtb3VudCxcbiAgcm91bmQsXG4gIHJhbmRvbUludCxcbiAgYWRkUGVyY2VudGFnZSxcbiAgZ2V0VmFsdWVPck1pblBlcmNlbnRhZ2Vcbn0iLCJcbmV4cG9ydCBjb25zdCBkb3dubG9hZFJhd0RhdGEgPSAoZGF0YTogc3RyaW5nLCBmaWxlTmFtZTpzdHJpbmcgPSAnZmlsZS50eHQnKTogdm9pZCA9PiB7XG4gIGlmKCF3aW5kb3cpIHRocm93IG5ldyBFcnJvcihgTWV0aG9kIGRvd25sb2FkUmF3RGF0YSBtdXN0IHJ1biBpbiBcIndpbmRvd1wiIGNvbnRleHQuYClcbiAgY29uc3QgYmxvYiA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtkYXRhXSkpXG5cdGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcblx0bGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBibG9iKVxuXHRsaW5rLnNldEF0dHJpYnV0ZSgnZG93bmxvYWQnLCBmaWxlTmFtZSlcblx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKVxuXHRsaW5rLmNsaWNrKClcblx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKVxufVxuXG5leHBvcnQgY29uc3QgY29weVRvQ2xpcGJvYXJkID0gKHN0cmluZzogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGlmKG5hdmlnYXRvci5jbGlwYm9hcmQpIHtcbiAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChzdHJpbmcpXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZHVtbXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIilcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGR1bW15KVxuICAgIGR1bW15LnZhbHVlID0gc3RyaW5nXG4gICAgZHVtbXkuc2VsZWN0KClcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIilcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGR1bW15KVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBnZXRMZXR0ZXJCeU51bWJlciA9IChudW1iZXI6IG51bWJlcik6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHN0cmluZyA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eidcbiAgaWYoc3RyaW5nLmxlbmd0aC0xIDwgbnVtYmVyKSByZXR1cm4gJy0tJ1xuICByZXR1cm4gc3RyaW5nW251bWJlcl1cbn1cblxuZXhwb3J0IGNvbnN0IHJlbW92ZUFsbENvb2tpZXMgPSAoKTogdm9pZCA9PiB7XG4gIGlmKGRvY3VtZW50KSB7XG4gICAgY29uc3QgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY29va2llID0gY29va2llc1tpXTtcbiAgICAgIGNvbnN0IGVxUG9zID0gY29va2llLmluZGV4T2YoJz0nKTtcbiAgICAgIGNvbnN0IG5hbWUgPSBlcVBvcyA+IC0xID8gY29va2llLnN1YnN0cigwLCBlcVBvcykgOiBjb29raWU7XG4gICAgICBjb25zdCBwYXRoID0gJy8nO1xuICAgICAgZG9jdW1lbnQuY29va2llID0gbmFtZSArICc9O2V4cGlyZXM9VGh1LCAwMSBKYW4gMTk3MCAwMDowMDowMCBHTVQ7cGF0aD0nICsgcGF0aDtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNsZWFyQnJvd3NlckNhY2hlID0gKHJlbW92ZUNvb2tpZXM6IGJvb2xlYW4gPSB0cnVlKSA9PiB7XG4gIGxvY2FsU3RvcmFnZS5jbGVhcigpXG4gIHNlc3Npb25TdG9yYWdlLmNsZWFyKClcbiAgaWYocmVtb3ZlQ29va2llcykge1xuICAgIHJlbW92ZUFsbENvb2tpZXMoKVxuICB9XG59XG5cblxuZXhwb3J0IGNvbnN0IGNsZWFyQnJvd3NlckNhY2hlTGlzdGVuZXIgPSAoaG90S2V5OiBzdHJpbmcgPSAnS2V5WCcsIHJlbW92ZUNvb2tpZXM6IGJvb2xlYW4gPSB0cnVlLCBjYjogRnVuY3Rpb24gfCBudWxsID0gbnVsbCk6IHZvaWQgPT4ge1xuICBpZihkb2N1bWVudCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQuYWx0S2V5ICYmIGV2ZW50LmNvZGUgPT09IGhvdEtleSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGNsZWFyQnJvd3NlckNhY2hlKHJlbW92ZUNvb2tpZXMpXG4gICAgICAgIGlmKGNiKSB7XG4gICAgICAgICAgY2IoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQ29tbW9uSGVscGVycyA9IHtcbiAgZG93bmxvYWRSYXdEYXRhLFxuICBjb3B5VG9DbGlwYm9hcmQsXG4gIGdldExldHRlckJ5TnVtYmVyLFxuICBjbGVhckJyb3dzZXJDYWNoZSxcbiAgY2xlYXJCcm93c2VyQ2FjaGVMaXN0ZW5lcixcbiAgcmVtb3ZlQWxsQ29va2llc1xufSIsImV4cG9ydCBpbnRlcmZhY2UgTnVtYmVyRm9ybWF0T3B0aW9ucyB7XG4gIHByZWZpeDogc3RyaW5nXG4gIHN1ZmZpeDogc3RyaW5nXG4gIGRlY2ltYWw6IHN0cmluZ1xuICB0aG91c2FuZDogc3RyaW5nXG4gIHByZWNpc2lvbjogbnVtYmVyXG4gIGFjY2VwdE5lZ2F0aXZlOiBib29sZWFuXG4gIGlzSW50ZWdlcjogYm9vbGVhblxuICB2dWVWZXJzaW9uPzogc3RyaW5nXG59XG5cbmNvbnN0IGRlZmF1bHRPcHRpb25zOiBOdW1iZXJGb3JtYXRPcHRpb25zID0ge1xuICBwcmVmaXg6ICdVUyQgJyxcbiAgc3VmZml4OiAnJyxcbiAgZGVjaW1hbDogJy4nLFxuICB0aG91c2FuZDogJywnLFxuICBwcmVjaXNpb246IDIsXG4gIGFjY2VwdE5lZ2F0aXZlOiB0cnVlLFxuICBpc0ludGVnZXI6IGZhbHNlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmF1bHRPcHRpb25zIiwiLypcbiAqIGlnb3J0cmluaWRhZC92dWUtbnVtYmVyLWZvcm1hdFxuICpcbiAqIChjKSBJZ29yIFRyaW5kYWRlIDxpZ29ydHJpbmRhZGUubWVAZ21haWwuY29tPlxuICogXG4gKiBNb3N0bHkgb2YgdGhpcyBmaWxlIGNvbnRlbnQgd2FzIGV4dHJhY3RlZCBmcm9tIHRoZSBodHRwczovL2dpdGh1Yi5jb20vbWFpY285MTAvdnVlLW51bWJlci1mb3JtYXQvYmxvYi92aXRlLXR5cGVzY3JpcHQtcmVmYWN0b3Ivc3JjL3V0aWxzLnRzXG4gKlxuICogRm9yIHRoZSBmdWxsIGNvcHlyaWdodCBhbmQgbGljZW5zZSBpbmZvcm1hdGlvbiwgcGxlYXNlIHZpZXcgdGhlIExJQ0VOU0VcbiAqIGZpbGUgdGhhdCB3YXMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHNvdXJjZSBjb2RlLlxuICovXG5cbmltcG9ydCBkZWZhdWx0T3B0aW9ucywgeyB0eXBlIE51bWJlckZvcm1hdE9wdGlvbnMgfSBmcm9tICcuL3R5cGVzL051bWJlckZvcm1hdE9wdGlvbnMnXG5cbmV4cG9ydCBjb25zdCBmb3JtYXROdW1iZXIgPSAoaW5wdXQ6IHN0cmluZyB8IG51bWJlciB8IG51bGwgPSAnMCcsIG9wdDogUGFydGlhbDxOdW1iZXJGb3JtYXRPcHRpb25zPiA9IHt9KSA9PiB7XG4gIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSB7Li4uZGVmYXVsdE9wdGlvbnMsIC4uLm9wdH07XG5cbiAgbGV0IGlucHV0SW5TdHJpbmc7XG5cbiAgaWYgKCEhaW5wdXQpIHtcbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnbnVtYmVyJyAmJiAhbWVyZ2VkT3B0aW9ucy5pc0ludGVnZXIpIHtcbiAgICAgIGlucHV0SW5TdHJpbmcgPSBpbnB1dC50b0ZpeGVkKGZpeGVkKG1lcmdlZE9wdGlvbnMucHJlY2lzaW9uKSlcbiAgICB9IGVsc2Uge1xuICAgICAgaW5wdXRJblN0cmluZyA9IGlucHV0LnRvU3RyaW5nKClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaW5wdXRJblN0cmluZyA9ICcnXG4gIH1cblxuXG4gIGNvbnN0IG1pbnVzU3ltYm9sID0gaXNOZWdhdGl2ZShpbnB1dEluU3RyaW5nLCBtZXJnZWRPcHRpb25zLmFjY2VwdE5lZ2F0aXZlKSAgPyAnLScgOiAnJ1xuICBjb25zdCBudW1iZXJzID0gaW5wdXRPbmx5TnVtYmVycyhpbnB1dEluU3RyaW5nLnRvU3RyaW5nKCkpXG4gIGNvbnN0IGN1cnJlbmN5SW5TdHJpbmcgPSBudW1iZXJzVG9DdXJyZW5jeShudW1iZXJzLCBtZXJnZWRPcHRpb25zLnByZWNpc2lvbilcblxuICBjb25zdCBjdXJyZW5jeVBhcnRzID0gY3VycmVuY3lJblN0cmluZy5zcGxpdCgnLicpXG4gIGNvbnN0IGRlY2ltYWwgPSBjdXJyZW5jeVBhcnRzWzFdXG4gIGNvbnN0IGludGVnZXIgPSBhZGRUaG91c2FuZFNlcGFyYXRvcihjdXJyZW5jeVBhcnRzWzBdLCBtZXJnZWRPcHRpb25zLnRob3VzYW5kKVxuXG4gIHJldHVybiBtaW51c1N5bWJvbCArIG1lcmdlZE9wdGlvbnMucHJlZml4ICsgam9pbkludGVnZXJBbmREZWNpbWFsKGludGVnZXIsIGRlY2ltYWwsIG1lcmdlZE9wdGlvbnMuZGVjaW1hbCkgKyBtZXJnZWRPcHRpb25zLnN1ZmZpeFxufVxuXG5leHBvcnQgY29uc3QgdW5mb3JtYXROdW1iZXIgPSAoaW5wdXQ6IHN0cmluZyB8IG51bWJlciB8IG51bGwgPSAwLCBvcHQ6IFBhcnRpYWw8TnVtYmVyRm9ybWF0T3B0aW9ucz4gPSB7fSkgPT4ge1xuICBjb25zdCBtZXJnZWRPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdCk7XG5cbiAgY29uc3QgdXNlcklucHV0ID0gaW5wdXQgfHwgMDtcblxuICBjb25zdCBudW1iZXJzID0gaW5wdXRPbmx5TnVtYmVycyh1c2VySW5wdXQpXG5cbiAgaWYobWVyZ2VkT3B0aW9ucy5pc0ludGVnZXIpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQoYCR7aXNOZWdhdGl2ZSh1c2VySW5wdXQsIG1lcmdlZE9wdGlvbnMuYWNjZXB0TmVnYXRpdmUpID8gJy0nIDogJyd9JHtudW1iZXJzLnRvU3RyaW5nKCl9YClcbiAgfVxuXG4gIGNvbnN0IG1ha2VOdW1iZXJOZWdhdGl2ZSA9IChpc05lZ2F0aXZlKHVzZXJJbnB1dCwgbWVyZ2VkT3B0aW9ucy5hY2NlcHROZWdhdGl2ZSkpXG4gIGNvbnN0IGN1cnJlbmN5ID0gbnVtYmVyc1RvQ3VycmVuY3kobnVtYmVycywgbWVyZ2VkT3B0aW9ucy5wcmVjaXNpb24pXG4gIHJldHVybiBtYWtlTnVtYmVyTmVnYXRpdmUgPyBwYXJzZUZsb2F0KGN1cnJlbmN5KSAqIC0gMSA6IHBhcnNlRmxvYXQoY3VycmVuY3kpXG59XG5cbmZ1bmN0aW9uIGlucHV0T25seU51bWJlcnMgKGlucHV0OiBzdHJpbmcgfCBudW1iZXIgPSAwKSB7XG4gIHJldHVybiBpbnB1dCA/IGlucHV0LnRvU3RyaW5nKCkucmVwbGFjZSgvXFxEKy9nLCAnJykgOiAnMCdcbn1cblxuLy8gMTIzIFJhbmdlRXJyb3I6IHRvRml4ZWQoKSBkaWdpdHMgYXJndW1lbnQgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDIwIGF0IE51bWJlci50b0ZpeGVkXG5mdW5jdGlvbiBmaXhlZChwcmVjaXNpb246IG51bWJlcikge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4ocHJlY2lzaW9uLCAyMCkpXG59XG5cbmZ1bmN0aW9uIG51bWJlcnNUb0N1cnJlbmN5IChudW1iZXJzOiBzdHJpbmcsIHByZWNpc2lvbjogbnVtYmVyKSB7XG4gIGNvbnN0IGV4cCA9IE1hdGgucG93KDEwLCBwcmVjaXNpb24pXG4gIGNvbnN0IGZsb2F0ID0gcGFyc2VGbG9hdChudW1iZXJzKSAvIGV4cFxuICByZXR1cm4gZmxvYXQudG9GaXhlZChmaXhlZChwcmVjaXNpb24pKVxufVxuXG5mdW5jdGlvbiBhZGRUaG91c2FuZFNlcGFyYXRvciAoaW50ZWdlcjogc3RyaW5nLCBzZXBhcmF0b3I6IHN0cmluZykge1xuICByZXR1cm4gaW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PSg/OlxcZHszfSkrXFxiKS9nbSwgYCQxJHtzZXBhcmF0b3J9YClcbn1cblxuZnVuY3Rpb24gam9pbkludGVnZXJBbmREZWNpbWFsIChpbnRlZ2VyOiBzdHJpbmcsIGRlY2ltYWw6IHN0cmluZywgc2VwYXJhdG9yOiBzdHJpbmcpIHtcbiAgaWYgKGRlY2ltYWwpIHtcbiAgICByZXR1cm4gaW50ZWdlciArIHNlcGFyYXRvciArIGRlY2ltYWw7XG4gIH1cblxuICByZXR1cm4gaW50ZWdlcjtcbn1cblxuZnVuY3Rpb24gaXNOZWdhdGl2ZShzdHJpbmc6IG51bWJlciB8IHN0cmluZywgYWNjZXB0TmVnYXRpdmUgPSB0cnVlKSB7XG4gIGlmKCFhY2NlcHROZWdhdGl2ZSkgcmV0dXJuIGZhbHNlXG5cbiAgY29uc3QgdmFsdWUgPSBzdHJpbmcudG9TdHJpbmcoKTtcbiAgY29uc3QgaXNOZWdhdGl2ZSA9ICh2YWx1ZS5zdGFydHNXaXRoKCctJykgfHwgdmFsdWUuZW5kc1dpdGgoJy0nKSlcbiAgY29uc3QgZm9yY2VQb3NpdGl2ZSA9IHZhbHVlLmluZGV4T2YoJysnKSA+IDBcblxuICByZXR1cm4gaXNOZWdhdGl2ZSAmJiAhZm9yY2VQb3NpdGl2ZVxufVxuXG5leHBvcnQgY29uc3QgTnVtYmVyRm9ybWF0ID0ge1xuICBmb3JtYXROdW1iZXIsXG4gIHVuZm9ybWF0TnVtYmVyLFxufSIsIlxuaW50ZXJmYWNlIFVybEltYWdlIHtcbiAgdXJsOiBzdHJpbmdcbiAgdGl0bGU6IHN0cmluZ1xuICBjYXB0aW9uOiBzdHJpbmdcbn1cblxudHlwZSBDaGFuZ2VGcmVxcyA9ICdhbHdheXMnIHwgJ2hvdXJseScgfCAnZGFpbHknIHwgJ3dlZWtseScgfCAnbW9udGhseScgfCAnYW51YWwnIHwgJ25ldmVyJ1xuXG5pbnRlcmZhY2UgVXJsSXRlbUludGVyZmFjZSB7XG4gIHVybDogc3RyaW5nXG4gIGxhc3RNb2RpZmllZD86IHN0cmluZ1xuICBjaGFuZ2VGcmVxPzogQ2hhbmdlRnJlcXNcbiAgcHJpb3JpdHk/OiBzdHJpbmdcbiAgaW1hZ2U/OiBVcmxJbWFnZVxufVxuXG5leHBvcnQgY2xhc3MgVXJsSXRlbSB7XG5cbiAgdXJsOiBzdHJpbmdcbiAgbGFzdE1vZGlmaWVkOiBzdHJpbmcgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsMTApXG4gIGNoYW5nZUZyZXE6IENoYW5nZUZyZXFzID0gJ21vbnRobHknXG4gIHByaW9yaXR5OiBzdHJpbmcgPSAnMS4wJ1xuICBpbWFnZT86IFVybEltYWdlID0gbnVsbFxuXG4gIGNvbnN0cnVjdG9yKHVybEl0ZW06IFVybEl0ZW1JbnRlcmZhY2Upe1xuICAgIGlmKCF1cmxJdGVtLnVybCkgdGhyb3cgbmV3IEVycm9yKCdVcmwgaXMgcmVxdWlyZWQnKVxuICAgIHRoaXMudXJsID0gdGhpcy5yZW1vdmVGaXJzdFNsYXNoRnJvbVVybCh1cmxJdGVtLnVybClcbiAgICBpZih1cmxJdGVtLmxhc3RNb2RpZmllZCApIHRoaXMubGFzdE1vZGlmaWVkID0gdXJsSXRlbS5sYXN0TW9kaWZpZWRcbiAgICBpZih1cmxJdGVtLmNoYW5nZUZyZXEgKSB0aGlzLmNoYW5nZUZyZXEgPSB1cmxJdGVtLmNoYW5nZUZyZXFcbiAgICBpZih1cmxJdGVtLnByaW9yaXR5ICkgdGhpcy5wcmlvcml0eSA9IHVybEl0ZW0ucHJpb3JpdHlcbiAgICBpZih1cmxJdGVtLmltYWdlICkgdGhpcy5pbWFnZSA9IHVybEl0ZW0uaW1hZ2VcbiAgfVxuXG4gIHJlbW92ZUZpcnN0U2xhc2hGcm9tVXJsKHVybDogc3RyaW5nKSB7XG4gICAgaWYodXJsWzBdID09ICcvJykgcmV0dXJuIHVybC5zdWJzdHJpbmcoMSlcbiAgICByZXR1cm4gdXJsXG4gIH1cblxufVxuXG5leHBvcnQgY2xhc3MgU2l0ZU1hcEdlbmVyYXRvciB7XG5cbiAgYmFzZVVybDogc3RyaW5nID0gJydcbiAgaXRlbXM6IFVybEl0ZW1bXSA9IFtdXG4gIHhtbFN0eWxlc2hlZXRQYXRoOiBzdHJpbmcgPSAnJ1xuXG4gIGNvbnN0cnVjdG9yKGJhc2VVcmw6IHN0cmluZykge1xuICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmxcbiAgICB0aGlzLml0ZW1zID0gW11cbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGdldEhlYWRlciAoKSB7XG5jb25zdCBoZWFkZXIgPSBcbmBcbiR7IHRoaXMueG1sU3R5bGVzaGVldFBhdGggPyBgPD94bWwtc3R5bGVzaGVldCBocmVmPVwiJHsgdGhpcy54bWxTdHlsZXNoZWV0UGF0aCB9XCIgdHlwZT1cInRleHQveHNsXCI/PmAgOiAnJyB9XG48dXJsc2V0IHhtbG5zPVwiaHR0cDovL3d3dy5zaXRlbWFwcy5vcmcvc2NoZW1hcy9zaXRlbWFwLzAuOVwiIHhtbG5zOnhodG1sPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiIHhtbG5zOmltYWdlPVwiaHR0cDovL3d3dy5nb29nbGUuY29tL3NjaGVtYXMvc2l0ZW1hcC1pbWFnZS8xLjFcIiB4bWxuczp2aWRlbz1cImh0dHA6Ly93d3cuZ29vZ2xlLmNvbS9zY2hlbWFzL3NpdGVtYXAtdmlkZW8vMS4xXCI+XG5gXG5yZXR1cm4gaGVhZGVyXG4gIH1cblxuICBwcml2YXRlIGdldCBnZXRCb2R5ICgpIHtcbiAgICByZXR1cm4gdGhpcy5pdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIHZhciBpdGVtUmVzdWx0ID0gIFxuYFxuICA8dXJsPlxuICAgIDxsb2M+JHsgdGhpcy5iYXNlVXJsIH0keyAoIWl0ZW0udXJsKSA/ICcnIDogYC8keyBpdGVtLnVybCB9YCB9PC9sb2M+XG4gICAgPHByaW9yaXR5PiR7aXRlbS5wcmlvcml0eX08L3ByaW9yaXR5PlxuICAgIDxsYXN0bW9kPiR7aXRlbS5sYXN0TW9kaWZpZWR9PC9sYXN0bW9kPlxuICAgIDxjaGFuZ2VmcmVxPiR7aXRlbS5jaGFuZ2VGcmVxfTwvY2hhbmdlZnJlcT5gXG5cbiAgICBpZihpdGVtLmltYWdlKSB7XG4gICAgICBcbiAgICAgIGl0ZW1SZXN1bHQgKz0gXG5gXG4gICAgICA8aW1hZ2U6aW1hZ2U+XG4gICAgICAgIDxpbWFnZTpsb2M+JHtpdGVtLmltYWdlLnVybH08L2ltYWdlOmxvYz5cbiAgICAgICAgPGltYWdlOmNhcHRpb24+JHtpdGVtLmltYWdlLmNhcHRpb259PC9pbWFnZTpjYXB0aW9uPlxuICAgICAgICA8aW1hZ2U6dGl0bGU+JHtpdGVtLmltYWdlLnRpdGxlfTwvaW1hZ2U6dGl0bGU+XG4gICAgICA8L2ltYWdlOmltYWdlPmBcbiAgICB9XG4gICAgaXRlbVJlc3VsdCArPSBcbmBcbiAgPC91cmw+XG5gXG5yZXR1cm4gaXRlbVJlc3VsdFxuICAgIFxuICB9KVxuICAuam9pbignJylcblxuICB9XG5cbiAgcHJpdmF0ZSBnZXQgZ2V0Rm9vdGVyICgpIHtcbiAgICByZXR1cm4gYDwvdXJsc2V0PmBcbiAgfVxuXG4gIHB1YmxpYyBzZXRYbWxTdHlsZVNoZWV0UGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLnhtbFN0eWxlc2hlZXRQYXRoID0gcGF0aFxuICB9XG5cbiAgcHVibGljIGFkZEl0ZW0odXJsSXRlbTogVXJsSXRlbUludGVyZmFjZSk6IHZvaWQge1xuICAgIHRoaXMuaXRlbXMucHVzaChuZXcgVXJsSXRlbSh1cmxJdGVtKSlcbiAgfVxuXG4gIHB1YmxpYyBnZW5lcmF0ZSgpOiBzdHJpbmd7XG4gICAgY29uc3QgcmVzdWx0ID0gXG5gXG4keyB0aGlzLmdldEhlYWRlciB9XG4keyB0aGlzLmdldEJvZHkgfVxuJHsgdGhpcy5nZXRGb290ZXIgfVxuYFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG59XG5cbiIsImV4cG9ydCBjb25zdCB0aXRsZUNhc2VTdHJpbmcgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICByZXR1cm4gc3RyLnRvU3RyaW5nKCkuc3BsaXQoJyAnKS5tYXAoKHN0cikgPT4gc3RyLnRvVXBwZXJDYXNlKCkuY2hhckF0KDApICsgc3RyLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpKS5qb2luKCcgJylcbn1cblxuZXhwb3J0IGNvbnN0IHJhbmRvbVN0cmluZyA9IChsZW5ndGg6IG51bWJlcik6IHN0cmluZyA9PiB7XG4gIHZhciByZXN1bHQgICAgICAgICAgID0gJydcbiAgdmFyIGNoYXJhY3RlcnMgICAgICAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODknXG4gIHZhciBjaGFyYWN0ZXJzTGVuZ3RoID0gY2hhcmFjdGVycy5sZW5ndGhcbiAgZm9yICggdmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgIHJlc3VsdCArPSBjaGFyYWN0ZXJzLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFyYWN0ZXJzTGVuZ3RoKSlcbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbmV4cG9ydCBjb25zdCBqb2luQ29tbWFQbHVzQW5kID0gKGE6IEFycmF5PGFueT4sIHVuaWZpZXJTdHJpbmcgPSAnIGFuZCAnKSA9PiB7XG4gIHJldHVybiBbYS5zbGljZSgwLCAtMSkuam9pbignLCAnKSwgYS5zbGljZSgtMSlbMF1dLmpvaW4oYS5sZW5ndGggPCAyID8gJycgOiB1bmlmaWVyU3RyaW5nKVxufVxuXG5mdW5jdGlvbiBsZXZlbnNodGVpbihhOiBzdHJpbmcsIGI6IHN0cmluZykge1xuICBjb25zdCBtYXRyaXggPSBbXVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDw9IGIubGVuZ3RoOyBpKyspIHtcbiAgICAgIG1hdHJpeFtpXSA9IFtpXVxuICB9XG5cbiAgZm9yIChsZXQgaiA9IDA7IGogPD0gYS5sZW5ndGg7IGorKykge1xuICAgICAgbWF0cml4WzBdW2pdID0galxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPD0gYi5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDE7IGogPD0gYS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmIChiLmNoYXJBdChpIC0gMSkgPT09IGEuY2hhckF0KGogLSAxKSkge1xuICAgICAgICAgICAgICBtYXRyaXhbaV1bal0gPSBtYXRyaXhbaSAtIDFdW2ogLSAxXVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1hdHJpeFtpXVtqXSA9IE1hdGgubWluKFxuICAgICAgICAgICAgICAgICAgbWF0cml4W2kgLSAxXVtqIC0gMV0gKyAxLFxuICAgICAgICAgICAgICAgICAgTWF0aC5taW4oXG4gICAgICAgICAgICAgICAgICAgICAgbWF0cml4W2ldW2ogLSAxXSArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgbWF0cml4W2kgLSAxXVtqXSArIDFcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXRyaXhbYi5sZW5ndGhdW2EubGVuZ3RoXVxufVxuXG5leHBvcnQgY29uc3QgY2hlY2tTdHJpbmdTaW1pbGFyaXR5ID0gKGJhc2U6IHN0cmluZywgc3RyaW5nVG9Db21wYXJlOiBzdHJpbmcsIGNhc2VJbnNlbnNpdGl2ZTogYm9vbGVhbiA9IHRydWUpOiBudW1iZXIgPT4ge1xuICBpZihjYXNlSW5zZW5zaXRpdmUpIHtcbiAgICBiYXNlID0gYmFzZS50b0xvd2VyQ2FzZSgpXG4gICAgc3RyaW5nVG9Db21wYXJlID0gc3RyaW5nVG9Db21wYXJlLnRvTG93ZXJDYXNlKClcbiAgfVxuICBjb25zdCBkaXN0YW5jZSA9IGxldmVuc2h0ZWluKGJhc2UsIHN0cmluZ1RvQ29tcGFyZSlcbiAgY29uc3QgbWF4TGVuID0gTWF0aC5tYXgoYmFzZS5sZW5ndGgsIHN0cmluZ1RvQ29tcGFyZS5sZW5ndGgpXG4gIGNvbnN0IHNpbWlsYXJpdHkgPSAxIC0gZGlzdGFuY2UgLyBtYXhMZW5cbiAgcmV0dXJuIHNpbWlsYXJpdHlcbn1cblxuZXhwb3J0IGNvbnN0IGNoZWNrU3RyaW5nSXNTaW1pbGFyID0gKGJhc2U6IHN0cmluZywgc3RyaW5nVG9Db21wYXJlOiBzdHJpbmcsIHRocmVzaG9sZDogbnVtYmVyID0gMC44LCBjYXNlSW5zZW5zaXRpdmU6IGJvb2xlYW4gPSB0cnVlKTogYm9vbGVhbiA9PiB7XG4gIHJldHVybiBjaGVja1N0cmluZ1NpbWlsYXJpdHkoYmFzZSwgc3RyaW5nVG9Db21wYXJlLCBjYXNlSW5zZW5zaXRpdmUpID49IHRocmVzaG9sZFxufVxuXG5leHBvcnQgY29uc3QgZW5zdXJlU3RhcnRzV2l0aFVwcGVyQ2FzZSA9IChzdHIgPSAnJykgPT4ge1xuICBpZiAoIXN0cikgcmV0dXJuICcnXG4gIGNvbnN0IHRyaW1tZWRTdGFydCA9IHN0ci50cmltU3RhcnQoKVxuICByZXR1cm4gc3RyLnNsaWNlKDAsIHN0ci5sZW5ndGggLSB0cmltbWVkU3RhcnQubGVuZ3RoKSArIHRyaW1tZWRTdGFydFswXS50b1VwcGVyQ2FzZSgpICsgdHJpbW1lZFN0YXJ0LnNsaWNlKDEpXG59XG5cbmV4cG9ydCBjb25zdCB0cnVuY2F0ZVRleHQgPSAodGV4dDogc3RyaW5nID0gJycsIG1heDogbnVtYmVyID0gNDApID0+IHtcbiAgdHJ5IHtcbiAgICBpZighdGV4dCkgcmV0dXJuICcnXG4gICAgaWYobWF4IDw9IDApIHJldHVybiB0ZXh0ICsgJy4uLidcbiAgICByZXR1cm4gdGV4dC5sZW5ndGggPiBtYXggPyBgJHt0ZXh0LnN1YnN0cmluZygwLCBtYXgpfS4uLmAgOiB0ZXh0XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIHRleHQgfHwgJydcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgU3RyaW5nSGVscGVycyA9IHtcbiAgdGl0bGVDYXNlU3RyaW5nLFxuICByYW5kb21TdHJpbmcsXG4gIGpvaW5Db21tYVBsdXNBbmQsXG4gIGNoZWNrU3RyaW5nU2ltaWxhcml0eSxcbiAgY2hlY2tTdHJpbmdJc1NpbWlsYXIsXG4gIGVuc3VyZVN0YXJ0c1dpdGhVcHBlckNhc2UsXG4gIHRydW5jYXRlVGV4dCxcbn0iLCJcbmV4cG9ydCBjb25zdCBleHRyYWN0TWF0Y2hzID0gKHRleHQ6IHN0cmluZywgcmVnZXg6IFJlZ0V4cCk6IEFycmF5PHN0cmluZz4gPT4ge1xuICBjb25zdCBtYXRjaGVzID0gdGV4dC5tYXRjaChyZWdleCkgfHwgW11cbiAgcmV0dXJuIFsuLi5uZXcgU2V0KG1hdGNoZXMpXVxufVxuXG5leHBvcnQgY29uc3QgZXh0cmFjdFV1aWRzVjQgPSAodGV4dDogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiA9PiB7XG4gIGNvbnN0IHJlZ2V4ID0gL1thLWZBLUYwLTldezh9LVthLWZBLUYwLTldezR9LTRbYS1mQS1GMC05XXszfS1bYS1mQS1GMC05XXs0fS1bYS1mQS1GMC05XXsxMn0vZ1xuICByZXR1cm4gZXh0cmFjdE1hdGNocyh0ZXh0LCByZWdleClcbn1cblxuZXhwb3J0IGNvbnN0IFJlZ2V4SGVscGVycyA9IHtcbiAgZXh0cmFjdE1hdGNocyxcbiAgZXh0cmFjdFV1aWRzVjRcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYXNraXQgKHZhbHVlOiBzdHJpbmcgfCBudWxsLCBtYXNrOiBhbnksIG1hc2tlZCA9IHRydWUsIHRva2VuczogYW55KSB7XG4gIHZhbHVlID0gdmFsdWUgfHwgJydcbiAgbWFzayA9IG1hc2sgfHwgJydcbiAgbGV0IGlNYXNrID0gMFxuICBsZXQgaVZhbHVlID0gMFxuICBsZXQgb3V0cHV0ID0gJydcbiAgd2hpbGUgKGlNYXNrIDwgbWFzay5sZW5ndGggJiYgaVZhbHVlIDwgdmFsdWUubGVuZ3RoKSB7XG4gICAgdmFyIGNNYXNrID0gbWFza1tpTWFza11cbiAgICBjb25zdCBtYXNrZXIgPSB0b2tlbnNbY01hc2tdXG4gICAgY29uc3QgY1ZhbHVlID0gdmFsdWVbaVZhbHVlXVxuICAgIGlmIChtYXNrZXIgJiYgIW1hc2tlci5lc2NhcGUpIHtcbiAgICAgIGlmIChtYXNrZXIucGF0dGVybi50ZXN0KGNWYWx1ZSkpIHtcbiAgICAgIFx0b3V0cHV0ICs9IG1hc2tlci50cmFuc2Zvcm0gPyBtYXNrZXIudHJhbnNmb3JtKGNWYWx1ZSkgOiBjVmFsdWVcbiAgICAgICAgaU1hc2srK1xuICAgICAgfVxuICAgICAgaVZhbHVlKytcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hc2tlciAmJiBtYXNrZXIuZXNjYXBlKSB7XG4gICAgICAgIGlNYXNrKysgLy8gdGFrZSB0aGUgbmV4dCBtYXNrIGNoYXIgYW5kIHRyZWF0IGl0IGFzIGNoYXJcbiAgICAgICAgY01hc2sgPSBtYXNrW2lNYXNrXVxuICAgICAgfVxuICAgICAgaWYgKG1hc2tlZCkgb3V0cHV0ICs9IGNNYXNrXG4gICAgICBpZiAoY1ZhbHVlID09PSBjTWFzaykgaVZhbHVlKysgLy8gdXNlciB0eXBlZCB0aGUgc2FtZSBjaGFyXG4gICAgICBpTWFzaysrXG4gICAgfVxuICB9XG5cbiAgLy8gZml4IG1hc2sgdGhhdCBlbmRzIHdpdGggYSBjaGFyOiAoIylcbiAgbGV0IHJlc3RPdXRwdXQgPSAnJ1xuICB3aGlsZSAoaU1hc2sgPCBtYXNrLmxlbmd0aCAmJiBtYXNrZWQpIHtcbiAgICB2YXIgY01hc2sgPSBtYXNrW2lNYXNrXVxuICAgIGlmICh0b2tlbnNbY01hc2tdKSB7XG4gICAgICByZXN0T3V0cHV0ID0gJydcbiAgICAgIGJyZWFrXG4gICAgfVxuICAgIHJlc3RPdXRwdXQgKz0gY01hc2tcbiAgICBpTWFzaysrXG4gIH1cblxuICByZXR1cm4gb3V0cHV0ICsgcmVzdE91dHB1dFxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGR5bmFtaWNNYXNrIChtYXNraXQ6IGFueSwgbWFza3M6IGFueVtdLCB0b2tlbnM6IGFueSk6IGFueSB7XG4gIG1hc2tzID0gbWFza3Muc29ydCgoYSwgYikgPT4gYS5sZW5ndGggLSBiLmxlbmd0aClcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZTogYW55LCBtYXNrOiBhbnksIG1hc2tlZCA9IHRydWUpIHtcbiAgICB2YXIgaSA9IDBcbiAgICB3aGlsZSAoaSA8IG1hc2tzLmxlbmd0aCkge1xuICAgICAgdmFyIGN1cnJlbnRNYXNrID0gbWFza3NbaV1cbiAgICAgIGkrK1xuICAgICAgdmFyIG5leHRNYXNrID0gbWFza3NbaV1cbiAgICAgIGlmICghIChuZXh0TWFzayAmJiBtYXNraXQodmFsdWUsIG5leHRNYXNrLCB0cnVlLCB0b2tlbnMpLmxlbmd0aCA+IGN1cnJlbnRNYXNrLmxlbmd0aCkgKSB7XG4gICAgICAgIHJldHVybiBtYXNraXQodmFsdWUsIGN1cnJlbnRNYXNrLCBtYXNrZWQsIHRva2VucylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICcnXG4gIH1cbn0iLCJleHBvcnQgZGVmYXVsdCB7XG4gICcjJzogeyBwYXR0ZXJuOiAvXFxkLyB9LFxuICBYOiB7IHBhdHRlcm46IC9bMC05YS16QS1aXS8gfSxcbiAgUzogeyBwYXR0ZXJuOiAvW2EtekEtWl0vIH0sXG4gIEE6IHsgcGF0dGVybjogL1thLXpBLVpdLywgdHJhbnNmb3JtOiAodjogc3RyaW5nKSA9PiB2LnRvTG9jYWxlVXBwZXJDYXNlKCkgfSxcbiAgYTogeyBwYXR0ZXJuOiAvW2EtekEtWl0vLCB0cmFuc2Zvcm06ICh2OiBzdHJpbmcpID0+IHYudG9Mb2NhbGVMb3dlckNhc2UoKSB9LFxuICAnISc6IHsgZXNjYXBlOiB0cnVlIH1cbn0iLCJpbXBvcnQgbWFza2l0IGZyb20gJy4vbWFza2l0J1xuaW1wb3J0IGR5bmFtaWNNYXNrIGZyb20gJy4vZHluYW1pYy1tYXNrJ1xuaW1wb3J0IHRva2VucyBmcm9tICcuL3Rva2VucydcblxuZXhwb3J0IGNvbnN0IG1hc2tlciA9IGZ1bmN0aW9uICh2YWx1ZTogYW55LCBtYXNrOiBhbnksIG1hc2tlZCA9IHRydWUpIHtcblxuICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgXG4gIHJldHVybiBBcnJheS5pc0FycmF5KG1hc2spXG4gICAgPyBkeW5hbWljTWFzayhtYXNraXQsIG1hc2ssIHRva2VucykodmFsdWUsIG1hc2ssIG1hc2tlZCwgdG9rZW5zKVxuICAgIDogbWFza2l0KHZhbHVlLCBtYXNrLCBtYXNrZWQsIHRva2VucylcbiAgICBcbn0iLCJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1BIT05FX0RESSA9IFsnKyMjIycsICcrIyMnLCAnKyMnLCAnKyMtIyMjJ11cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BIT05FX01BU0sgPSBbJygjIykgIyMjIyMtIyMjIycsICcoIyMpICMjIyMtIyMjIyddXG5leHBvcnQgY29uc3QgREVGQVVMVF9QSE9ORV9NQVNLX1dJVEhfRERJID0gWycrIyMgIyMjICMjICMjICMjJywgJysjICgjIyMpICMjIy0jIyMjJywgJysjIyAoIyMpICMjIyMtIyMjIycsICcrIyMgKCMjKSAjIyMjIy0jIyMjJywgXSIsImltcG9ydCB7IG1hc2tlciB9IGZyb20gJy4vbWFzay9tYXNrZXInXG5pbXBvcnQgeyBERUZBVUxUX1BIT05FX0RESSwgREVGQVVMVF9QSE9ORV9NQVNLLCBERUZBVUxUX1BIT05FX01BU0tfV0lUSF9EREl9IGZyb20gJy4vbWFzay9lbnVtcydcblxuZXhwb3J0IGNvbnN0IG1hc2sgPSAodmFsdWU6IGFueSwgbWFzazogYW55KSA9PiB7XG4gIHJldHVybiBtYXNrZXIodmFsdWUsIG1hc2ssIHRydWUpXG59XG5cbmV4cG9ydCBjb25zdCB1bm1hc2sgPSAodmFsdWU6IGFueSwgbWFzazogYW55KSA9PiB7XG4gIHJldHVybiBtYXNrZXIodmFsdWUsIG1hc2ssIGZhbHNlKVxufVxuXG5leHBvcnQgY29uc3QgTWFza2VyID0ge1xuICBtYXNrLFxuICB1bm1hc2ssXG4gIERFRkFVTFRfUEhPTkVfRERJLFxuICBERUZBVUxUX1BIT05FX01BU0ssXG4gIERFRkFVTFRfUEhPTkVfTUFTS19XSVRIX0RESVxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFPLE1BQU0sNkJBQTZCLEdBQUcsQ0FBQyxHQUFhLEdBQUEsRUFBRSxLQUFJO0lBQy9ELElBQUEsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQzdELENBQUMsQ0FBQTtJQUdNLE1BQU0sNkJBQTZCLEdBQUcsQ0FBQyxJQUFTLEtBQUk7SUFDekQsSUFBQSxJQUFHLFFBQU8sSUFBSSxDQUFDLEtBQUssUUFBUTtJQUFFLFFBQUEsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDdkQsSUFBQSxJQUFHLFFBQU8sSUFBSSxDQUFDLEtBQUssUUFBUTtJQUFFLFFBQUEsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDcEQsSUFBQSxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7O1VDUFksZ0JBQWdCLEdBQUcsQ0FBQyxPQUFjLEVBQUUsTUFBVyxLQUFTO1FBQ25FLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsS0FBSTtJQUM5QyxRQUFBLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsRUFBRTtnQkFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUFFLFNBQUE7SUFDbEksUUFBQSxPQUFPLEdBQUcsQ0FBQTtTQUNYLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDUixFQUFDO0FBRU0sVUFBTSxhQUFhLEdBQUcsQ0FBQyxJQUFTLEVBQUUsS0FBVSxFQUFFLGdCQUFBLEdBQTRCLEtBQUssS0FBUztJQUM3RixJQUFBLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxLQUFJO1lBQ2pELElBQUksU0FBUyxHQUFHLDZCQUE2QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1lBQ3hELElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtJQUM1QixZQUFBLElBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTTtJQUFFLGdCQUFBLE9BQU8sZ0JBQWdCLENBQUE7SUFDOUMsWUFBQSxPQUFPLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3RFLFNBQUE7WUFDRCxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUM3QyxLQUFDLENBQUMsQ0FBQTtRQUNGLElBQUcsUUFBUSxDQUFDLE1BQU07SUFBRSxRQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ2hDLElBQUEsT0FBTyxJQUFJLENBQUE7SUFDYixFQUFDO1VBRVksWUFBWSxHQUFHLENBQUMsS0FBVSxFQUFFLEtBQVUsS0FBYTtJQUM5RCxJQUFBLElBQUcsUUFBTyxLQUFLLENBQUMsS0FBSyxRQUFRLElBQUksUUFBTyxLQUFLLENBQUMsS0FBSyxRQUFRO1lBQUUsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQzlHLE9BQU8sS0FBSyxJQUFJLEtBQUssQ0FBQTtJQUN2QixFQUFDO0FBRU0sVUFBTSxhQUFhLEdBQUcsQ0FBQyxRQUFlLEVBQUUsUUFBYSxFQUFFLEdBQUEsR0FBVyxFQUFFLEtBQUk7SUFDN0UsSUFBQSxLQUFJLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRTtZQUMxQixJQUFHLFFBQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLFdBQVcsRUFBRTtJQUN2QyxZQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNuQyxTQUFBO0lBQU0sYUFBQTtnQkFDTCxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUE7SUFDbEMsU0FBQTtJQUVELFFBQUEsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLEVBQUU7SUFDakQsWUFBQSxHQUFHLEtBQUssT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQSxFQUFFO0lBQ2pELFlBQUEsWUFBWSxFQUFFLElBQUk7SUFDbkIsU0FBQSxDQUFDLENBQUE7SUFDSCxLQUFBO0lBQ0gsRUFBQztBQUVZLFVBQUEsY0FBYyxHQUFHLENBQUMsTUFBVyxFQUFFLEdBQVcsRUFBRSxLQUFVLEtBQUk7SUFDckUsSUFBQSxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7SUFDakMsUUFBQSxLQUFLLEVBQUUsS0FBSztJQUNaLFFBQUEsUUFBUSxFQUFFLElBQUk7SUFDZCxRQUFBLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLFFBQUEsWUFBWSxFQUFFLElBQUk7SUFDbkIsS0FBQSxDQUFDLENBQUE7SUFDRixJQUFBLE9BQU8sTUFBTSxDQUFBO0lBQ2YsRUFBQztBQUVZLFVBQUEsUUFBUSxHQUFHLENBQUMsSUFBUyxLQUFhO0lBQzdDLElBQUEsUUFBUSxJQUFJLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtJQUNwRSxFQUFDO0FBRVksVUFBQSxlQUFlLEdBQUcsQ0FBQyxNQUFXLEVBQUUsR0FBRyxPQUFZLEtBQVM7UUFDbkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNO0lBQUUsUUFBQSxPQUFPLE1BQU0sQ0FBQztJQUNuQyxJQUFBLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUvQixJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7SUFDeEMsUUFBQSxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRTtJQUN4QixZQUFBLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0lBQ3pCLGdCQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQUUsb0JBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7NEJBQ3RDLENBQUMsR0FBRyxHQUFHLEVBQUU7SUFDVixxQkFBQSxDQUFDLENBQUM7b0JBQ0gsZUFBZSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzQyxhQUFBO0lBQU0saUJBQUE7SUFDTCxnQkFBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtJQUNwQixvQkFBQSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ25CLGlCQUFBLENBQUMsQ0FBQztJQUNKLGFBQUE7SUFDRixTQUFBO0lBQ0YsS0FBQTtJQUVELElBQUEsT0FBTyxlQUFlLENBQUMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUM7SUFDN0MsRUFBQztBQUVZLFVBQUEsb0JBQW9CLEdBQUcsQ0FBQyxHQUFXLEdBQUEsRUFBRSxFQUFFLEdBQUEsR0FBYyxFQUFFLEtBQVM7SUFDM0UsSUFBQSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSTtJQUN0QyxRQUFBLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxHQUFHLEtBQUssSUFBSTtJQUFFLFlBQUEsT0FBTyxTQUFTLENBQUE7WUFFdkQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0lBQ2pELFFBQUEsSUFBSSxVQUFVLEVBQUU7SUFDZCxZQUFBLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDOUIsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtnQkFFOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLFNBQVMsRUFBRTtJQUM1RSxnQkFBQSxPQUFPLFNBQVMsQ0FBQTtJQUNqQixhQUFBO0lBQ0QsWUFBQSxPQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNqQyxTQUFBO0lBRUQsUUFBQSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUNkLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDVCxFQUFDO0FBRU0sVUFBTSxvQkFBb0IsR0FBRyxDQUFDLEdBQVcsR0FBQSxFQUFFLEVBQUUsR0FBVyxFQUFFLEtBQVUsRUFBRSwwQkFBc0MsR0FBQSxLQUFLLEtBQVM7UUFDL0gsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQzVCLElBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEtBQUk7WUFDNUMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0lBRWpELFFBQUEsSUFBSSxVQUFVLEVBQUU7SUFDZCxZQUFBLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDOUIsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtnQkFFOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7SUFDakMsZ0JBQUEsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssU0FBUyxLQUFLLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxFQUFFO0lBQ3RFLG9CQUFBLE1BQU0sSUFBSSxTQUFTLENBQUMsQ0FBQSxxQkFBQSxFQUF3QixRQUFRLENBQUEsQ0FBQSxFQUFJLFVBQVUsQ0FBQSx1QkFBQSxFQUEwQixPQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBYyxXQUFBLEVBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFBLENBQUcsQ0FBQyxDQUFBO0lBQ3JLLGlCQUFBO0lBQ0QsZ0JBQUEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtJQUNuQixhQUFBOztnQkFHRCxJQUFJLENBQUMsMEJBQTBCLElBQUksVUFBVSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUU7b0JBQ3JFLE1BQU0sSUFBSSxVQUFVLENBQUMsQ0FBVSxPQUFBLEVBQUEsUUFBUSx5QkFBeUIsVUFBVSxDQUFBLFVBQUEsRUFBYSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFHLENBQUEsQ0FBQSxDQUFDLENBQUE7SUFDOUgsYUFBQTs7SUFHRCxZQUFBLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7O2dCQUVuQixDQUFDLEdBQUcsVUFBVSxDQUFBO0lBQ2YsU0FBQTtJQUVELFFBQUEsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7SUFDN0IsWUFBQSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO0lBQ2YsU0FBQTtJQUFNLGFBQUE7O0lBRUwsWUFBQSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEtBQUssT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLEVBQUU7SUFDeEQsZ0JBQUEsTUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFBLHFCQUFBLEVBQXdCLENBQUMsQ0FBQSxzQkFBQSxFQUF5QixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQSxXQUFBLEVBQWMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFBLENBQUcsQ0FBQyxDQUFBO0lBQ3hJLGFBQUE7Z0JBQ0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDdEIsU0FBQTtJQUVELFFBQUEsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDZCxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBRVAsSUFBQSxPQUFPLEdBQUcsQ0FBQTtJQUNaLEVBQUM7QUFFTSxVQUFNLHVCQUF1QixHQUFHLENBQUMsR0FBUSxFQUFFLEdBQVcsRUFBRSxpQkFBQSxHQUE2QixJQUFJLEtBQVM7UUFDdkcsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUUzQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEtBQUk7WUFDakMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0lBRWpELFFBQUEsSUFBSSxVQUFVLEVBQUU7SUFDZCxZQUFBLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDOUIsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUU5QyxZQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7b0JBQ3ZELE1BQU0sSUFBSSxTQUFTLENBQUMsQ0FBMkIsd0JBQUEsRUFBQSxRQUFRLElBQUksVUFBVSxDQUFBLDhCQUFBLEVBQWlDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQSxDQUFBLENBQUMsQ0FBQTtJQUM3SSxhQUFBO0lBRUQsWUFBQSxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTs7b0JBRTdCLElBQUksVUFBVSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRTt3QkFDNUQsTUFBTSxJQUFJLFVBQVUsQ0FBQyxDQUFVLE9BQUEsRUFBQSxRQUFRLHlCQUF5QixVQUFVLENBQUEsVUFBQSxFQUFhLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQSxDQUFBLENBQUMsQ0FBQTtJQUM5SCxpQkFBQTtvQkFDRCxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNwQyxhQUFBO0lBQU0saUJBQUE7b0JBQ0wsR0FBRyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNoQyxhQUFBO0lBQ0YsU0FBQTtJQUFNLGFBQUE7SUFDTCxZQUFBLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFOztvQkFFN0IsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUNoQyxvQkFBQSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNkLGlCQUFBO3lCQUFNLElBQUcsQ0FBQyxpQkFBaUIsRUFBRTt3QkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFBLHFDQUFBLEVBQXdDLENBQUMsQ0FBYyxXQUFBLEVBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBRyxDQUFBLENBQUEsQ0FBQyxDQUFBO0lBQzlHLGlCQUFBO0lBQ0YsYUFBQTtJQUFNLGlCQUFBOztJQUVMLGdCQUFBLElBQUcsaUJBQWlCLEVBQUU7SUFDcEIsb0JBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7SUFDekMsd0JBQUEsT0FBTyxHQUFHLENBQUE7SUFDWCxxQkFBQTtJQUNGLGlCQUFBO0lBQ0QsZ0JBQUEsSUFBSSxDQUFDLGlCQUFpQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxFQUFFO3dCQUNqRSxNQUFNLElBQUksU0FBUyxDQUFDLENBQUEsd0JBQUEsRUFBMkIsQ0FBQyxDQUFpQyw4QkFBQSxFQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQSxDQUFBLENBQUMsQ0FBQTtJQUN4SCxpQkFBQTtJQUNELGdCQUFBLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDYixhQUFBO0lBQ0YsU0FBQTtJQUVELFFBQUEsT0FBTyxHQUFHLENBQUE7U0FDWCxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBRVAsSUFBQSxPQUFPLEdBQUcsQ0FBQTtJQUNaLEVBQUM7QUFJTSxVQUFNLGFBQWEsR0FBRyxDQUMzQixHQUFjLEVBQ2QsU0FBaUIsRUFDakIsU0FBQSxHQUFxQixLQUFLLEtBQ1g7UUFDZixNQUFNLE9BQU8sR0FBVSxFQUFFLENBQUE7UUFDekIsSUFBSSxXQUFXLEdBQVEsSUFBSSxDQUFBO0lBRTNCLElBQUEsTUFBTSxNQUFNLEdBQUcsQ0FBQyxVQUFxQixLQUFJO0lBQ3ZDLFFBQUEsSUFBSSxDQUFDLFNBQVMsSUFBSSxXQUFXLEtBQUssSUFBSTtnQkFBRSxPQUFNO0lBQzlDLFFBQUEsSUFBSSxPQUFPLFVBQVUsS0FBSyxRQUFRLElBQUksVUFBVSxLQUFLLElBQUk7Z0JBQUUsT0FBTTtJQUVqRSxRQUFBLEtBQUssTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFO2dCQUM1QixJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7SUFDckIsZ0JBQUEsSUFBSSxTQUFTLEVBQUU7d0JBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUM5QixpQkFBQTtJQUFNLHFCQUFBO0lBQ0wsb0JBQUEsV0FBVyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQTt3QkFDN0IsT0FBTTtJQUNQLGlCQUFBO0lBQ0YsYUFBQTtJQUNELFlBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ3hCLFNBQUE7SUFDSCxLQUFDLENBQUE7UUFFRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLFNBQVMsR0FBRyxPQUFPLEdBQUcsV0FBVyxDQUFBO0lBQzFDLEVBQUM7VUFFWSxrQkFBa0IsR0FBRyxDQUNoQyxPQUFrQixFQUNsQixVQUFxQixLQUNWO1FBQ1gsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtJQUNuRCxRQUFBLE9BQU8sT0FBTyxPQUFPLEtBQUssT0FBTyxVQUFVLENBQUE7SUFDNUMsS0FBQTtRQUNELElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7SUFDekQsUUFBQSxPQUFPLEtBQUssQ0FBQTtJQUNiLEtBQUE7SUFDRCxJQUFBLEtBQUssTUFBTSxHQUFHLElBQUksT0FBTyxFQUFFO0lBQ3pCLFFBQUEsSUFBSSxFQUFFLEdBQUcsSUFBSSxVQUFVLENBQUM7SUFBRSxZQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ3RDLFFBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFBRSxZQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ3JFLEtBQUE7SUFDRCxJQUFBLE9BQU8sSUFBSSxDQUFBO0lBQ2IsRUFBQztBQUVZLFVBQUEsYUFBYSxHQUFHO1FBQzNCLGdCQUFnQjtRQUNoQixhQUFhO1FBQ2IsWUFBWTtRQUNaLGFBQWE7UUFDYixjQUFjO1FBQ2QsUUFBUTtRQUNSLGVBQWU7UUFDZixvQkFBb0I7UUFDcEIsb0JBQW9CO1FBQ3BCLHVCQUF1QjtRQUN2QixhQUFhOzs7QUN2UFIsVUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFVLEVBQUUsR0FBUSxFQUFFLFNBQUEsR0FBcUIsS0FBSyxLQUFTO0lBQ2pGLElBQUEsS0FBSSxNQUFNLElBQUksSUFBSSxHQUFHLEVBQUU7SUFDckIsUUFBQSxJQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7Z0JBQUUsU0FBUTtZQUN0QyxPQUFPLFNBQVMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQy9CLEtBQUE7SUFDRCxJQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ2QsRUFBQztBQUVNLFVBQU0sWUFBWSxHQUFHLENBQUMsR0FBVSxFQUFFLElBQVMsRUFBRSxTQUFBLEdBQXFCLEtBQUssS0FBUztJQUNyRixJQUFBLEtBQUksTUFBTSxPQUFPLElBQUksR0FBRyxFQUFFO0lBQ3hCLFFBQUEsSUFBRyxRQUFPLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxRQUFPLElBQUksQ0FBQyxLQUFLLFFBQVEsRUFBRTtnQkFDNUQsSUFBRyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFBRSxPQUFPLFNBQVMsR0FBRyxJQUFJLEdBQUcsT0FBTyxDQUFBO0lBQ2xGLFNBQUE7WUFFRCxJQUFHLE9BQU8sSUFBSSxJQUFJLEVBQUU7Z0JBQ2xCLE9BQU8sU0FBUyxHQUFHLElBQUksR0FBRyxPQUFPLENBQUE7SUFDbEMsU0FBQTtJQUNGLEtBQUE7SUFDRCxJQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ2QsRUFBQztBQUVNLFVBQU0sSUFBSSxHQUFHLENBQUMsR0FBVSxFQUFFLEtBQVUsRUFBRSxTQUFBLEdBQXFCLEtBQUssS0FBUztJQUM5RSxJQUFBLElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFBRyxRQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ3RDLElBQUEsSUFBRyxRQUFPLEtBQUssQ0FBQyxLQUFLLFFBQVE7WUFBRSxPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQ3RFLE9BQU8sWUFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDNUMsRUFBQztVQUVZLFNBQVMsR0FBRyxDQUFDLEdBQVUsRUFBRSxLQUFVLEtBQVk7SUFDMUQsSUFBQSxJQUFHLFFBQU8sS0FBSyxDQUFDLEtBQUssUUFBUSxFQUFFO1lBQzdCLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDekMsUUFBQSxPQUFPLFdBQVcsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUM1RCxLQUFBO1FBQ0QsTUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUMvQyxJQUFBLE9BQU8sY0FBYyxLQUFLLEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ3BFLEVBQUM7QUFFTSxVQUFNLE9BQU8sR0FBRyxDQUFDLEdBQVUsRUFBRSxLQUFVLEVBQUUsZ0JBQUEsR0FBNEIsS0FBSyxLQUFXO0lBQzFGLElBQUEsSUFBSSxDQUFDLEtBQUs7SUFBRSxRQUFBLE9BQU8sR0FBRyxDQUFBO0lBQ3RCLElBQUEsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxLQUFJO0lBQ3pCLFFBQUEsTUFBTSxXQUFXLEdBQUcsUUFBTyxJQUFJLENBQUMsS0FBSyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQTtJQUN6RSxRQUFBLElBQUcsUUFBTyxLQUFLLENBQUMsSUFBSSxRQUFRO0lBQUUsWUFBQSxPQUFPLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDOUQsUUFBQSxJQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQUUsWUFBQSxPQUFPLDZCQUE2QixDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFBO0lBQ3pHLFFBQUEsT0FBTyxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQTtJQUNyRSxLQUFDLENBQUMsQ0FBQTtJQUNKLEVBQUM7QUFFTSxVQUFNLFNBQVMsR0FBRyxDQUFDLEdBQVUsRUFBRSxLQUFVLEVBQUUsZ0JBQUEsR0FBNEIsSUFBSSxLQUFXO0lBQzNGLElBQUEsSUFBSSxDQUFDLEtBQUs7SUFBRSxRQUFBLE9BQU8sR0FBRyxDQUFBO0lBQ3RCLElBQUEsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxLQUFJO0lBQ3pCLFFBQUEsTUFBTSxXQUFXLEdBQUcsUUFBTyxJQUFJLENBQUMsS0FBSyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQTtJQUN6RSxRQUFBLElBQUcsUUFBTyxLQUFLLENBQUMsS0FBSyxRQUFRO0lBQUUsWUFBQSxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNoRSxRQUFBLElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFBRSxZQUFBLE9BQU8sNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUE7SUFDekcsUUFBQSxPQUFPLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQTtJQUNwRSxLQUFDLENBQUMsQ0FBQTtJQUNKLEVBQUM7QUFFWSxVQUFBLE1BQU0sR0FBRyxDQUFDLEdBQVUsRUFBRSxLQUFBLEdBQWEsSUFBSSxLQUFTO0lBQzNELElBQUEsSUFBSSxDQUFDLEtBQUs7SUFBRSxRQUFBLE9BQU8sR0FBRyxDQUFBO1FBQ3RCLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDbkMsSUFBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQUUsUUFBQSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNuQyxJQUFBLE9BQU8sR0FBRyxDQUFBO0lBQ1osRUFBQztBQUVZLFVBQUEsV0FBVyxHQUFHLENBQUMsR0FBVSxFQUFFLEtBQUEsR0FBYSxJQUFJLEtBQVc7UUFDbEUsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFBO0lBQ3RCLElBQUEsS0FBSSxNQUFNLElBQUksSUFBSSxHQUFHLEVBQUU7SUFDckIsUUFBQSxJQUFJLE1BQU0sQ0FBQTtZQUNWLElBQUcsQ0FBQyxLQUFLLEVBQUU7Z0JBQ1QsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUNkLFNBQUE7SUFBTSxhQUFBLElBQUcsUUFBTyxLQUFLLENBQUMsS0FBSyxRQUFRLEVBQUU7Z0JBQ3BDLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFBO0lBQ2xDLFNBQUE7SUFBTSxhQUFBO2dCQUNMLE1BQU0sR0FBRyxLQUFLLENBQUE7SUFDZixTQUFBO1lBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUN4QyxRQUFBLElBQUcsQ0FBQyxNQUFNO0lBQUUsWUFBQSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ25DLEtBQUE7SUFDRCxJQUFBLE9BQU8sV0FBVyxDQUFBO0lBQ3BCLEVBQUM7QUFFWSxVQUFBLGFBQWEsR0FBRyxDQUFDLEdBQVUsRUFBRSxTQUFBLEdBQW9CLEdBQUcsS0FBWTtJQUMzRSxJQUFBLElBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFFBQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUTtJQUFFLFFBQUEsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFBLDJDQUFBLENBQTZDLENBQUMsQ0FBQTtRQUNwSCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25DLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNwSCxFQUFDO1VBRVksYUFBYSxHQUFHLENBQUMsR0FBVSxFQUFFLEdBQVEsS0FBVztRQUMzRCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ2xDLElBQUEsSUFBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUU7SUFDZCxRQUFBLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3RCLEtBQUE7SUFBTSxTQUFBO0lBQ0wsUUFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ2QsS0FBQTtJQUNELElBQUEsT0FBTyxHQUFHLENBQUE7SUFDWixFQUFDO0FBRU0sVUFBTSxZQUFZLEdBQUcsQ0FBQyxPQUFjLEVBQUUsWUFBbUIsRUFBRSxHQUFBLEdBQWMsSUFBSSxLQUFhO0lBQy9GLElBQUEsSUFBRyxPQUFPLENBQUMsTUFBTSxLQUFLLFlBQVksQ0FBQyxNQUFNO0lBQUUsUUFBQSxPQUFPLEtBQUssQ0FBQTtJQUN2RCxJQUFBLEtBQUksTUFBTSxJQUFJLElBQUksT0FBTyxFQUFFO0lBQ3pCLFFBQUEsSUFBSSxNQUFNLENBQUE7SUFDVixRQUFBLElBQUcsUUFBTyxJQUFJLENBQUMsS0FBSyxRQUFRLEVBQUU7Z0JBQzVCLE1BQU0sR0FBRyxJQUFJLENBQUE7SUFDZCxTQUFBO0lBQU0sYUFBQTtJQUNMLFlBQUEsSUFBRyxRQUFPLEdBQUcsQ0FBQyxLQUFLLFFBQVE7SUFBRSxnQkFBQSxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUE7Z0JBQ2hGLE1BQU0sR0FBRSxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFBO0lBQzdCLFNBQUE7WUFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQ3pDLFFBQUEsSUFBRyxDQUFDLE1BQU07SUFBRSxZQUFBLE9BQU8sS0FBSyxDQUFBO0lBQ3pCLEtBQUE7SUFDRCxJQUFBLE9BQU8sSUFBSSxDQUFBO0lBQ2IsRUFBQztBQUVZLFVBQUEsT0FBTyxHQUFHLENBQUMsS0FBWSxLQUFJO0lBQ3RDLElBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3pDLFFBQUEsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFXLENBQUE7WUFDdkQsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDNUMsS0FBQTtJQUNELElBQUEsT0FBTyxLQUFLLENBQUE7SUFDZCxFQUFDO0FBRVksVUFBQSxnQkFBZ0IsR0FBRyxDQUFDLElBQVcsS0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFDO0FBRXRGLFVBQUEsWUFBWSxHQUFHO1FBQzFCLFNBQVM7UUFDVCxZQUFZO1FBQ1osSUFBSTtRQUNKLFNBQVM7UUFDVCxPQUFPO1FBQ1AsU0FBUztRQUNULE1BQU07UUFDTixXQUFXO1FBQ1gsYUFBYTtRQUNiLGFBQWE7UUFDYixZQUFZO1FBQ1osT0FBTztRQUNQLGdCQUFnQjs7O0lDeklsQjs7O0lBR0c7VUFDVSxxQkFBcUIsR0FBRyxDQUFDLE1BQWMsRUFBRSxVQUEyQixLQUFJO0lBQ25GLElBQUEsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ3RDLElBQUEsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2xDLE9BQU8sTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDaEMsRUFBQztJQUVEOzs7SUFHRztBQUNJLFVBQU0scUJBQXFCLEdBQUcsQ0FBQyxNQUFjLEVBQUUsS0FBYSxFQUFFLGlCQUEwQixLQUFLLEVBQUUsTUFBZ0IsR0FBQSxDQUFDLEtBQXFCO0lBQzFJLElBQUEsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2xDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFBO0lBQ3hDLElBQUEsSUFBRyxDQUFDLGNBQWM7SUFBRSxRQUFBLE9BQU8sTUFBTSxDQUFBO1FBQ2pDLElBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBRSxNQUFNLEdBQUcsR0FBRyxDQUFFLENBQUM7SUFBRSxRQUFBLE9BQU8sTUFBTSxDQUFDLE1BQU0sR0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMzRCxPQUFPLE1BQU0sQ0FBRSxNQUFNLEdBQUcsR0FBRyxDQUFFLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUM5RyxFQUFDO0FBRVksVUFBQSxLQUFLLEdBQUcsQ0FBQyxLQUFhLEVBQUUsUUFBQSxHQUFtQixDQUFDLEtBQUk7SUFDM0QsSUFBQSxNQUFNLEVBQUUsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDaEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDOUIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDL0IsRUFBQztBQUVZLFVBQUEsU0FBUyxHQUFHLENBQUMsR0FBVyxFQUFFLEdBQUEsR0FBYyxDQUFDLEtBQUk7SUFDeEQsSUFBQSxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN2RCxFQUFDO0lBRUQ7O0lBRUc7VUFDVSxhQUFhLEdBQUcsQ0FBQyxLQUFhLEVBQUUsVUFBMkIsS0FBSTtJQUMxRSxJQUFBLE1BQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUN0QyxJQUFBLE1BQU0sRUFBRSxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNoQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDL0IsRUFBQztJQUVEOzs7SUFHRztBQUNJLFVBQU0sdUJBQXVCLEdBQUcsQ0FBQyxNQUFjLEVBQUUsS0FBYSxFQUFFLFVBQUEsR0FBcUIsRUFBRSxLQUFJO0lBQ2hHLElBQUEsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2xDLElBQUEsTUFBTSxFQUFFLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hDLElBQUEsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQ3RDLElBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxFQUFFO0lBQUUsUUFBQSxPQUFPLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUNqRSxJQUFBLE9BQU8sRUFBRSxDQUFBO0lBQ1gsRUFBQztJQUVELE1BQU0sY0FBYyxHQUFHLENBQUMsS0FBc0IsS0FBWTtJQUN4RCxJQUFBLE9BQU8sUUFBTyxLQUFLLENBQUMsS0FBSyxRQUFRLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUMvRCxDQUFDLENBQUE7QUFFWSxVQUFBLFdBQVcsR0FBRztRQUN6QixxQkFBcUI7UUFDckIscUJBQXFCO1FBQ3JCLEtBQUs7UUFDTCxTQUFTO1FBQ1QsYUFBYTtRQUNiLHVCQUF1Qjs7O0FDL0RaLFVBQUEsZUFBZSxHQUFHLENBQUMsSUFBWSxFQUFFLFFBQUEsR0FBa0IsVUFBVSxLQUFVO0lBQ2xGLElBQUEsSUFBRyxDQUFDLE1BQU07SUFBRSxRQUFBLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQSxvREFBQSxDQUFzRCxDQUFDLENBQUE7SUFDbkYsSUFBQSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMxRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hDLElBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDL0IsSUFBQSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUN2QyxJQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQy9CLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUNaLElBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEMsRUFBQztBQUVZLFVBQUEsZUFBZSxHQUFHLENBQUMsTUFBYyxLQUFVO1FBQ3RELElBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRTtJQUN0QixRQUFBLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3RDLEtBQUE7SUFBTSxTQUFBO1lBQ0wsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUM3QyxRQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hDLFFBQUEsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUE7WUFDcEIsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQ2QsUUFBQSxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzVCLFFBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDakMsS0FBQTtJQUNILEVBQUM7QUFFWSxVQUFBLGlCQUFpQixHQUFHLENBQUMsTUFBYyxLQUFZO1FBQzFELE1BQU0sTUFBTSxHQUFHLDRCQUE0QixDQUFBO0lBQzNDLElBQUEsSUFBRyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsR0FBRyxNQUFNO0lBQUUsUUFBQSxPQUFPLElBQUksQ0FBQTtJQUN4QyxJQUFBLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3ZCLEVBQUM7QUFFTSxVQUFNLGdCQUFnQixHQUFHLE1BQVc7SUFDekMsSUFBQSxJQUFHLFFBQVEsRUFBRTtZQUNYLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLFFBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDdkMsWUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xDLE1BQU0sSUFBSSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUM7Z0JBQzNELE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQztnQkFDakIsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsK0NBQStDLEdBQUcsSUFBSSxDQUFDO0lBQ2pGLFNBQUE7SUFDRixLQUFBO0lBQ0gsRUFBQztVQUVZLGlCQUFpQixHQUFHLENBQUMsYUFBeUIsR0FBQSxJQUFJLEtBQUk7UUFDakUsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ3BCLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUN0QixJQUFBLElBQUcsYUFBYSxFQUFFO0lBQ2hCLFFBQUEsZ0JBQWdCLEVBQUUsQ0FBQTtJQUNuQixLQUFBO0lBQ0gsRUFBQztBQUdNLFVBQU0seUJBQXlCLEdBQUcsQ0FBQyxNQUFpQixHQUFBLE1BQU0sRUFBRSxhQUFBLEdBQXlCLElBQUksRUFBRSxFQUFzQixHQUFBLElBQUksS0FBVTtJQUNwSSxJQUFBLElBQUcsUUFBUSxFQUFFO0lBQ1gsUUFBQSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQVMsS0FBSyxFQUFBO2dCQUNqRCxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7b0JBQ3pDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQTtvQkFDdEIsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDaEMsZ0JBQUEsSUFBRyxFQUFFLEVBQUU7SUFDTCxvQkFBQSxFQUFFLEVBQUUsQ0FBQTtJQUNMLGlCQUFBO0lBQU0scUJBQUE7SUFDTCxvQkFBQSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQ3pCLGlCQUFBO0lBQ0YsYUFBQTtJQUNILFNBQUMsQ0FBQyxDQUFBO0lBQ0gsS0FBQTtJQUNILEVBQUM7QUFFWSxVQUFBLGFBQWEsR0FBRztRQUMzQixlQUFlO1FBQ2YsZUFBZTtRQUNmLGlCQUFpQjtRQUNqQixpQkFBaUI7UUFDakIseUJBQXlCO1FBQ3pCLGdCQUFnQjs7O0lDaEVsQixNQUFNLGNBQWMsR0FBd0I7SUFDMUMsSUFBQSxNQUFNLEVBQUUsTUFBTTtJQUNkLElBQUEsTUFBTSxFQUFFLEVBQUU7SUFDVixJQUFBLE9BQU8sRUFBRSxHQUFHO0lBQ1osSUFBQSxRQUFRLEVBQUUsR0FBRztJQUNiLElBQUEsU0FBUyxFQUFFLENBQUM7SUFDWixJQUFBLGNBQWMsRUFBRSxJQUFJO0lBQ3BCLElBQUEsU0FBUyxFQUFFLEtBQUs7S0FDakI7O0lDbkJEOzs7Ozs7Ozs7SUFTRztBQUlVLFVBQUEsWUFBWSxHQUFHLENBQUMsS0FBZ0MsR0FBQSxHQUFHLEVBQUUsR0FBQSxHQUFvQyxFQUFFLEtBQUk7SUFDMUcsSUFBQSxNQUFNLGFBQWEsR0FBTyxNQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLGNBQWMsQ0FBSyxFQUFBLEdBQUcsQ0FBQyxDQUFDO0lBRWxELElBQUEsSUFBSSxhQUFhLENBQUM7UUFFbEIsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ1gsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFO0lBQ3pELFlBQUEsYUFBYSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO0lBQzlELFNBQUE7SUFBTSxhQUFBO0lBQ0wsWUFBQSxhQUFhLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFBO0lBQ2pDLFNBQUE7SUFDRixLQUFBO0lBQU0sU0FBQTtZQUNMLGFBQWEsR0FBRyxFQUFFLENBQUE7SUFDbkIsS0FBQTtJQUdELElBQUEsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsY0FBYyxDQUFDLEdBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUN2RixNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtRQUMxRCxNQUFNLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFNUUsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ2pELElBQUEsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ2hDLElBQUEsTUFBTSxPQUFPLEdBQUcsb0JBQW9CLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUU5RSxPQUFPLFdBQVcsR0FBRyxhQUFhLENBQUMsTUFBTSxHQUFHLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUE7SUFDbkksRUFBQztBQUVZLFVBQUEsY0FBYyxHQUFHLENBQUMsS0FBZ0MsR0FBQSxDQUFDLEVBQUUsR0FBQSxHQUFvQyxFQUFFLEtBQUk7SUFDMUcsSUFBQSxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFN0QsSUFBQSxNQUFNLFNBQVMsR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBRTdCLElBQUEsTUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFM0MsSUFBRyxhQUFhLENBQUMsU0FBUyxFQUFFO1lBQzFCLE9BQU8sUUFBUSxDQUFDLENBQUEsRUFBRyxVQUFVLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxjQUFjLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBLEVBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFFLENBQUEsQ0FBQyxDQUFBO0lBQzFHLEtBQUE7SUFFRCxJQUFBLE1BQU0sa0JBQWtCLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQTtRQUNoRixNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3BFLElBQUEsT0FBTyxrQkFBa0IsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQy9FLEVBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUFFLEtBQUEsR0FBeUIsQ0FBQyxFQUFBO0lBQ25ELElBQUEsT0FBTyxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO0lBQzNELENBQUM7SUFFRDtJQUNBLFNBQVMsS0FBSyxDQUFDLFNBQWlCLEVBQUE7SUFDOUIsSUFBQSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDN0MsQ0FBQztJQUVELFNBQVMsaUJBQWlCLENBQUUsT0FBZSxFQUFFLFNBQWlCLEVBQUE7UUFDNUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDbkMsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUN2QyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUVELFNBQVMsb0JBQW9CLENBQUUsT0FBZSxFQUFFLFNBQWlCLEVBQUE7UUFDL0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLENBQUssRUFBQSxFQUFBLFNBQVMsQ0FBRSxDQUFBLENBQUMsQ0FBQTtJQUNwRSxDQUFDO0lBRUQsU0FBUyxxQkFBcUIsQ0FBRSxPQUFlLEVBQUUsT0FBZSxFQUFFLFNBQWlCLEVBQUE7SUFDakYsSUFBQSxJQUFJLE9BQU8sRUFBRTtJQUNYLFFBQUEsT0FBTyxPQUFPLEdBQUcsU0FBUyxHQUFHLE9BQU8sQ0FBQztJQUN0QyxLQUFBO0lBRUQsSUFBQSxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQsU0FBUyxVQUFVLENBQUMsTUFBdUIsRUFBRSxjQUFjLEdBQUcsSUFBSSxFQUFBO0lBQ2hFLElBQUEsSUFBRyxDQUFDLGNBQWM7SUFBRSxRQUFBLE9BQU8sS0FBSyxDQUFBO0lBRWhDLElBQUEsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2hDLElBQUEsTUFBTSxVQUFVLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDakUsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFNUMsSUFBQSxPQUFPLFVBQVUsSUFBSSxDQUFDLGFBQWEsQ0FBQTtJQUNyQyxDQUFDO0FBRVksVUFBQSxZQUFZLEdBQUc7UUFDMUIsWUFBWTtRQUNaLGNBQWM7OztVQzlFSCxPQUFPLENBQUE7SUFRbEIsSUFBQSxXQUFBLENBQVksT0FBeUIsRUFBQTtJQUxyQyxRQUFBLElBQUEsQ0FBQSxZQUFZLEdBQVcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQy9ELElBQVUsQ0FBQSxVQUFBLEdBQWdCLFNBQVMsQ0FBQTtZQUNuQyxJQUFRLENBQUEsUUFBQSxHQUFXLEtBQUssQ0FBQTtZQUN4QixJQUFLLENBQUEsS0FBQSxHQUFjLElBQUksQ0FBQTtZQUdyQixJQUFHLENBQUMsT0FBTyxDQUFDLEdBQUc7SUFBRSxZQUFBLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtZQUNuRCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDcEQsSUFBRyxPQUFPLENBQUMsWUFBWTtJQUFHLFlBQUEsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFBO1lBQ2xFLElBQUcsT0FBTyxDQUFDLFVBQVU7SUFBRyxZQUFBLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQTtZQUM1RCxJQUFHLE9BQU8sQ0FBQyxRQUFRO0lBQUcsWUFBQSxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUE7WUFDdEQsSUFBRyxPQUFPLENBQUMsS0FBSztJQUFHLFlBQUEsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFBO1NBQzlDO0lBRUQsSUFBQSx1QkFBdUIsQ0FBQyxHQUFXLEVBQUE7SUFDakMsUUFBQSxJQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHO0lBQUUsWUFBQSxPQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDekMsUUFBQSxPQUFPLEdBQUcsQ0FBQTtTQUNYO0lBRUYsQ0FBQTtVQUVZLGdCQUFnQixDQUFBO0lBTTNCLElBQUEsV0FBQSxDQUFZLE9BQWUsRUFBQTtZQUozQixJQUFPLENBQUEsT0FBQSxHQUFXLEVBQUUsQ0FBQTtZQUNwQixJQUFLLENBQUEsS0FBQSxHQUFjLEVBQUUsQ0FBQTtZQUNyQixJQUFpQixDQUFBLGlCQUFBLEdBQVcsRUFBRSxDQUFBO0lBRzVCLFFBQUEsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7SUFDdEIsUUFBQSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQTtTQUNoQjtJQUVELElBQUEsSUFBWSxTQUFTLEdBQUE7SUFDdkIsUUFBQSxNQUFNLE1BQU0sR0FDWixDQUFBO0FBQ0csRUFBQSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQSx1QkFBQSxFQUEyQixJQUFJLENBQUMsaUJBQWtCLENBQUEsbUJBQUEsQ0FBcUIsR0FBRyxFQUFHLENBQUE7O0NBRXhHLENBQUE7SUFDRCxRQUFBLE9BQU8sTUFBTSxDQUFBO1NBQ1Y7SUFFRCxJQUFBLElBQVksT0FBTyxHQUFBO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUk7SUFDN0IsWUFBQSxJQUFJLFVBQVUsR0FDcEIsQ0FBQTs7V0FFWSxJQUFJLENBQUMsT0FBUSxDQUFJLEVBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxHQUFHLElBQUssSUFBSSxDQUFDLEdBQUksQ0FBRyxDQUFBLENBQUE7QUFDakQsY0FBQSxFQUFBLElBQUksQ0FBQyxRQUFRLENBQUE7QUFDZCxhQUFBLEVBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQTtrQkFDZCxJQUFJLENBQUMsVUFBVSxDQUFBLGFBQUEsQ0FBZSxDQUFBO2dCQUU1QyxJQUFHLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBRWIsVUFBVTtJQUNoQixvQkFBQSxDQUFBOztxQkFFcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUE7eUJBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUE7dUJBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFBO3FCQUNsQixDQUFBO0lBQ2hCLGFBQUE7Z0JBQ0QsVUFBVTtJQUNkLGdCQUFBLENBQUE7O0NBRUMsQ0FBQTtJQUNELFlBQUEsT0FBTyxVQUFVLENBQUE7SUFFZixTQUFDLENBQUM7aUJBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBRVI7SUFFRCxJQUFBLElBQVksU0FBUyxHQUFBO0lBQ25CLFFBQUEsT0FBTyxXQUFXLENBQUE7U0FDbkI7SUFFTSxJQUFBLG9CQUFvQixDQUFDLElBQVksRUFBQTtJQUN0QyxRQUFBLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUE7U0FDOUI7SUFFTSxJQUFBLE9BQU8sQ0FBQyxPQUF5QixFQUFBO1lBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7U0FDdEM7UUFFTSxRQUFRLEdBQUE7SUFDYixRQUFBLE1BQU0sTUFBTSxHQUNoQixDQUFBO0FBQ0csRUFBQSxJQUFJLENBQUMsU0FBVSxDQUFBO0FBQ2YsRUFBQSxJQUFJLENBQUMsT0FBUSxDQUFBO0FBQ2IsRUFBQSxJQUFJLENBQUMsU0FBVSxDQUFBO0NBQ2pCLENBQUE7SUFDRyxRQUFBLE9BQU8sTUFBTSxDQUFBO1NBQ2Q7SUFFRjs7QUNsSFksVUFBQSxlQUFlLEdBQUcsQ0FBQyxHQUFXLEtBQVk7SUFDckQsSUFBQSxPQUFPLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN2SCxFQUFDO0FBRVksVUFBQSxZQUFZLEdBQUcsQ0FBQyxNQUFjLEtBQVk7UUFDckQsSUFBSSxNQUFNLEdBQWEsRUFBRSxDQUFBO1FBQ3pCLElBQUksVUFBVSxHQUFTLGdFQUFnRSxDQUFBO0lBQ3ZGLElBQUEsSUFBSSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFBO1FBQ3hDLEtBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUc7SUFDaEMsUUFBQSxNQUFNLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUE7SUFDM0UsS0FBQTtJQUNELElBQUEsT0FBTyxNQUFNLENBQUE7SUFDZixFQUFDO0FBRVksVUFBQSxnQkFBZ0IsR0FBRyxDQUFDLENBQWEsRUFBRSxhQUFhLEdBQUcsT0FBTyxLQUFJO1FBQ3pFLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLGFBQWEsQ0FBQyxDQUFBO0lBQzVGLEVBQUM7SUFFRCxTQUFTLFdBQVcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFBO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTtJQUVqQixJQUFBLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ2hDLFFBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbEIsS0FBQTtJQUVELElBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNuQixLQUFBO0lBRUQsSUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUNoQyxRQUFBLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ2hDLFlBQUEsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtJQUNyQyxnQkFBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDdEMsYUFBQTtJQUFNLGlCQUFBO29CQUNILE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUNuQixNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ3hCLElBQUksQ0FBQyxHQUFHLENBQ0osTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ3BCLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUN2QixDQUNKLENBQUE7SUFDSixhQUFBO0lBQ0osU0FBQTtJQUNKLEtBQUE7UUFFRCxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ25DLENBQUM7QUFFTSxVQUFNLHFCQUFxQixHQUFHLENBQUMsSUFBWSxFQUFFLGVBQXVCLEVBQUUsZUFBQSxHQUEyQixJQUFJLEtBQVk7SUFDdEgsSUFBQSxJQUFHLGVBQWUsRUFBRTtJQUNsQixRQUFBLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDekIsUUFBQSxlQUFlLEdBQUcsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ2hELEtBQUE7UUFDRCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFBO0lBQ25ELElBQUEsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUM1RCxJQUFBLE1BQU0sVUFBVSxHQUFHLENBQUMsR0FBRyxRQUFRLEdBQUcsTUFBTSxDQUFBO0lBQ3hDLElBQUEsT0FBTyxVQUFVLENBQUE7SUFDbkIsRUFBQztBQUVNLFVBQU0sb0JBQW9CLEdBQUcsQ0FBQyxJQUFZLEVBQUUsZUFBdUIsRUFBRSxZQUFvQixHQUFHLEVBQUUsZUFBMkIsR0FBQSxJQUFJLEtBQWE7UUFDL0ksT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxJQUFJLFNBQVMsQ0FBQTtJQUNuRixFQUFDO1VBRVkseUJBQXlCLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxLQUFJO0lBQ3BELElBQUEsSUFBSSxDQUFDLEdBQUc7SUFBRSxRQUFBLE9BQU8sRUFBRSxDQUFBO0lBQ25CLElBQUEsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFBO0lBQ3BDLElBQUEsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUMvRyxFQUFDO0FBRVksVUFBQSxZQUFZLEdBQUcsQ0FBQyxJQUFlLEdBQUEsRUFBRSxFQUFFLEdBQUEsR0FBYyxFQUFFLEtBQUk7UUFDbEUsSUFBSTtJQUNGLFFBQUEsSUFBRyxDQUFDLElBQUk7SUFBRSxZQUFBLE9BQU8sRUFBRSxDQUFBO1lBQ25CLElBQUcsR0FBRyxJQUFJLENBQUM7Z0JBQUUsT0FBTyxJQUFJLEdBQUcsS0FBSyxDQUFBO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQSxFQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0lBQ2pFLEtBQUE7SUFBQyxJQUFBLE9BQU8sS0FBSyxFQUFFO1lBQ2QsT0FBTyxJQUFJLElBQUksRUFBRSxDQUFBO0lBQ2xCLEtBQUE7SUFDSCxFQUFDO0FBRVksVUFBQSxhQUFhLEdBQUc7UUFDM0IsZUFBZTtRQUNmLFlBQVk7UUFDWixnQkFBZ0I7UUFDaEIscUJBQXFCO1FBQ3JCLG9CQUFvQjtRQUNwQix5QkFBeUI7UUFDekIsWUFBWTs7O1VDckZELGFBQWEsR0FBRyxDQUFDLElBQVksRUFBRSxLQUFhLEtBQW1CO1FBQzFFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ3ZDLE9BQU8sQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7SUFDOUIsRUFBQztBQUVZLFVBQUEsY0FBYyxHQUFHLENBQUMsSUFBWSxLQUFtQjtRQUM1RCxNQUFNLEtBQUssR0FBRywrRUFBK0UsQ0FBQTtJQUM3RixJQUFBLE9BQU8sYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNuQyxFQUFDO0FBRVksVUFBQSxZQUFZLEdBQUc7UUFDMUIsYUFBYTtRQUNiLGNBQWM7OztJQ2JRLFNBQUEsTUFBTSxDQUFFLEtBQW9CLEVBQUUsSUFBUyxFQUFFLE1BQU0sR0FBRyxJQUFJLEVBQUUsTUFBVyxFQUFBO0lBQ3pGLElBQUEsS0FBSyxHQUFHLEtBQUssSUFBSSxFQUFFLENBQUE7SUFDbkIsSUFBQSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQTtRQUNqQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUE7UUFDYixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUE7UUFDZixPQUFPLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO0lBQ25ELFFBQUEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3ZCLFFBQUEsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzVCLFFBQUEsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzVCLFFBQUEsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUM1QixJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0lBQ2hDLGdCQUFBLE1BQU0sSUFBSSxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFBO0lBQzdELGdCQUFBLEtBQUssRUFBRSxDQUFBO0lBQ1IsYUFBQTtJQUNELFlBQUEsTUFBTSxFQUFFLENBQUE7SUFDVCxTQUFBO0lBQU0sYUFBQTtJQUNMLFlBQUEsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtvQkFDM0IsS0FBSyxFQUFFLENBQUE7SUFDUCxnQkFBQSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3BCLGFBQUE7SUFDRCxZQUFBLElBQUksTUFBTTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFBO2dCQUMzQixJQUFJLE1BQU0sS0FBSyxLQUFLO29CQUFFLE1BQU0sRUFBRSxDQUFBO0lBQzlCLFlBQUEsS0FBSyxFQUFFLENBQUE7SUFDUixTQUFBO0lBQ0YsS0FBQTs7UUFHRCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUE7SUFDbkIsSUFBQSxPQUFPLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sRUFBRTtJQUNwQyxRQUFBLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN2QixRQUFBLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNqQixVQUFVLEdBQUcsRUFBRSxDQUFBO2dCQUNmLE1BQUs7SUFDTixTQUFBO1lBQ0QsVUFBVSxJQUFJLEtBQUssQ0FBQTtJQUNuQixRQUFBLEtBQUssRUFBRSxDQUFBO0lBQ1IsS0FBQTtRQUVELE9BQU8sTUFBTSxHQUFHLFVBQVUsQ0FBQTtJQUM1Qjs7SUN4Q3dCLFNBQUEsV0FBVyxDQUFFLE1BQVcsRUFBRSxLQUFZLEVBQUUsTUFBVyxFQUFBO1FBQ3pFLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqRCxJQUFBLE9BQU8sVUFBVSxLQUFVLEVBQUUsSUFBUyxFQUFFLE1BQU0sR0FBRyxJQUFJLEVBQUE7WUFDbkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ1QsUUFBQSxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO0lBQ3ZCLFlBQUEsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzFCLFlBQUEsQ0FBQyxFQUFFLENBQUE7SUFDSCxZQUFBLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDdkIsSUFBSSxFQUFHLFFBQVEsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRztvQkFDdEYsT0FBTyxNQUFNLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDbEQsYUFBQTtJQUNGLFNBQUE7SUFDRCxRQUFBLE9BQU8sRUFBRSxDQUFBO0lBQ1gsS0FBQyxDQUFBO0lBQ0g7O0FDZEEsaUJBQWU7SUFDYixJQUFBLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7SUFDdEIsSUFBQSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFO0lBQzdCLElBQUEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRTtJQUMxQixJQUFBLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBUyxLQUFLLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO0lBQzNFLElBQUEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFTLEtBQUssQ0FBQyxDQUFDLGlCQUFpQixFQUFFLEVBQUU7SUFDM0UsSUFBQSxHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0tBQ3RCOztJQ0hNLE1BQU0sTUFBTSxHQUFHLFVBQVUsS0FBVSxFQUFFLElBQVMsRUFBRSxNQUFNLEdBQUcsSUFBSSxFQUFBO0lBRWxFLElBQUEsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUVyQixJQUFBLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDeEIsVUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7Y0FDOUQsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBRXpDLENBQUM7O0lDWE0sTUFBTSxpQkFBaUIsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ3pELE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFBO0lBQ2hFLE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxxQkFBcUIsRUFBRzs7VUNBdEgsSUFBSSxHQUFHLENBQUMsS0FBVSxFQUFFLElBQVMsS0FBSTtRQUM1QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ2xDLEVBQUM7VUFFWSxNQUFNLEdBQUcsQ0FBQyxLQUFVLEVBQUUsSUFBUyxLQUFJO1FBQzlDLE9BQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDbkMsRUFBQztBQUVZLFVBQUEsTUFBTSxHQUFHO1FBQ3BCLElBQUk7UUFDSixNQUFNO1FBQ04saUJBQWlCO1FBQ2pCLGtCQUFrQjtRQUNsQiwyQkFBMkI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
