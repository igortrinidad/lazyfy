
  /**
   * @license
   * author: igortrindade.dev
   * lazyfy.js v2.61.0
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
    const getObjectMapped = (object = {}) => {
        return Object.keys(object).map((key) => {
            return Object.assign(Object.assign({}, object[key]), { key: key });
        });
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
        deepSearchKey,
        getObjectMapped
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
    const chunkArray = (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };
    const getRandomWeithedElementsInArrays = (lists, weights, count) => {
        if (lists.length !== weights.length) {
            throw new Error('Lists and weights arrays must have the same length');
        }
        if (lists.length === 0 || weights.length === 0 || count <= 0) {
            return [];
        }
        // Criar cópias das listas para não modificar as originais
        const availableLists = lists.map(list => [...list]);
        const availableWeights = [...weights];
        // Normalizar os pesos para criar uma distribuição de probabilidade
        const normalizeWeights = (weights) => {
            const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
            if (totalWeight === 0)
                return weights.map(() => 0);
            return weights.map(weight => weight / totalWeight);
        };
        const result = [];
        for (let i = 0; i < count; i++) {
            // Verificar se ainda existem listas com itens
            const listsWithItems = availableLists
                .map((list, index) => ({ list, index, weight: availableWeights[index] }))
                .filter(item => item.list.length > 0);
            if (listsWithItems.length === 0) {
                break; // Não há mais itens disponíveis
            }
            // Recalcular pesos apenas para listas que ainda têm itens
            const activeWeights = listsWithItems.map(item => item.weight);
            const normalizedWeights = normalizeWeights(activeWeights);
            // Criar intervalos acumulativos para seleção por peso
            const cumulativeWeights = [];
            let cumulative = 0;
            for (const weight of normalizedWeights) {
                cumulative += weight;
                cumulativeWeights.push(cumulative);
            }
            const random = Math.random();
            // Encontrar qual lista deve ser selecionada baseado no peso
            let selectedListIndex = 0;
            for (let j = 0; j < cumulativeWeights.length; j++) {
                if (random <= cumulativeWeights[j]) {
                    selectedListIndex = j;
                    break;
                }
            }
            // Pegar o índice real da lista original
            const realListIndex = listsWithItems[selectedListIndex].index;
            const selectedList = availableLists[realListIndex];
            if (selectedList.length > 0) {
                const element = getRandomElement(selectedList);
                result.push(element);
                // Remover o elemento selecionado da lista para evitar repetição
                const elementIndex = selectedList.indexOf(element);
                selectedList.splice(elementIndex, 1);
            }
        }
        return result;
    };
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
        getRandomElement,
        chunkArray,
        getRandomWeithedElementsInArrays
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
    const getPercentageOfAmount = (amount, value, percentageSign = false, digits = 2, returnWhenAmountIsZero = '--') => {
        const amt = getParsedValue(amount);
        if (amt === 0 && typeof returnWhenAmountIsZero !== 'undefined') {
            return returnWhenAmountIsZero;
        }
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
    const debounce = (callback, timeout = 300) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                callback(...args);
            }, timeout);
        };
    };
    const CommonHelpers = {
        downloadRawData,
        copyToClipboard,
        getLetterByNumber,
        clearBrowserCache,
        clearBrowserCacheListener,
        removeAllCookies,
        debounce
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
    const removeAccents = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    const checkStringSimilarity = (base, stringToCompare, caseInsensitive = true) => {
        if (caseInsensitive) {
            base = base.toLowerCase();
            stringToCompare = stringToCompare.toLowerCase();
        }
        // Remove acentos para comparação
        base = removeAccents(base);
        stringToCompare = removeAccents(stringToCompare);
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
    const findSimilarItems = (items, searchText, options = {}) => {
        const { threshold: userThreshold, caseInsensitive = true, splitWords = false, searchKeys = [] } = options;
        // Use a lower threshold for split words to allow more fuzzy matches of individual words
        // Use a higher threshold for exact phrase matching when splitWords is false
        const threshold = userThreshold !== null && userThreshold !== void 0 ? userThreshold : (splitWords ? 0.5 : 0.8);
        if (!searchText)
            return [];
        const searchTerms = splitWords
            ? searchText.split(/\s+/).filter(term => term.length > 0)
            : [searchText];
        return items.filter(item => {
            if (item === null || item === undefined) {
                return false;
            }
            // Handle string items
            if (typeof item === 'string') {
                if (splitWords) {
                    const itemWords = item.split(/\s+/).filter(w => w.length > 0);
                    return searchTerms.every(searchTerm => itemWords.some(word => {
                        // Try exact substring match first
                        if (caseInsensitive) {
                            if (word.toLowerCase().includes(searchTerm.toLowerCase())) {
                                return true;
                            }
                        }
                        else if (word.includes(searchTerm)) {
                            return true;
                        }
                        // Then try similarity match
                        return checkStringSimilarity(word, searchTerm, caseInsensitive) >= threshold;
                    }));
                }
                // For non-split words
                return searchTerms.some(term => {
                    // Try exact substring match first
                    if (caseInsensitive) {
                        if (item.toLowerCase().includes(term.toLowerCase())) {
                            return true;
                        }
                    }
                    else if (item.includes(term)) {
                        return true;
                    }
                    // Then try similarity match
                    return checkStringSimilarity(item, term, caseInsensitive) >= threshold;
                });
            }
            // Handle object items
            if (typeof item === 'object') {
                if (searchKeys.length === 0) {
                    return false;
                }
                return searchKeys.some(key => {
                    const value = item[key];
                    if (typeof value !== 'string') {
                        return false;
                    }
                    // For each search term
                    return searchTerms.every(searchTerm => {
                        // Always try full value similarity first
                        if (checkStringSimilarity(value, searchTerm, caseInsensitive) >= threshold) {
                            return true;
                        }
                        // Try exact substring match
                        if (caseInsensitive) {
                            if (value.toLowerCase().includes(searchTerm.toLowerCase())) {
                                return true;
                            }
                        }
                        else if (value.includes(searchTerm)) {
                            return true;
                        }
                        // If splitting words, try individual word matches
                        if (splitWords) {
                            const valueWords = value.split(/\s+/).filter(w => w.length > 0);
                            return valueWords.some(word => {
                                // Try exact match first
                                if (caseInsensitive) {
                                    if (word.toLowerCase().includes(searchTerm.toLowerCase())) {
                                        return true;
                                    }
                                }
                                else if (word.includes(searchTerm)) {
                                    return true;
                                }
                                // Then try similarity match on individual words
                                return checkStringSimilarity(word, searchTerm, caseInsensitive) >= threshold;
                            });
                        }
                        return false;
                    });
                });
            }
            return false;
        });
    };
    const titleCaseToSnakeCase = (str) => {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
    };
    const StringHelpers = {
        titleCaseString,
        randomString,
        joinCommaPlusAnd,
        checkStringSimilarity,
        checkStringIsSimilar,
        ensureStartsWithUpperCase,
        truncateText,
        findSimilarItems,
        titleCaseToSnakeCase,
    };

    const extractMatchs = (text, regex) => {
        const matches = text.match(regex) || [];
        return [...new Set(matches)];
    };
    const extractUuidsV4 = (text) => {
        const regex = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/g;
        return extractMatchs(text, regex);
    };
    const extractUuidsV7 = (text) => {
        const regex = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-7[a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}/g;
        return extractMatchs(text, regex);
    };
    const RegexHelpers = {
        extractMatchs,
        extractUuidsV4,
        extractUuidsV7
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

    const PHONE_FORMATS = {
        brazil: {
            countryCode: '+55',
            mask: ['(##) #####-####', '(##) ####-####'],
            digitCount: [11, 10]
        },
        us: { countryCode: '+1', mask: '(###) ###-####', digitCount: 10 },
        usa: { countryCode: '+1', mask: '(###) ###-####', digitCount: 10 },
        spain: { countryCode: '+34', mask: '### ### ###', digitCount: 9 },
        portugal: { countryCode: '+351', mask: '### ### ###', digitCount: 9 },
        argentina: { countryCode: '+54', mask: '(##) ####-####', digitCount: 10 },
        italy: { countryCode: '+39', mask: '### ### ####', digitCount: 10 },
        switzerland: { countryCode: '+41', mask: '## ### ## ##', digitCount: 9 },
        swiss: { countryCode: '+41', mask: '## ### ## ##', digitCount: 9 },
        france: { countryCode: '+33', mask: '# ## ## ## ##', digitCount: 9 },
        china: { countryCode: '+86', mask: '### #### ####', digitCount: 11 },
        russia: { countryCode: '+7', mask: '(###) ###-##-##', digitCount: 10 },
        canada: { countryCode: '+1', mask: '(###) ###-####', digitCount: 10 },
        mexico: { countryCode: '+52', mask: '(##) ####-####', digitCount: 10 },
        chile: { countryCode: '+56', mask: '# #### ####', digitCount: 9 },
        // Major European countries
        germany: { countryCode: '+49', mask: '#### ########', digitCount: 11 },
        uk: { countryCode: '+44', mask: '#### ### ####', digitCount: 10 },
        unitedkingdom: { countryCode: '+44', mask: '#### ### ####', digitCount: 10 },
        netherlands: { countryCode: '+31', mask: '# ########', digitCount: 9 },
        belgium: { countryCode: '+32', mask: '### ## ## ##', digitCount: 9 },
        austria: { countryCode: '+43', mask: '### #######', digitCount: 10 },
        poland: { countryCode: '+48', mask: '### ### ###', digitCount: 9 },
        sweden: { countryCode: '+46', mask: '## ### ## ##', digitCount: 9 },
        norway: { countryCode: '+47', mask: '### ## ###', digitCount: 8 },
        denmark: { countryCode: '+45', mask: '## ## ## ##', digitCount: 8 },
        finland: { countryCode: '+358', mask: '## ### ####', digitCount: 9 },
        // Major Asian countries
        japan: { countryCode: '+81', mask: '##-####-####', digitCount: 10 },
        southkorea: { countryCode: '+82', mask: '##-####-####', digitCount: 10 },
        korea: { countryCode: '+82', mask: '##-####-####', digitCount: 10 },
        india: { countryCode: '+91', mask: '##### #####', digitCount: 10 },
        singapore: { countryCode: '+65', mask: '#### ####', digitCount: 8 },
        malaysia: { countryCode: '+60', mask: '##-### ####', digitCount: 9 },
        thailand: { countryCode: '+66', mask: '##-###-####', digitCount: 9 },
        vietnam: { countryCode: '+84', mask: '##-#### ####', digitCount: 9 },
        philippines: { countryCode: '+63', mask: '###-###-####', digitCount: 10 },
        indonesia: { countryCode: '+62', mask: '##-####-####', digitCount: 10 },
        // Major countries in Americas
        colombia: { countryCode: '+57', mask: '### ### ####', digitCount: 10 },
        venezuela: { countryCode: '+58', mask: '###-#######', digitCount: 10 },
        peru: { countryCode: '+51', mask: '### ### ###', digitCount: 9 },
        ecuador: { countryCode: '+593', mask: '##-### ####', digitCount: 9 },
        uruguay: { countryCode: '+598', mask: '## ### ###', digitCount: 8 },
        paraguay: { countryCode: '+595', mask: '### ######', digitCount: 9 },
        bolivia: { countryCode: '+591', mask: '########', digitCount: 8 },
        // Major African countries
        southafrica: { countryCode: '+27', mask: '## ### ####', digitCount: 9 },
        nigeria: { countryCode: '+234', mask: '### ### ####', digitCount: 10 },
        egypt: { countryCode: '+20', mask: '### ### ####', digitCount: 10 },
        morocco: { countryCode: '+212', mask: '###-######', digitCount: 9 },
        algeria: { countryCode: '+213', mask: '### ## ## ##', digitCount: 9 },
        // Major Oceania countries
        australia: { countryCode: '+61', mask: '### ### ###', digitCount: 9 },
        newzealand: { countryCode: '+64', mask: '##-### ####', digitCount: 9 },
        // Middle East
        israel: { countryCode: '+972', mask: '##-###-####', digitCount: 9 },
        uae: { countryCode: '+971', mask: '##-### ####', digitCount: 9 },
        unitedarabemirates: { countryCode: '+971', mask: '##-### ####', digitCount: 9 },
        saudiarabia: { countryCode: '+966', mask: '##-###-####', digitCount: 9 },
        turkey: { countryCode: '+90', mask: '### ### ## ##', digitCount: 10 }
    };
    // Country code to country mapping for prediction
    const COUNTRY_CODE_MAP = {
        '1': 'us',
        '7': 'russia',
        '20': 'egypt',
        '27': 'southafrica',
        '31': 'netherlands',
        '32': 'belgium',
        '33': 'france',
        '34': 'spain',
        '39': 'italy',
        '41': 'switzerland',
        '43': 'austria',
        '44': 'uk',
        '45': 'denmark',
        '46': 'sweden',
        '47': 'norway',
        '48': 'poland',
        '49': 'germany',
        '51': 'peru',
        '52': 'mexico',
        '54': 'argentina',
        '55': 'brazil',
        '56': 'chile',
        '57': 'colombia',
        '58': 'venezuela',
        '60': 'malaysia',
        '61': 'australia',
        '62': 'indonesia',
        '63': 'philippines',
        '64': 'newzealand',
        '65': 'singapore',
        '66': 'thailand',
        '81': 'japan',
        '82': 'southkorea',
        '84': 'vietnam',
        '86': 'china',
        '90': 'turkey',
        '91': 'india',
        '212': 'morocco',
        '213': 'algeria',
        '234': 'nigeria',
        '351': 'portugal',
        '358': 'finland',
        '591': 'bolivia',
        '593': 'ecuador',
        '595': 'paraguay',
        '598': 'uruguay',
        '966': 'saudiarabia',
        '971': 'uae',
        '972': 'israel'
    };
    /**
     * Predicts the country based on the phone number's country code
     * @param phoneNumber - The phone number to analyze
     * @returns The predicted country name or null if not found
     */
    const predictCountryFromPhoneNumber = (phoneNumber) => {
        if (!phoneNumber)
            return null;
        // Remove all non-numeric characters
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        // Must have at least 10 digits (minimum international number length with country code)
        if (cleanNumber.length < 10)
            return null;
        // Check for country codes starting from longest to shortest
        const sortedCountryCodes = Object.keys(COUNTRY_CODE_MAP).sort((a, b) => b.length - a.length);
        for (const countryCode of sortedCountryCodes) {
            if (cleanNumber.startsWith(countryCode)) {
                // Additional validation: check if the number after removing country code
                // has a reasonable length for that country
                const remainingDigits = cleanNumber.slice(countryCode.length);
                const countryName = COUNTRY_CODE_MAP[countryCode];
                const config = PHONE_FORMATS[countryName];
                if (config) {
                    const expectedCounts = Array.isArray(config.digitCount) ? config.digitCount : [config.digitCount];
                    if (expectedCounts.includes(remainingDigits.length)) {
                        // For single-digit country codes like "1" or "7", be more strict
                        // Only accept if the total length is reasonable for international format
                        if (countryCode.length === 1) {
                            // For US/Canada (+1), total should be 11 digits minimum (1 + 10)
                            // For Russia (+7), total should be 11 digits minimum (7 + 10)
                            const totalLength = cleanNumber.length;
                            if (countryCode === '1' && totalLength === 11 && remainingDigits.length === 10) {
                                // Additional check for US/Canada: area code shouldn't start with 0 or 1
                                const areaCode = remainingDigits.substring(0, 3);
                                if (areaCode[0] !== '0' && areaCode[0] !== '1') {
                                    return countryName;
                                }
                            }
                            else if (countryCode === '7' && totalLength === 11 && remainingDigits.length === 10) {
                                return countryName;
                            }
                        }
                        else {
                            // For multi-digit country codes, use normal validation
                            return countryName;
                        }
                    }
                }
            }
        }
        return null;
    };
    /**
     * Formats a phone number with country code based on the specified country
     * @param phoneNumber - The phone number to format (digits only)
     * @param country - The country code (e.g., 'brazil', 'us', 'spain') - optional, will be predicted if not provided
     * @param throwsErrorOnValidation - Whether to throw errors on validation failures (default: false)
     * @returns Formatted phone number with country code
     */
    const formatPhoneWithCountryCode = (phoneNumber, country, throwsErrorOnValidation = false) => {
        if (!phoneNumber) {
            if (throwsErrorOnValidation) {
                throw new Error('Phone number is required');
            }
            return masker(phoneNumber, DEFAULT_PHONE_MASK_WITH_DDI, true);
        }
        // If no country is provided, try to predict it from the phone number
        let finalCountry = country;
        if (!finalCountry) {
            const predictedCountry = predictCountryFromPhoneNumber(phoneNumber);
            if (predictedCountry) {
                finalCountry = predictedCountry;
            }
            else {
                if (throwsErrorOnValidation) {
                    throw new Error('Could not predict country from phone number and no country was provided');
                }
                return masker(phoneNumber, DEFAULT_PHONE_MASK_WITH_DDI, true);
            }
        }
        const countryKey = finalCountry.toLowerCase();
        const config = PHONE_FORMATS[countryKey];
        if (!config) {
            if (throwsErrorOnValidation) {
                throw new Error(`Country '${finalCountry}' is not supported. Supported countries: ${Object.keys(PHONE_FORMATS).join(', ')}`);
            }
            return masker(phoneNumber, DEFAULT_PHONE_MASK_WITH_DDI, true);
        }
        // Remove all non-numeric characters
        let cleanNumber = phoneNumber.replace(/\D/g, '');
        // Handle cases where country code is already included in the input
        const countryCodeDigits = config.countryCode.replace(/\D/g, '');
        if (cleanNumber.startsWith(countryCodeDigits)) {
            cleanNumber = cleanNumber.slice(countryCodeDigits.length);
        }
        // Handle multiple formats (like Brazil with both mobile and landline)
        if (Array.isArray(config.digitCount)) {
            const validIndex = config.digitCount.findIndex((count) => cleanNumber.length === count);
            if (validIndex === -1) {
                if (throwsErrorOnValidation) {
                    throw new Error(`Phone number for ${finalCountry} should have ${config.digitCount.join(' or ')} digits, but got ${cleanNumber.length}`);
                }
                return masker(phoneNumber, DEFAULT_PHONE_MASK_WITH_DDI, true);
            }
            const selectedMask = Array.isArray(config.mask) ? config.mask[validIndex] : config.mask;
            const maskedNumber = masker(cleanNumber, selectedMask, true);
            return `${config.countryCode} ${maskedNumber}`;
        }
        else {
            // Handle single format countries
            if (cleanNumber.length !== config.digitCount) {
                if (throwsErrorOnValidation) {
                    throw new Error(`Phone number for ${finalCountry} should have ${config.digitCount} digits, but got ${cleanNumber.length}`);
                }
                return masker(phoneNumber, DEFAULT_PHONE_MASK_WITH_DDI, true);
            }
            const selectedMask = Array.isArray(config.mask) ? config.mask[0] : config.mask;
            const maskedNumber = masker(cleanNumber, selectedMask, true);
            return `${config.countryCode} ${maskedNumber}`;
        }
    };
    /**
     * Gets the country code for a specific country
     * @param country - The country name
     * @returns The country code (e.g., '+55' for Brazil)
     */
    const getCountryCode = (country) => {
        const countryKey = country.toLowerCase();
        const config = PHONE_FORMATS[countryKey];
        if (!config) {
            throw new Error(`Country '${country}' is not supported. Supported countries: ${Object.keys(PHONE_FORMATS).join(', ')}`);
        }
        return config.countryCode;
    };
    /**
     * Gets all supported countries for phone formatting
     * @returns Array of supported country names
     */
    const getSupportedCountries = () => {
        return Object.keys(PHONE_FORMATS);
    };
    /**
     * Validates if a phone number is valid for a specific country
     * @param phoneNumber - The phone number to validate
     * @param country - The country code (optional, will be predicted if not provided)
     * @returns True if valid, false otherwise
     */
    const isValidPhoneNumber = (phoneNumber, country) => {
        try {
            formatPhoneWithCountryCode(phoneNumber, country, true);
            return true;
        }
        catch (_a) {
            return false;
        }
    };
    /**
     * Predicts the country based on the phone number's country code
     * @param phoneNumber - The phone number to analyze
     * @returns The predicted country name or null if not found
     */
    const predictCountryFromPhone = (phoneNumber) => {
        return predictCountryFromPhoneNumber(phoneNumber);
    };
    /**
     * Gets the valid digit counts for a specific country
     * @param country - The country name
     * @returns Array of valid digit counts
     */
    const getValidDigitCounts = (country) => {
        const countryKey = country.toLowerCase();
        const config = PHONE_FORMATS[countryKey];
        if (!config) {
            throw new Error(`Country '${country}' is not supported. Supported countries: ${Object.keys(PHONE_FORMATS).join(', ')}`);
        }
        return Array.isArray(config.digitCount) ? config.digitCount : [config.digitCount];
    };
    /**
     * Extracts the country code and phone number from a formatted phone number
     * @param phoneNumber - The phone number to extract from (can be formatted or unformatted)
     * @returns Object containing countryCode, phoneNumber (if complete), country, and mask, or only countryCode and country (if incomplete), or null if extraction fails
     */
    const extractCountryCodeAndPhone = (phoneNumber) => {
        if (!phoneNumber)
            return null;
        // Check if the original input contains letters mixed with numbers (invalid phone number)
        const hasLetters = /[a-zA-Z]/.test(phoneNumber);
        const hasNumbers = /\d/.test(phoneNumber);
        // If there are both letters and numbers, it's an invalid phone number
        if (hasLetters && hasNumbers) {
            // Allow specific cases like WhatsApp JIDs
            const isWhatsAppJid = /@(s\.whatsapp\.net|g\.us|c\.us)$/i.test(phoneNumber);
            if (!isWhatsAppJid) {
                return null;
            }
        }
        // Remove all non-numeric characters except the plus sign
        const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
        // If the number starts with +, extract country code from it
        if (cleanNumber.startsWith('+')) {
            const numberWithoutPlus = cleanNumber.slice(1);
            // Try to find matching country code
            const sortedCountryCodes = Object.keys(COUNTRY_CODE_MAP).sort((a, b) => b.length - a.length);
            for (const countryCode of sortedCountryCodes) {
                if (numberWithoutPlus.startsWith(countryCode)) {
                    const remainingNumber = numberWithoutPlus.slice(countryCode.length);
                    const countryName = COUNTRY_CODE_MAP[countryCode];
                    const config = PHONE_FORMATS[countryName];
                    if (config) {
                        const expectedCounts = Array.isArray(config.digitCount) ? config.digitCount : [config.digitCount];
                        // If the remaining number has the correct length, return complete information
                        if (expectedCounts.includes(remainingNumber.length)) {
                            // Additional validation for single-digit country codes
                            if (countryCode.length === 1) {
                                if (countryCode === '1' && remainingNumber.length === 10) {
                                    const areaCode = remainingNumber.substring(0, 3);
                                    if (areaCode[0] !== '0' && areaCode[0] !== '1') {
                                        return {
                                            countryCode: config.countryCode,
                                            phoneNumber: remainingNumber,
                                            country: countryName,
                                            mask: config.mask
                                        };
                                    }
                                }
                                else if (countryCode === '7' && remainingNumber.length === 10) {
                                    return {
                                        countryCode: config.countryCode,
                                        phoneNumber: remainingNumber,
                                        country: countryName,
                                        mask: config.mask
                                    };
                                }
                            }
                            else {
                                return {
                                    countryCode: config.countryCode,
                                    phoneNumber: remainingNumber,
                                    country: countryName,
                                    mask: config.mask
                                };
                            }
                        }
                        else {
                            // If the remaining number is shorter than expected, return only country code
                            const minExpectedCount = Math.min(...expectedCounts);
                            if (remainingNumber.length > 0 && remainingNumber.length < minExpectedCount) {
                                return {
                                    countryCode: config.countryCode,
                                    country: countryName,
                                    mask: config.mask
                                };
                            }
                        }
                    }
                }
            }
        }
        else {
            // If no + sign, try to predict country from the number
            const predictedCountry = predictCountryFromPhoneNumber(cleanNumber);
            if (predictedCountry) {
                const config = PHONE_FORMATS[predictedCountry];
                const countryCodeDigits = config.countryCode.replace(/\D/g, '');
                if (cleanNumber.startsWith(countryCodeDigits)) {
                    const phoneWithoutCountryCode = cleanNumber.slice(countryCodeDigits.length);
                    const expectedCounts = Array.isArray(config.digitCount) ? config.digitCount : [config.digitCount];
                    if (expectedCounts.includes(phoneWithoutCountryCode.length)) {
                        return {
                            countryCode: config.countryCode,
                            phoneNumber: phoneWithoutCountryCode,
                            country: predictedCountry,
                            mask: config.mask
                        };
                    }
                    else {
                        // If phone number is incomplete, return only country code
                        const minExpectedCount = Math.min(...expectedCounts);
                        if (phoneWithoutCountryCode.length > 0 && phoneWithoutCountryCode.length < minExpectedCount) {
                            return {
                                countryCode: config.countryCode,
                                country: predictedCountry,
                                mask: config.mask
                            };
                        }
                    }
                }
                else {
                    // Number without country code
                    const expectedCounts = Array.isArray(config.digitCount) ? config.digitCount : [config.digitCount];
                    if (expectedCounts.includes(cleanNumber.length)) {
                        return {
                            countryCode: config.countryCode,
                            phoneNumber: cleanNumber,
                            country: predictedCountry,
                            mask: config.mask
                        };
                    }
                }
            }
            // Check if it's a partial number that could match a country code
            const sortedCountryCodes = Object.keys(COUNTRY_CODE_MAP).sort((a, b) => b.length - a.length);
            for (const countryCode of sortedCountryCodes) {
                if (cleanNumber.startsWith(countryCode)) {
                    const remainingNumber = cleanNumber.slice(countryCode.length);
                    const countryName = COUNTRY_CODE_MAP[countryCode];
                    const config = PHONE_FORMATS[countryName];
                    if (config) {
                        const expectedCounts = Array.isArray(config.digitCount) ? config.digitCount : [config.digitCount];
                        const minExpectedCount = Math.min(...expectedCounts);
                        // If we have some digits but not enough for a complete number
                        if (remainingNumber.length > 0 && remainingNumber.length < minExpectedCount) {
                            return {
                                countryCode: config.countryCode,
                                country: countryName,
                                mask: config.mask
                            };
                        }
                    }
                }
            }
        }
        return null;
    };
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
        DEFAULT_PHONE_MASK_WITH_DDI,
        formatPhoneWithCountryCode,
        getCountryCode,
        getSupportedCountries,
        isValidPhoneNumber,
        getValidDigitCounts,
        predictCountryFromPhone,
        extractCountryCodeAndPhone
    };

    const mapArrayToGraphQL = (array, key = null) => {
        const items = array.map((item) => `"${key ? item[key] : item}"`).join(',');
        return `[${items}]`;
    };
    const GraphQLHelpers = {
        mapArrayToGraphQL
    };

    const formatFileSize = (bytes) => {
        if (bytes === null || bytes === undefined || bytes === '')
            return '0 Bytes';
        bytes = Number(bytes);
        if (isNaN(bytes) || bytes < 0 || bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatFileExtension = (file) => {
        return '.' + file.split('.').pop();
    };
    const formatFileName = (file) => {
        return file.split('/').pop();
    };
    const formatFileColor = (path) => {
        const extension = formatFileExtension(path);
        if (['.pdf'].includes(extension)) {
            return '#ef4444';
        }
        else if (['.doc', '.docx'].includes(extension)) {
            return '#3b82f6';
        }
        else if (['.xls', '.xlsx'].includes(extension)) {
            return '#22c55e';
        }
        else if (['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mpeg', '.webm', '.webp', '.svg'].includes(extension)) {
            return '#eab308';
        }
        return '#6b7280';
    };
    const getFileIcon = (path, provider = 'solar') => {
        const extension = formatFileExtension(path);
        if (['.pdf', '.doc', '.docx'].includes(extension)) {
            if (provider === 'solar') {
                return 'solar:document-text-line-duotone';
            }
        }
        else if (['.xls', '.xlsx'].includes(extension)) {
            if (provider === 'solar') {
                return 'solar:clipboard-list-line-duotone';
            }
        }
        else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(extension)) {
            if (provider === 'solar') {
                return 'solar:gallery-bold-duotone';
            }
        }
        else if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(extension)) {
            if (provider === 'solar') {
                return 'solar:archive-line-duotone';
            }
        }
        else if (['.mp3', '.wav', '.flac', '.aac', '.ogg'].includes(extension)) {
            if (provider === 'solar') {
                return 'solar:microphone-2-line-duotone';
            }
        }
        else if (['.mp4', '.webm', '.mov', '.avi', '.mpeg', '.mpg'].includes(extension)) {
            if (provider === 'solar') {
                return 'solar:chat-round-video-line-duotone';
            }
        }
        return 'solar:file-line-duotone';
    };

    const getWhatsappJidAndNumberValidated = (phone) => {
        let jid = formatPhoneNumberToWhatsappRemoteJid(phone);
        if (typeof jid === 'string') {
            jid = jid.replace(/:\d+(?=@)/, '');
        }
        validateRemoteJid(jid, phone);
        const number = jid.replace(/\D/g, '');
        return {
            jid,
            number
        };
    };
    const formatPhoneNumberToWhatsappRemoteJid = (number) => {
        number = String(number);
        if (number.includes('@g.us') || number.includes('@s.whatsapp.net') || number.includes('@lid')) {
            return number;
        }
        if (number.includes('@broadcast')) {
            return number;
        }
        number = number === null || number === void 0 ? void 0 : number.replace(/\s/g, '').replace(/\+/g, '').replace(/\(/g, '').replace(/\)/g, '').split(':')[0].split('@')[0];
        if (number.includes('-') && number.length >= 24) {
            number = number.replace(/[^\d-]/g, '');
            return `${number}@g.us`;
        }
        number = number.replace(/\D/g, '');
        if (number.length >= 18) {
            number = number.replace(/[^\d-]/g, '');
            return `${number}@g.us`;
        }
        number = formatMXOrARNumber(number);
        number = formatBRNumber(number);
        return `${number}@s.whatsapp.net`;
    };
    const formatMXOrARNumber = (jid) => {
        const countryCode = jid.substring(0, 2);
        if (Number(countryCode) === 52 || Number(countryCode) === 54) {
            if (jid.length === 13) {
                const number = countryCode + jid.substring(3);
                return number;
            }
            return jid;
        }
        return jid;
    };
    // Check if the number is br
    const formatBRNumber = (jid) => {
        const regexp = new RegExp(/^(\d{2})(\d{2})\d{1}(\d{8})$/);
        if (regexp.test(jid)) {
            const match = regexp.exec(jid);
            if (match && match[1] === '55') {
                const joker = Number.parseInt(match[3][0]);
                const ddd = Number.parseInt(match[2]);
                if (joker < 7 || ddd < 31) {
                    return match[0];
                }
                return match[1] + match[2] + match[3];
            }
            return jid;
        }
        else {
            return jid;
        }
    };
    const validateRemoteJid = (remote_jid, phone) => {
        const invalids = [null, '', '@s.whatsapp.net'];
        const isInvalidRemoteJid = invalids.some(invalid => remote_jid === invalid);
        if (isInvalidRemoteJid) {
            throw new Error(`Invalid remote_jid ${remote_jid} | phone: ${phone !== null && phone !== void 0 ? phone : ''}`);
        }
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
    exports.chunkArray = chunkArray;
    exports.clearBrowserCache = clearBrowserCache;
    exports.clearBrowserCacheListener = clearBrowserCacheListener;
    exports.compareArray = compareArray;
    exports.copyToClipboard = copyToClipboard;
    exports.debounce = debounce;
    exports.deepMergeObject = deepMergeObject;
    exports.deepSearchKey = deepSearchKey;
    exports.defineProperty = defineProperty;
    exports.deleteNestedObjectByKey = deleteNestedObjectByKey;
    exports.downloadRawData = downloadRawData;
    exports.ensureStartsWithUpperCase = ensureStartsWithUpperCase;
    exports.extractCountryCodeAndPhone = extractCountryCodeAndPhone;
    exports.extractMatchs = extractMatchs;
    exports.extractUuidsV4 = extractUuidsV4;
    exports.extractUuidsV7 = extractUuidsV7;
    exports.filterObjectKeys = filterObjectKeys;
    exports.find = find;
    exports.findAll = findAll;
    exports.findByObj = findByObj;
    exports.findByString = findByString;
    exports.findIndex = findIndex;
    exports.findSimilarItems = findSimilarItems;
    exports.formatFileColor = formatFileColor;
    exports.formatFileExtension = formatFileExtension;
    exports.formatFileName = formatFileName;
    exports.formatFileSize = formatFileSize;
    exports.formatNumber = formatNumber;
    exports.formatPhoneWithCountryCode = formatPhoneWithCountryCode;
    exports.getAmountOfPercentage = getAmountOfPercentage;
    exports.getCountryCode = getCountryCode;
    exports.getFileIcon = getFileIcon;
    exports.getLetterByNumber = getLetterByNumber;
    exports.getNestedObjectByKey = getNestedObjectByKey;
    exports.getObjectMapped = getObjectMapped;
    exports.getPercentageOfAmount = getPercentageOfAmount;
    exports.getRandomElement = getRandomElement;
    exports.getRandomWeithedElementsInArrays = getRandomWeithedElementsInArrays;
    exports.getSupportedCountries = getSupportedCountries;
    exports.getValidDigitCounts = getValidDigitCounts;
    exports.getValueOrMinPercentage = getValueOrMinPercentage;
    exports.getWhatsappJidAndNumberValidated = getWhatsappJidAndNumberValidated;
    exports.initClassData = initClassData;
    exports.isObject = isObject;
    exports.isValidPhoneNumber = isValidPhoneNumber;
    exports.joinCommaPlusAnd = joinCommaPlusAnd;
    exports.mapArrayToGraphQL = mapArrayToGraphQL;
    exports.mask = mask;
    exports.objArrayToCsv = objArrayToCsv;
    exports.predictCountryFromPhone = predictCountryFromPhone;
    exports.randomInt = randomInt;
    exports.randomString = randomString;
    exports.remove = remove;
    exports.removeAll = removeAll;
    exports.removeAllCookies = removeAllCookies;
    exports.round = round;
    exports.setNestedObjectByKey = setNestedObjectByKey;
    exports.shuffle = shuffle;
    exports.titleCaseString = titleCaseString;
    exports.titleCaseToSnakeCase = titleCaseToSnakeCase;
    exports.toggleInArray = toggleInArray;
    exports.truncateText = truncateText;
    exports.unformatNumber = unformatNumber;
    exports.uniqueByKey = uniqueByKey;
    exports.unmask = unmask;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eWZ5LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvVXRpbC50cyIsIi4uLy4uLy4uL3NyYy9PYmplY3RIZWxwZXJzLnRzIiwiLi4vLi4vLi4vc3JjL0FycmF5SGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9NYXRoSGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9Db21tb25IZWxwZXJzLnRzIiwiLi4vLi4vLi4vc3JjL3R5cGVzL051bWJlckZvcm1hdE9wdGlvbnMudHMiLCIuLi8uLi8uLi9zcmMvTnVtYmVyRm9ybWF0LnRzIiwiLi4vLi4vLi4vc3JjL1NpdGVNYXBHZW5lcmF0b3IudHMiLCIuLi8uLi8uLi9zcmMvU3RyaW5nSGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9SZWdleEhlbHBlcnMudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9tYXNraXQudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9keW5hbWljLW1hc2sudHMiLCIuLi8uLi8uLi9zcmMvbWFzay90b2tlbnMudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9tYXNrZXIudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9lbnVtcy50cyIsIi4uLy4uLy4uL3NyYy9NYXNrZXIudHMiLCIuLi8uLi8uLi9zcmMvR3JhcGhRTC9pbmRleC50cyIsIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2ZpbGUtaGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9mb3JtYXR0ZXJzL2dldFdoYXRzYXBwSmlkQW5kTnVtYmVyVmFsaWRhdGVkLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCByZW1hcEFycmF5VG9Mb3dlckNhc2VJZlN0cmluZyA9IChhcnI6IGFueVtdID0gW10pID0+IHtcbiAgcmV0dXJuIGFyci5tYXAoaXRlbSA9PiBsb3dlckNhc2VBbmRTdHJpbmdpZnlJZk51bWJlcihpdGVtKSlcbn1cblxuXG5leHBvcnQgY29uc3QgbG93ZXJDYXNlQW5kU3RyaW5naWZ5SWZOdW1iZXIgPSAoaXRlbTogYW55KSA9PiB7XG4gIGlmKHR5cGVvZihpdGVtKSA9PT0gJ3N0cmluZycpIHJldHVybiBpdGVtLnRvTG93ZXJDYXNlKClcbiAgaWYodHlwZW9mKGl0ZW0pID09PSAnbnVtYmVyJykgcmV0dXJuIGl0ZW0udG9TdHJpbmcoKVxuICByZXR1cm4gaXRlbVxufSIsImltcG9ydCB7IHJlbWFwQXJyYXlUb0xvd2VyQ2FzZUlmU3RyaW5nLCBsb3dlckNhc2VBbmRTdHJpbmdpZnlJZk51bWJlciB9IGZyb20gJy4vVXRpbCdcblxuZXhwb3J0IGNvbnN0IGZpbHRlck9iamVjdEtleXMgPSAoYWxsb3dlZDogYW55W10sIG9iamVjdDogYW55KTogYW55ID0+IHtcbiAgcmV0dXJuIGFsbG93ZWQucmVkdWNlKChhY2MsIGFsbG93ZWRBdHRyaWJ1dGUpID0+IHtcbiAgICBpZiAob2JqZWN0ICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGFsbG93ZWRBdHRyaWJ1dGUpKSB7IGFjY1thbGxvd2VkQXR0cmlidXRlXSA9IG9iamVjdFthbGxvd2VkQXR0cmlidXRlXSB9XG4gICAgcmV0dXJuIGFjY1xuICB9LCB7fSlcbn1cblxuZXhwb3J0IGNvbnN0IGNoZWNrT2JqTWF0Y2ggPSAoaXRlbTogYW55LCBxdWVyeTogYW55LCBpZ25vcmVFbXB0eUFycmF5OiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBjb25zdCBkaWZmS2V5cyA9IE9iamVjdC5rZXlzKHF1ZXJ5KS5maWx0ZXIoKGtleSkgPT4ge1xuICAgIGxldCBhdHRyUXVlcnkgPSBsb3dlckNhc2VBbmRTdHJpbmdpZnlJZk51bWJlcihpdGVtW2tleV0pXG4gICAgaWYoQXJyYXkuaXNBcnJheShxdWVyeVtrZXldKSkge1xuICAgICAgaWYoIXF1ZXJ5W2tleV0ubGVuZ3RoKSByZXR1cm4gaWdub3JlRW1wdHlBcnJheVxuICAgICAgcmV0dXJuICFyZW1hcEFycmF5VG9Mb3dlckNhc2VJZlN0cmluZyhxdWVyeVtrZXldKS5pbmNsdWRlcyhhdHRyUXVlcnkpXG4gICAgfVxuICAgIHJldHVybiAhY2hlY2tJc0VxdWFsKGF0dHJRdWVyeSwgcXVlcnlba2V5XSlcbiAgfSlcbiAgaWYoZGlmZktleXMubGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGl0ZW1cbn1cblxuZXhwb3J0IGNvbnN0IGNoZWNrSXNFcXVhbCA9ICh2YWx1ZTogYW55LCBxdWVyeTogYW55KTogYm9vbGVhbiA9PiB7XG4gIGlmKHR5cGVvZihxdWVyeSkgPT09ICdzdHJpbmcnICYmIHR5cGVvZih2YWx1ZSkgPT09ICdzdHJpbmcnKSByZXR1cm4gdmFsdWUudG9Mb3dlckNhc2UoKSA9PSBxdWVyeS50b0xvd2VyQ2FzZSgpXG4gIHJldHVybiB2YWx1ZSA9PSBxdWVyeVxufVxuXG5leHBvcnQgY29uc3QgaW5pdENsYXNzRGF0YSA9IChmaWxsYWJsZTogYW55W10sIGluc3RhbmNlOiBhbnksIG9iajogYW55ID0ge30pID0+IHsgIFxuICBmb3IoY29uc3QgYXR0ciBvZiBmaWxsYWJsZSkge1xuICAgIGlmKHR5cGVvZihvYmpbYXR0ci5rZXldKSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgaW5zdGFuY2VbYXR0ci5rZXldID0gb2JqW2F0dHIua2V5XVxuICAgIH0gZWxzZSB7XG4gICAgICBpbnN0YW5jZVthdHRyLmtleV0gPSBhdHRyLmRlZmF1bHRcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5zdGFuY2UsICdnZXRGaWxsYWJsZUtleXMnLCB7XG4gICAgICBnZXQoKSB7IHJldHVybiBmaWxsYWJsZS5tYXAoKGl0ZW0pID0+IGl0ZW0ua2V5KSB9LFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZGVmaW5lUHJvcGVydHkgPSAob2JqZWN0OiBhbnksIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KVxuICByZXR1cm4gb2JqZWN0XG59XG5cbmV4cG9ydCBjb25zdCBpc09iamVjdCA9IChpdGVtOiBhbnkpOiBib29sZWFuID0+IHtcbiAgcmV0dXJuIChpdGVtICYmIHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShpdGVtKSk7XG59XG5cbmV4cG9ydCBjb25zdCBkZWVwTWVyZ2VPYmplY3QgPSAodGFyZ2V0OiBhbnksIC4uLnNvdXJjZXM6IGFueSk6IGFueSA9PiB7XG4gIGlmICghc291cmNlcy5sZW5ndGgpIHJldHVybiB0YXJnZXQ7XG4gIGNvbnN0IHNvdXJjZSA9IHNvdXJjZXMuc2hpZnQoKTtcblxuICBpZiAoaXNPYmplY3QodGFyZ2V0KSAmJiBpc09iamVjdChzb3VyY2UpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XG4gICAgICBpZiAoaXNPYmplY3Qoc291cmNlW2tleV0pKSB7XG4gICAgICAgIGlmICghdGFyZ2V0W2tleV0pIE9iamVjdC5hc3NpZ24odGFyZ2V0LCB7XG4gICAgICAgICAgW2tleV06IHt9XG4gICAgICAgIH0pO1xuICAgICAgICBkZWVwTWVyZ2VPYmplY3QodGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGFyZ2V0LCB7XG4gICAgICAgICAgW2tleV06IHNvdXJjZVtrZXldXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkZWVwTWVyZ2VPYmplY3QodGFyZ2V0LCAuLi5zb3VyY2VzKTtcbn1cblxuZXhwb3J0IGNvbnN0IGdldE5lc3RlZE9iamVjdEJ5S2V5ID0gKG9iajogYW55ID0ge30sIGtleTogc3RyaW5nID0gJycpOiBhbnkgPT4ge1xuICByZXR1cm4ga2V5LnNwbGl0KCcuJykucmVkdWNlKChhY2MsIGspID0+IHtcbiAgICBpZiAoYWNjID09PSB1bmRlZmluZWQgfHwgYWNjID09PSBudWxsKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjb25zdCBhcnJheU1hdGNoID0gay5tYXRjaCgvXihbXlxcW10rKVxcWyhcXGQrKVxcXSQvKVxuICAgIGlmIChhcnJheU1hdGNoKSB7XG4gICAgICBjb25zdCBhcnJheUtleSA9IGFycmF5TWF0Y2hbMV1cbiAgICAgIGNvbnN0IGFycmF5SW5kZXggPSBwYXJzZUludChhcnJheU1hdGNoWzJdLCAxMClcblxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFjY1thcnJheUtleV0pIHx8IGFjY1thcnJheUtleV1bYXJyYXlJbmRleF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjW2FycmF5S2V5XVthcnJheUluZGV4XVxuICAgIH1cblxuICAgIHJldHVybiBhY2Nba11cbiAgfSwgb2JqKVxufVxuXG5leHBvcnQgY29uc3Qgc2V0TmVzdGVkT2JqZWN0QnlLZXkgPSAob2JqOiBhbnkgPSB7fSwga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnksIGFsbG93Tm9uRXhpc3RpbmdBcnJheUluZGV4OiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBvYmogPSBPYmplY3QuYXNzaWduKHt9LCBvYmopXG4gIGtleS5zcGxpdCgnLicpLnJlZHVjZSgoYWNjLCBrLCBpbmRleCwga2V5cykgPT4ge1xuICAgIGNvbnN0IGFycmF5TWF0Y2ggPSBrLm1hdGNoKC9eKFteXFxbXSspXFxbKFxcZCspXFxdJC8pXG5cbiAgICBpZiAoYXJyYXlNYXRjaCkge1xuICAgICAgY29uc3QgYXJyYXlLZXkgPSBhcnJheU1hdGNoWzFdXG4gICAgICBjb25zdCBhcnJheUluZGV4ID0gcGFyc2VJbnQoYXJyYXlNYXRjaFsyXSwgMTApXG5cbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShhY2NbYXJyYXlLZXldKSkge1xuICAgICAgICBpZiAoYWNjW2FycmF5S2V5XSAhPT0gdW5kZWZpbmVkICYmICh0eXBlb2YgYWNjW2FycmF5S2V5XSAhPT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQ2Fubm90IHNldCBwcm9wZXJ0eSAnJHthcnJheUtleX1bJHthcnJheUluZGV4fV0nIG9uIG5vbi1vYmplY3QgdHlwZSAoJHt0eXBlb2YgYWNjW2FycmF5S2V5XX0pIGF0IHBhdGggJyR7a2V5cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKX0nYClcbiAgICAgICAgfVxuICAgICAgICBhY2NbYXJyYXlLZXldID0gW11cbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgaWYgdGhlIGFycmF5IGhhcyB0aGUgc3BlY2lmaWVkIGluZGV4XG4gICAgICBpZiAoIWFsbG93Tm9uRXhpc3RpbmdBcnJheUluZGV4ICYmIGFycmF5SW5kZXggPj0gYWNjW2FycmF5S2V5XS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEFycmF5ICcke2FycmF5S2V5fScgZG9lcyBub3QgaGF2ZSBpbmRleCAke2FycmF5SW5kZXh9IGF0IHBhdGggJyR7a2V5cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKX0nYClcbiAgICAgIH1cblxuICAgICAgLy8gU2V0IHRoZSBjdXJyZW50IGFjY3VtdWxhdG9yIHRvIHRoZSBzcGVjaWZpZWQgaW5kZXggaW4gdGhlIGFycmF5XG4gICAgICBhY2MgPSBhY2NbYXJyYXlLZXldXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBrID0gYXJyYXlJbmRleFxuICAgIH1cblxuICAgIGlmIChpbmRleCA9PT0ga2V5cy5sZW5ndGggLSAxKSB7XG4gICAgICBhY2Nba10gPSB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaHJvdyBhbiBlcnJvciBpZiB0aGUgY3VycmVudCBsZXZlbCBpcyBub3QgYW4gb2JqZWN0XG4gICAgICBpZiAoYWNjW2tdICE9PSB1bmRlZmluZWQgJiYgKHR5cGVvZiBhY2Nba10gIT09ICdvYmplY3QnKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBDYW5ub3Qgc2V0IHByb3BlcnR5ICcke2t9JyBvbiBub24tb2JqZWN0IHR5cGUgKCR7dHlwZW9mIGFjY1trXX0pIGF0IHBhdGggJyR7a2V5cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKX0nYClcbiAgICAgIH1cbiAgICAgIGFjY1trXSA9IGFjY1trXSB8fCB7fVxuICAgIH1cblxuICAgIHJldHVybiBhY2Nba11cbiAgfSwgb2JqKVxuXG4gIHJldHVybiBvYmpcbn1cblxuZXhwb3J0IGNvbnN0IGRlbGV0ZU5lc3RlZE9iamVjdEJ5S2V5ID0gKG9iajogYW55LCBrZXk6IHN0cmluZywgaWdub3JlTm9uRXhpc3Rpbmc6IGJvb2xlYW4gPSB0cnVlKTogYW55ID0+IHtcbiAgY29uc3Qga2V5cyA9IGtleS5zcGxpdCgnLicpXG5cbiAga2V5cy5yZWR1Y2UoKGFjYzogYW55LCBrLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGFycmF5TWF0Y2ggPSBrLm1hdGNoKC9eKFteXFxbXSspXFxbKFxcZCspXFxdJC8pXG5cbiAgICBpZiAoYXJyYXlNYXRjaCkge1xuICAgICAgY29uc3QgYXJyYXlLZXkgPSBhcnJheU1hdGNoWzFdXG4gICAgICBjb25zdCBhcnJheUluZGV4ID0gcGFyc2VJbnQoYXJyYXlNYXRjaFsyXSwgMTApXG5cbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShhY2NbYXJyYXlLZXldKSAmJiAhaWdub3JlTm9uRXhpc3RpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQ2Fubm90IGRlbGV0ZSBwcm9wZXJ0eSAnJHthcnJheUtleX1bJHthcnJheUluZGV4fV0nIG9uIG5vbi1hcnJheSB0eXBlIGF0IHBhdGggJyR7a2V5cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKX0nYClcbiAgICAgIH1cblxuICAgICAgaWYgKGluZGV4ID09PSBrZXlzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgLy8gTGFzdCBlbGVtZW50IGluIHBhdGg6IGRlbGV0ZSBhcnJheSBpdGVtXG4gICAgICAgIGlmIChhcnJheUluZGV4ID49IGFjY1thcnJheUtleV0ubGVuZ3RoICYmICFpZ25vcmVOb25FeGlzdGluZykge1xuICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBBcnJheSAnJHthcnJheUtleX0nIGRvZXMgbm90IGhhdmUgaW5kZXggJHthcnJheUluZGV4fSBhdCBwYXRoICcke2tleXMuc2xpY2UoMCwgaW5kZXggKyAxKS5qb2luKCcuJyl9J2ApXG4gICAgICAgIH1cbiAgICAgICAgYWNjW2FycmF5S2V5XS5zcGxpY2UoYXJyYXlJbmRleCwgMSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFjYyA9IGFjY1thcnJheUtleV1bYXJyYXlJbmRleF1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGluZGV4ID09PSBrZXlzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgLy8gTGFzdCBlbGVtZW50IGluIHBhdGg6IGRlbGV0ZSBvYmplY3Qga2V5XG4gICAgICAgIGlmIChhY2MgJiYgYWNjLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgZGVsZXRlIGFjY1trXVxuICAgICAgICB9IGVsc2UgaWYoIWlnbm9yZU5vbkV4aXN0aW5nKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgZGVsZXRlIG5vbi1leGlzdGVudCBwcm9wZXJ0eSAnJHtrfScgYXQgcGF0aCAnJHtrZXlzLnNsaWNlKDAsIGluZGV4ICsgMSkuam9pbignLicpfSdgKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUcmF2ZXJzZSB0aGUgb2JqZWN0LCBlbnN1cmluZyB3ZSBkb24ndCB0cnkgdG8gYWNjZXNzIGEgbm9uLW9iamVjdFxuICAgICAgICBpZihpZ25vcmVOb25FeGlzdGluZykge1xuICAgICAgICAgIGlmICghYWNjW2tdIHx8IHR5cGVvZiBhY2Nba10gIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gYWNjXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghaWdub3JlTm9uRXhpc3RpbmcgJiYgKCFhY2Nba10gfHwgdHlwZW9mIGFjY1trXSAhPT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQ2Fubm90IGRlbGV0ZSBwcm9wZXJ0eSAnJHtrfScgb24gbm9uLW9iamVjdCB0eXBlIGF0IHBhdGggJyR7a2V5cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKX0nYClcbiAgICAgICAgfVxuICAgICAgICBhY2MgPSBhY2Nba11cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYWNjXG4gIH0sIG9iailcblxuICByZXR1cm4gb2JqXG59XG5cbnR5cGUgQW55T2JqZWN0ID0gUmVjb3JkPHN0cmluZywgYW55PlxuXG5leHBvcnQgY29uc3QgZGVlcFNlYXJjaEtleSA9IChcbiAgb2JqOiBBbnlPYmplY3QsXG4gIHRhcmdldEtleTogc3RyaW5nLFxuICByZXR1cm5BbGw6IGJvb2xlYW4gPSBmYWxzZVxuKTogYW55W10gfCBhbnkgPT4ge1xuICBjb25zdCByZXN1bHRzOiBhbnlbXSA9IFtdXG4gIGxldCBmaXJzdFJlc3VsdDogYW55ID0gbnVsbFxuXG4gIGNvbnN0IHNlYXJjaCA9IChjdXJyZW50T2JqOiBBbnlPYmplY3QpID0+IHtcbiAgICBpZiAoIXJldHVybkFsbCAmJiBmaXJzdFJlc3VsdCAhPT0gbnVsbCkgcmV0dXJuXG4gICAgaWYgKHR5cGVvZiBjdXJyZW50T2JqICE9PSAnb2JqZWN0JyB8fCBjdXJyZW50T2JqID09PSBudWxsKSByZXR1cm5cblxuICAgIGZvciAoY29uc3Qga2V5IGluIGN1cnJlbnRPYmopIHtcbiAgICAgIGlmIChrZXkgPT09IHRhcmdldEtleSkge1xuICAgICAgICBpZiAocmV0dXJuQWxsKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGN1cnJlbnRPYmpba2V5XSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmaXJzdFJlc3VsdCA9IGN1cnJlbnRPYmpba2V5XVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZWFyY2goY3VycmVudE9ialtrZXldKVxuICAgIH1cbiAgfVxuXG4gIHNlYXJjaChvYmopXG4gIHJldHVybiByZXR1cm5BbGwgPyByZXN1bHRzIDogZmlyc3RSZXN1bHRcbn1cblxuZXhwb3J0IGNvbnN0IGNoZWNrU2FtZVN0cnVjdHVyZSA9IChcbiAgYmFzZU9iajogQW55T2JqZWN0LFxuICBjb21wYXJlT2JqOiBBbnlPYmplY3Rcbik6IGJvb2xlYW4gPT4ge1xuICBpZiAodHlwZW9mIGJhc2VPYmogIT09ICdvYmplY3QnIHx8IGJhc2VPYmogPT09IG51bGwpIHtcbiAgICByZXR1cm4gdHlwZW9mIGJhc2VPYmogPT09IHR5cGVvZiBjb21wYXJlT2JqXG4gIH1cbiAgaWYgKHR5cGVvZiBjb21wYXJlT2JqICE9PSAnb2JqZWN0JyB8fCBjb21wYXJlT2JqID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgZm9yIChjb25zdCBrZXkgaW4gYmFzZU9iaikge1xuICAgIGlmICghKGtleSBpbiBjb21wYXJlT2JqKSkgcmV0dXJuIGZhbHNlXG4gICAgaWYgKCFjaGVja1NhbWVTdHJ1Y3R1cmUoYmFzZU9ialtrZXldLCBjb21wYXJlT2JqW2tleV0pKSByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gdHJ1ZVxufVxuXG5leHBvcnQgY29uc3QgZ2V0T2JqZWN0TWFwcGVkID0gKG9iamVjdDogYW55ID0ge30pID0+IHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG9iamVjdCkubWFwKChrZXkpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4ub2JqZWN0W2tleV0sXG4gICAgICBrZXk6IGtleSxcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBjb25zdCBPYmplY3RIZWxwZXJzID0ge1xuICBmaWx0ZXJPYmplY3RLZXlzLFxuICBjaGVja09iak1hdGNoLFxuICBjaGVja0lzRXF1YWwsXG4gIGluaXRDbGFzc0RhdGEsXG4gIGRlZmluZVByb3BlcnR5LFxuICBpc09iamVjdCxcbiAgZGVlcE1lcmdlT2JqZWN0LFxuICBnZXROZXN0ZWRPYmplY3RCeUtleSxcbiAgc2V0TmVzdGVkT2JqZWN0QnlLZXksXG4gIGRlbGV0ZU5lc3RlZE9iamVjdEJ5S2V5LFxuICBkZWVwU2VhcmNoS2V5LFxuICBnZXRPYmplY3RNYXBwZWRcbn0iLCJpbXBvcnQgeyBjaGVja09iak1hdGNoLCBjaGVja0lzRXF1YWwgfSBmcm9tICcuL09iamVjdEhlbHBlcnMnXG5pbXBvcnQgeyByZW1hcEFycmF5VG9Mb3dlckNhc2VJZlN0cmluZyB9IGZyb20gJy4vVXRpbCdcblxuZXhwb3J0IGNvbnN0IGZpbmRCeU9iaiA9IChhcnI6IGFueVtdLCBvYmo6IGFueSwgYXNCb29sZWFuOiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBmb3IoY29uc3QgaXRlbSBvZiBhcnIpIHtcbiAgICBpZighY2hlY2tPYmpNYXRjaChpdGVtLCBvYmopKSBjb250aW51ZVxuICAgIHJldHVybiBhc0Jvb2xlYW4gPyB0cnVlIDogaXRlbVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5leHBvcnQgY29uc3QgZmluZEJ5U3RyaW5nID0gKGFycjogYW55W10sIGl0ZW06IGFueSwgYXNCb29sZWFuOiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBmb3IoY29uc3QgYXJySXRlbSBvZiBhcnIpIHtcbiAgICBpZih0eXBlb2YoYXJySXRlbSkgPT09ICdzdHJpbmcnICYmIHR5cGVvZihpdGVtKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmKGFyckl0ZW0udG9Mb3dlckNhc2UoKSA9PSBpdGVtLnRvTG93ZXJDYXNlKCkpIHJldHVybiBhc0Jvb2xlYW4gPyB0cnVlIDogYXJySXRlbVxuICAgIH0gXG5cbiAgICBpZihhcnJJdGVtID09IGl0ZW0pIHtcbiAgICAgIHJldHVybiBhc0Jvb2xlYW4gPyB0cnVlIDogYXJySXRlbVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZXhwb3J0IGNvbnN0IGZpbmQgPSAoYXJyOiBhbnlbXSwgcXVlcnk6IGFueSwgYXNCb29sZWFuOiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBpZihBcnJheS5pc0FycmF5KHF1ZXJ5KSApIHJldHVybiBmYWxzZVxuICBpZih0eXBlb2YocXVlcnkpID09PSAnb2JqZWN0JykgcmV0dXJuIGZpbmRCeU9iaihhcnIsIHF1ZXJ5LCBhc0Jvb2xlYW4pXG4gIHJldHVybiBmaW5kQnlTdHJpbmcoYXJyLCBxdWVyeSwgYXNCb29sZWFuKVxufVxuXG5leHBvcnQgY29uc3QgZmluZEluZGV4ID0gKGFycjogYW55W10sIHF1ZXJ5OiBhbnkpOiBudW1iZXIgPT4ge1xuICBpZih0eXBlb2YocXVlcnkpID09PSAnb2JqZWN0Jykge1xuICAgIGNvbnN0IGZpbmRlZEJ5T2JqID0gZmluZEJ5T2JqKGFyciwgcXVlcnkpXG4gICAgcmV0dXJuIGZpbmRlZEJ5T2JqICE9IGZhbHNlID8gYXJyLmluZGV4T2YoZmluZGVkQnlPYmopIDogLTEgXG4gIH1cbiAgY29uc3QgZmluZGVkQnlTdHJpbmcgPSBmaW5kQnlTdHJpbmcoYXJyLCBxdWVyeSlcbiAgcmV0dXJuIGZpbmRlZEJ5U3RyaW5nICE9PSBmYWxzZSA/IGFyci5pbmRleE9mKGZpbmRlZEJ5U3RyaW5nKSA6IC0xICBcbn1cblxuZXhwb3J0IGNvbnN0IGZpbmRBbGwgPSAoYXJyOiBhbnlbXSwgcXVlcnk6IGFueSwgaWdub3JlRW1wdHlBcnJheTogYm9vbGVhbiA9IGZhbHNlKTogYW55W10gPT4ge1xuICBpZiAoIXF1ZXJ5KSByZXR1cm4gYXJyXG4gIHJldHVybiBhcnIuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgY29uc3QgaXRlbVRvTWF0Y2ggPSB0eXBlb2YoaXRlbSkgPT09ICdzdHJpbmcnID8gaXRlbS50b0xvd2VyQ2FzZSgpIDogaXRlbVxuICAgIGlmKHR5cGVvZihxdWVyeSkgPT0gJ3N0cmluZycpIHJldHVybiBjaGVja0lzRXF1YWwoaXRlbSwgcXVlcnkpXG4gICAgaWYoQXJyYXkuaXNBcnJheShxdWVyeSkpIHJldHVybiByZW1hcEFycmF5VG9Mb3dlckNhc2VJZlN0cmluZyhxdWVyeSkuaW5jbHVkZXMoaXRlbVRvTWF0Y2gpID8gdHJ1ZSA6IGZhbHNlXG4gICAgcmV0dXJuIGNoZWNrT2JqTWF0Y2goaXRlbSwgcXVlcnksICFpZ25vcmVFbXB0eUFycmF5KSA/IHRydWUgOiBmYWxzZVxuICB9KVxufVxuXG5leHBvcnQgY29uc3QgcmVtb3ZlQWxsID0gKGFycjogYW55W10sIHF1ZXJ5OiBhbnksIGlnbm9yZUVtcHR5QXJyYXk6IGJvb2xlYW4gPSB0cnVlKTogYW55W10gPT4ge1xuICBpZiAoIXF1ZXJ5KSByZXR1cm4gYXJyXG4gIHJldHVybiBhcnIuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgY29uc3QgaXRlbVRvTWF0Y2ggPSB0eXBlb2YoaXRlbSkgPT09ICdzdHJpbmcnID8gaXRlbS50b0xvd2VyQ2FzZSgpIDogaXRlbVxuICAgIGlmKHR5cGVvZihxdWVyeSkgPT09ICdzdHJpbmcnKSByZXR1cm4gIWNoZWNrSXNFcXVhbChpdGVtLCBxdWVyeSlcbiAgICBpZihBcnJheS5pc0FycmF5KHF1ZXJ5KSkgcmV0dXJuIHJlbWFwQXJyYXlUb0xvd2VyQ2FzZUlmU3RyaW5nKHF1ZXJ5KS5pbmNsdWRlcyhpdGVtVG9NYXRjaCkgPyBmYWxzZSA6IHRydWVcbiAgICByZXR1cm4gY2hlY2tPYmpNYXRjaChpdGVtLCBxdWVyeSwgaWdub3JlRW1wdHlBcnJheSkgPyBmYWxzZSA6IHRydWVcbiAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHJlbW92ZSA9IChhcnI6IGFueVtdLCBxdWVyeTogYW55ID0gbnVsbCk6IGFueSA9PiB7XG4gIGlmICghcXVlcnkpIHJldHVybiBhcnJcbiAgY29uc3QgaW5kZXggPSBmaW5kSW5kZXgoYXJyLCBxdWVyeSlcbiAgaWYoaW5kZXggPiAtMSkgYXJyLnNwbGljZShpbmRleCwgMSlcbiAgcmV0dXJuIGFyclxufVxuXG5leHBvcnQgY29uc3QgdW5pcXVlQnlLZXkgPSAoYXJyOiBhbnlbXSwgcXVlcnk6IGFueSA9IG51bGwpOiBhbnlbXSA9PiB7XG4gIGNvbnN0IHVuaXF1ZUl0ZW1zID0gW11cbiAgZm9yKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XG4gICAgbGV0IHNlYXJjaFxuICAgIGlmKCFxdWVyeSkge1xuICAgICAgc2VhcmNoID0gaXRlbVxuICAgIH0gZWxzZSBpZih0eXBlb2YocXVlcnkpID09PSAnc3RyaW5nJykge1xuICAgICAgc2VhcmNoID0geyBbcXVlcnldOiBpdGVtW3F1ZXJ5XSB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlYXJjaCA9IHF1ZXJ5XG4gICAgfVxuICAgIGNvbnN0IGZpbmRlZCA9IGZpbmQodW5pcXVlSXRlbXMsIHNlYXJjaClcbiAgICBpZighZmluZGVkKSB1bmlxdWVJdGVtcy5wdXNoKGl0ZW0pXG4gIH1cbiAgcmV0dXJuIHVuaXF1ZUl0ZW1zXG59XG5cbmV4cG9ydCBjb25zdCBvYmpBcnJheVRvQ3N2ID0gKGFycjogYW55W10sIGRlbGltaXRlcjogc3RyaW5nID0gJywnKTogc3RyaW5nID0+IHtcbiAgaWYoIUFycmF5LmlzQXJyYXkoYXJyKSB8fCB0eXBlb2YoYXJyWzBdKSAhPSAnb2JqZWN0JykgdGhyb3cgbmV3IEVycm9yKGBGaXJzdCBwYXJhbWV0ZXIgbXVzdCBiZSBhbiBhcnJheSBvZiBvYmplY3RzYClcbiAgY29uc3QgaGVhZGVyID0gT2JqZWN0LmtleXMoYXJyWzBdKVxuXHRyZXR1cm4gW2hlYWRlci5qb2luKGRlbGltaXRlcikgLCBhcnIubWFwKHJvdyA9PiBoZWFkZXIubWFwKGtleSA9PiByb3dba2V5XSkuam9pbihkZWxpbWl0ZXIpKS5qb2luKFwiXFxuXCIpXS5qb2luKFwiXFxuXCIpXG59XG5cbmV4cG9ydCBjb25zdCB0b2dnbGVJbkFycmF5ID0gKGFycjogYW55W10sIG9iajogYW55KTogYW55W10gPT4ge1xuICBjb25zdCBmaW5kZWQgPSBmaW5kSW5kZXgoYXJyLCBvYmopXG4gIGlmKGZpbmRlZCA+IC0xKSB7XG4gICAgYXJyLnNwbGljZShmaW5kZWQsIDEpXG4gIH0gZWxzZSB7XG4gICAgYXJyLnB1c2gob2JqKVxuICB9XG4gIHJldHVybiBhcnJcbn1cblxuZXhwb3J0IGNvbnN0IGNvbXBhcmVBcnJheSA9IChhcnJGcm9tOiBhbnlbXSwgYXJyVG9Db21wYXJlOiBhbnlbXSwga2V5OiBzdHJpbmcgPSBudWxsKTogYm9vbGVhbiA9PiB7XG4gIGlmKGFyckZyb20ubGVuZ3RoICE9PSBhcnJUb0NvbXBhcmUubGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgZm9yKGNvbnN0IGl0ZW0gb2YgYXJyRnJvbSkge1xuICAgIGxldCBzZWFyY2hcbiAgICBpZih0eXBlb2YoaXRlbSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBzZWFyY2ggPSBpdGVtXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKHR5cGVvZihrZXkpICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdUaGlyZCBwYXJhbWV0ZXIgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICBzZWFyY2ggPXsgW2tleV06IGl0ZW1ba2V5XSB9XG4gICAgfVxuICAgIGNvbnN0IGZpbmRlZCA9IGZpbmQoYXJyVG9Db21wYXJlLCBzZWFyY2gpXG4gICAgaWYoIWZpbmRlZCkgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcmV0dXJuIHRydWVcbn1cblxuZXhwb3J0IGNvbnN0IHNodWZmbGUgPSAoYXJyYXk6IGFueVtdKSA9PiB7XG4gIGZvciAobGV0IGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgY29uc3QgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpIGFzIG51bWJlclxuICAgIFthcnJheVtpXSwgYXJyYXlbal1dID0gW2FycmF5W2pdLCBhcnJheVtpXV1cbiAgfVxuICByZXR1cm4gYXJyYXlcbn1cblxuZXhwb3J0IGNvbnN0IGdldFJhbmRvbUVsZW1lbnQgPSAobGlzdDogYW55W10pOiBhbnkgPT4gbGlzdFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsaXN0Lmxlbmd0aCldXG5cbmV4cG9ydCBjb25zdCBjaHVua0FycmF5ID0gKGFycjogYW55W10sIHNpemU6IG51bWJlcik6IGFueVtdW10gPT4ge1xuICBjb25zdCBjaHVua3M6IGFueVtdW10gPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkgKz0gc2l6ZSkge1xuICAgIGNodW5rcy5wdXNoKGFyci5zbGljZShpLCBpICsgc2l6ZSkpXG4gIH1cbiAgcmV0dXJuIGNodW5rc1xufVxuXG5leHBvcnQgY29uc3QgZ2V0UmFuZG9tV2VpdGhlZEVsZW1lbnRzSW5BcnJheXMgPSAobGlzdHM6IGFueVtdW10sIHdlaWdodHM6IG51bWJlcltdLCBjb3VudDogbnVtYmVyKTogYW55W10gPT4ge1xuICBpZiAobGlzdHMubGVuZ3RoICE9PSB3ZWlnaHRzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTGlzdHMgYW5kIHdlaWdodHMgYXJyYXlzIG11c3QgaGF2ZSB0aGUgc2FtZSBsZW5ndGgnKVxuICB9XG4gIFxuICBpZiAobGlzdHMubGVuZ3RoID09PSAwIHx8IHdlaWdodHMubGVuZ3RoID09PSAwIHx8IGNvdW50IDw9IDApIHtcbiAgICByZXR1cm4gW11cbiAgfVxuXG4gIC8vIENyaWFyIGPDs3BpYXMgZGFzIGxpc3RhcyBwYXJhIG7Do28gbW9kaWZpY2FyIGFzIG9yaWdpbmFpc1xuICBjb25zdCBhdmFpbGFibGVMaXN0cyA9IGxpc3RzLm1hcChsaXN0ID0+IFsuLi5saXN0XSlcbiAgY29uc3QgYXZhaWxhYmxlV2VpZ2h0cyA9IFsuLi53ZWlnaHRzXVxuXG4gIC8vIE5vcm1hbGl6YXIgb3MgcGVzb3MgcGFyYSBjcmlhciB1bWEgZGlzdHJpYnVpw6fDo28gZGUgcHJvYmFiaWxpZGFkZVxuICBjb25zdCBub3JtYWxpemVXZWlnaHRzID0gKHdlaWdodHM6IG51bWJlcltdKSA9PiB7XG4gICAgY29uc3QgdG90YWxXZWlnaHQgPSB3ZWlnaHRzLnJlZHVjZSgoc3VtLCB3ZWlnaHQpID0+IHN1bSArIHdlaWdodCwgMClcbiAgICBpZiAodG90YWxXZWlnaHQgPT09IDApIHJldHVybiB3ZWlnaHRzLm1hcCgoKSA9PiAwKVxuICAgIHJldHVybiB3ZWlnaHRzLm1hcCh3ZWlnaHQgPT4gd2VpZ2h0IC8gdG90YWxXZWlnaHQpXG4gIH1cblxuICBjb25zdCByZXN1bHQ6IGFueVtdID0gW11cbiAgXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgIC8vIFZlcmlmaWNhciBzZSBhaW5kYSBleGlzdGVtIGxpc3RhcyBjb20gaXRlbnNcbiAgICBjb25zdCBsaXN0c1dpdGhJdGVtcyA9IGF2YWlsYWJsZUxpc3RzXG4gICAgICAubWFwKChsaXN0LCBpbmRleCkgPT4gKHsgbGlzdCwgaW5kZXgsIHdlaWdodDogYXZhaWxhYmxlV2VpZ2h0c1tpbmRleF0gfSkpXG4gICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS5saXN0Lmxlbmd0aCA+IDApXG4gICAgXG4gICAgaWYgKGxpc3RzV2l0aEl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgYnJlYWsgLy8gTsOjbyBow6EgbWFpcyBpdGVucyBkaXNwb27DrXZlaXNcbiAgICB9XG5cbiAgICAvLyBSZWNhbGN1bGFyIHBlc29zIGFwZW5hcyBwYXJhIGxpc3RhcyBxdWUgYWluZGEgdMOqbSBpdGVuc1xuICAgIGNvbnN0IGFjdGl2ZVdlaWdodHMgPSBsaXN0c1dpdGhJdGVtcy5tYXAoaXRlbSA9PiBpdGVtLndlaWdodClcbiAgICBjb25zdCBub3JtYWxpemVkV2VpZ2h0cyA9IG5vcm1hbGl6ZVdlaWdodHMoYWN0aXZlV2VpZ2h0cylcbiAgICBcbiAgICAvLyBDcmlhciBpbnRlcnZhbG9zIGFjdW11bGF0aXZvcyBwYXJhIHNlbGXDp8OjbyBwb3IgcGVzb1xuICAgIGNvbnN0IGN1bXVsYXRpdmVXZWlnaHRzID0gW11cbiAgICBsZXQgY3VtdWxhdGl2ZSA9IDBcbiAgICBmb3IgKGNvbnN0IHdlaWdodCBvZiBub3JtYWxpemVkV2VpZ2h0cykge1xuICAgICAgY3VtdWxhdGl2ZSArPSB3ZWlnaHRcbiAgICAgIGN1bXVsYXRpdmVXZWlnaHRzLnB1c2goY3VtdWxhdGl2ZSlcbiAgICB9XG5cbiAgICBjb25zdCByYW5kb20gPSBNYXRoLnJhbmRvbSgpXG4gICAgXG4gICAgLy8gRW5jb250cmFyIHF1YWwgbGlzdGEgZGV2ZSBzZXIgc2VsZWNpb25hZGEgYmFzZWFkbyBubyBwZXNvXG4gICAgbGV0IHNlbGVjdGVkTGlzdEluZGV4ID0gMFxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgY3VtdWxhdGl2ZVdlaWdodHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGlmIChyYW5kb20gPD0gY3VtdWxhdGl2ZVdlaWdodHNbal0pIHtcbiAgICAgICAgc2VsZWN0ZWRMaXN0SW5kZXggPSBqXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFBlZ2FyIG8gw61uZGljZSByZWFsIGRhIGxpc3RhIG9yaWdpbmFsXG4gICAgY29uc3QgcmVhbExpc3RJbmRleCA9IGxpc3RzV2l0aEl0ZW1zW3NlbGVjdGVkTGlzdEluZGV4XS5pbmRleFxuICAgIGNvbnN0IHNlbGVjdGVkTGlzdCA9IGF2YWlsYWJsZUxpc3RzW3JlYWxMaXN0SW5kZXhdXG4gICAgXG4gICAgaWYgKHNlbGVjdGVkTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZ2V0UmFuZG9tRWxlbWVudChzZWxlY3RlZExpc3QpXG4gICAgICByZXN1bHQucHVzaChlbGVtZW50KVxuICAgICAgXG4gICAgICAvLyBSZW1vdmVyIG8gZWxlbWVudG8gc2VsZWNpb25hZG8gZGEgbGlzdGEgcGFyYSBldml0YXIgcmVwZXRpw6fDo29cbiAgICAgIGNvbnN0IGVsZW1lbnRJbmRleCA9IHNlbGVjdGVkTGlzdC5pbmRleE9mKGVsZW1lbnQpXG4gICAgICBzZWxlY3RlZExpc3Quc3BsaWNlKGVsZW1lbnRJbmRleCwgMSlcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiByZXN1bHRcbn1cblxuZXhwb3J0IGNvbnN0IEFycmF5SGVscGVycyA9IHtcbiAgZmluZEJ5T2JqLFxuICBmaW5kQnlTdHJpbmcsXG4gIGZpbmQsXG4gIGZpbmRJbmRleCxcbiAgZmluZEFsbCxcbiAgcmVtb3ZlQWxsLFxuICByZW1vdmUsXG4gIHVuaXF1ZUJ5S2V5LFxuICBvYmpBcnJheVRvQ3N2LFxuICB0b2dnbGVJbkFycmF5LFxuICBjb21wYXJlQXJyYXksXG4gIHNodWZmbGUsXG4gIGdldFJhbmRvbUVsZW1lbnQsXG4gIGNodW5rQXJyYXksXG4gIGdldFJhbmRvbVdlaXRoZWRFbGVtZW50c0luQXJyYXlzXG59XG5cbiIsIlxuLyoqXG4gKiBcbiAqIGdldCBhbW91bnQgb2YgYSBnaXZlbiAlIG9mIGEgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFtb3VudE9mUGVyY2VudGFnZSA9IChhbW91bnQ6IG51bWJlciwgcGVyY2VudGFnZTogbnVtYmVyIHwgc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHBjdCA9IGdldFBhcnNlZFZhbHVlKHBlcmNlbnRhZ2UpXG4gIGNvbnN0IGFtdCA9IGdldFBhcnNlZFZhbHVlKGFtb3VudClcbiAgcmV0dXJuIE51bWJlcihhbXQgLyAxMDAgKiBwY3QpXG59XG5cbi8qKlxuICogXG4gKiBnZXQgdGhlICUgb2YgYSBnaXZlbiBhbW91bnQgYW5kIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQZXJjZW50YWdlT2ZBbW91bnQgPSAoYW1vdW50OiBudW1iZXIsIHZhbHVlOiBudW1iZXIsIHBlcmNlbnRhZ2VTaWduOiBib29sZWFuID0gZmFsc2UsIGRpZ2l0czpudW1iZXIgPSAyLCByZXR1cm5XaGVuQW1vdW50SXNaZXJvOiBudWxsIHwgc3RyaW5nIHwgbnVtYmVyID0gJy0tJyk6IG51bWJlciB8IHN0cmluZyA9PiB7XG4gIGNvbnN0IGFtdCA9IGdldFBhcnNlZFZhbHVlKGFtb3VudClcbiAgaWYoYW10ID09PSAwICYmIHR5cGVvZiByZXR1cm5XaGVuQW1vdW50SXNaZXJvICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiByZXR1cm5XaGVuQW1vdW50SXNaZXJvXG4gIH1cbiAgY29uc3QgcmVzdWx0ID0gTnVtYmVyKDEwMCAvIGFtdCAqIHZhbHVlKVxuICBpZighcGVyY2VudGFnZVNpZ24pIHJldHVybiByZXN1bHRcbiAgaWYoaXNOYU4oTnVtYmVyKCByZXN1bHQgLyAxMDAgKSkpIHJldHVybiBOdW1iZXIocmVzdWx0LzEwMClcbiAgcmV0dXJuIE51bWJlciggcmVzdWx0IC8gMTAwICkudG9Mb2NhbGVTdHJpbmcodW5kZWZpbmVkLCB7IHN0eWxlOiAncGVyY2VudCcsIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogZGlnaXRzIH0pXG59XG5cbmV4cG9ydCBjb25zdCByb3VuZCA9ICh2YWx1ZTogbnVtYmVyLCBkZWNpbWFsczogbnVtYmVyID0gMikgPT4ge1xuICBjb25zdCB2bCA9IGdldFBhcnNlZFZhbHVlKHZhbHVlKVxuICB2YXIgcCA9IE1hdGgucG93KDEwLCBkZWNpbWFscylcbiAgcmV0dXJuIE1hdGgucm91bmQodmwgKiBwKSAvIHBcbn1cblxuZXhwb3J0IGNvbnN0IHJhbmRvbUludCA9IChtYXg6IG51bWJlciwgbWluOiBudW1iZXIgPSAwKSA9PiB7XG4gIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKChtYXggLSBtaW4pICogTWF0aC5yYW5kb20oKSk7XG59XG5cbi8qKlxuICogYWRkIGEgcmF3IHBlcmNlbnRhZ2UgdmFsdWUgdG8gYSBudW1iZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGFkZFBlcmNlbnRhZ2UgPSAodmFsdWU6IG51bWJlciwgcGVyY2VudGFnZTogc3RyaW5nIHwgbnVtYmVyKSA9PiB7XG4gIGNvbnN0IHBjdCA9IGdldFBhcnNlZFZhbHVlKHBlcmNlbnRhZ2UpXG4gIGNvbnN0IHZsID0gZ2V0UGFyc2VkVmFsdWUodmFsdWUpXG4gIHJldHVybiB2bCAqICgxICsgKHBjdCAvIDEwMCkpXG59XG5cbi8qKlxuICogXG4gKiByZXR1cm5zIGEgbWluIHZhbHVlIHVzaW5nIGEgcGVyY2VudGFnZSBhcyByZWZlcmVuY2VzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRWYWx1ZU9yTWluUGVyY2VudGFnZSA9IChhbW91bnQ6IG51bWJlciwgdmFsdWU6IG51bWJlciwgcGVyY2VudGFnZTogbnVtYmVyID0gMTApID0+IHtcbiAgY29uc3QgYW10ID0gZ2V0UGFyc2VkVmFsdWUoYW1vdW50KVxuICBjb25zdCB2bCA9IGdldFBhcnNlZFZhbHVlKHZhbHVlKVxuICBjb25zdCBwY3QgPSBnZXRQYXJzZWRWYWx1ZShwZXJjZW50YWdlKVxuICBpZigoYW10IC8gMTAwICogcGN0KSA+IHZsKSByZXR1cm4gZ2V0QW1vdW50T2ZQZXJjZW50YWdlKGFtdCwgcGN0KVxuICByZXR1cm4gdmxcbn1cblxuY29uc3QgZ2V0UGFyc2VkVmFsdWUgPSAodmFsdWU6IG51bWJlciB8IHN0cmluZyk6IG51bWJlciA9PiB7XG4gIHJldHVybiB0eXBlb2YodmFsdWUpID09PSAnbnVtYmVyJyA/IHZhbHVlIDogcGFyc2VGbG9hdCh2YWx1ZSlcbn1cblxuZXhwb3J0IGNvbnN0IE1hdGhIZWxwZXJzID0ge1xuICBnZXRBbW91bnRPZlBlcmNlbnRhZ2UsXG4gIGdldFBlcmNlbnRhZ2VPZkFtb3VudCxcbiAgcm91bmQsXG4gIHJhbmRvbUludCxcbiAgYWRkUGVyY2VudGFnZSxcbiAgZ2V0VmFsdWVPck1pblBlcmNlbnRhZ2Vcbn0iLCJcbmV4cG9ydCBjb25zdCBkb3dubG9hZFJhd0RhdGEgPSAoZGF0YTogc3RyaW5nLCBmaWxlTmFtZTpzdHJpbmcgPSAnZmlsZS50eHQnKTogdm9pZCA9PiB7XG4gIGlmKCF3aW5kb3cpIHRocm93IG5ldyBFcnJvcihgTWV0aG9kIGRvd25sb2FkUmF3RGF0YSBtdXN0IHJ1biBpbiBcIndpbmRvd1wiIGNvbnRleHQuYClcbiAgY29uc3QgYmxvYiA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtkYXRhXSkpXG5cdGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcblx0bGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBibG9iKVxuXHRsaW5rLnNldEF0dHJpYnV0ZSgnZG93bmxvYWQnLCBmaWxlTmFtZSlcblx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKVxuXHRsaW5rLmNsaWNrKClcblx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKVxufVxuXG5leHBvcnQgY29uc3QgY29weVRvQ2xpcGJvYXJkID0gKHN0cmluZzogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGlmKG5hdmlnYXRvci5jbGlwYm9hcmQpIHtcbiAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChzdHJpbmcpXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZHVtbXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIilcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGR1bW15KVxuICAgIGR1bW15LnZhbHVlID0gc3RyaW5nXG4gICAgZHVtbXkuc2VsZWN0KClcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIilcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGR1bW15KVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBnZXRMZXR0ZXJCeU51bWJlciA9IChudW1iZXI6IG51bWJlcik6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHN0cmluZyA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eidcbiAgaWYoc3RyaW5nLmxlbmd0aC0xIDwgbnVtYmVyKSByZXR1cm4gJy0tJ1xuICByZXR1cm4gc3RyaW5nW251bWJlcl1cbn1cblxuZXhwb3J0IGNvbnN0IHJlbW92ZUFsbENvb2tpZXMgPSAoKTogdm9pZCA9PiB7XG4gIGlmKGRvY3VtZW50KSB7XG4gICAgY29uc3QgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY29va2llID0gY29va2llc1tpXTtcbiAgICAgIGNvbnN0IGVxUG9zID0gY29va2llLmluZGV4T2YoJz0nKTtcbiAgICAgIGNvbnN0IG5hbWUgPSBlcVBvcyA+IC0xID8gY29va2llLnN1YnN0cigwLCBlcVBvcykgOiBjb29raWU7XG4gICAgICBjb25zdCBwYXRoID0gJy8nO1xuICAgICAgZG9jdW1lbnQuY29va2llID0gbmFtZSArICc9O2V4cGlyZXM9VGh1LCAwMSBKYW4gMTk3MCAwMDowMDowMCBHTVQ7cGF0aD0nICsgcGF0aDtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNsZWFyQnJvd3NlckNhY2hlID0gKHJlbW92ZUNvb2tpZXM6IGJvb2xlYW4gPSB0cnVlKSA9PiB7XG4gIGxvY2FsU3RvcmFnZS5jbGVhcigpXG4gIHNlc3Npb25TdG9yYWdlLmNsZWFyKClcbiAgaWYocmVtb3ZlQ29va2llcykge1xuICAgIHJlbW92ZUFsbENvb2tpZXMoKVxuICB9XG59XG5cblxuZXhwb3J0IGNvbnN0IGNsZWFyQnJvd3NlckNhY2hlTGlzdGVuZXIgPSAoaG90S2V5OiBzdHJpbmcgPSAnS2V5WCcsIHJlbW92ZUNvb2tpZXM6IGJvb2xlYW4gPSB0cnVlLCBjYjogRnVuY3Rpb24gfCBudWxsID0gbnVsbCk6IHZvaWQgPT4ge1xuICBpZihkb2N1bWVudCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQuYWx0S2V5ICYmIGV2ZW50LmNvZGUgPT09IGhvdEtleSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGNsZWFyQnJvd3NlckNhY2hlKHJlbW92ZUNvb2tpZXMpXG4gICAgICAgIGlmKGNiKSB7XG4gICAgICAgICAgY2IoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZGVib3VuY2UgPSA8VCBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gYW55PihcbiAgY2FsbGJhY2s6IFQsIFxuICB0aW1lb3V0OiBudW1iZXIgPSAzMDBcbik6ICgoLi4uYXJnczogUGFyYW1ldGVyczxUPikgPT4gdm9pZCkgPT4ge1xuICBsZXQgdGltZXI6IE5vZGVKUy5UaW1lb3V0IHwgbnVtYmVyXG4gIFxuICByZXR1cm4gKC4uLmFyZ3M6IFBhcmFtZXRlcnM8VD4pID0+IHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNhbGxiYWNrKC4uLmFyZ3MpXG4gICAgfSwgdGltZW91dClcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQ29tbW9uSGVscGVycyA9IHtcbiAgZG93bmxvYWRSYXdEYXRhLFxuICBjb3B5VG9DbGlwYm9hcmQsXG4gIGdldExldHRlckJ5TnVtYmVyLFxuICBjbGVhckJyb3dzZXJDYWNoZSxcbiAgY2xlYXJCcm93c2VyQ2FjaGVMaXN0ZW5lcixcbiAgcmVtb3ZlQWxsQ29va2llcyxcbiAgZGVib3VuY2Vcbn0iLCJcblxuZXhwb3J0IHR5cGUgVHlwZU51bWJlckZvcm1hdE9wdGlvbnMgPSB7XG4gIHByZWZpeDogc3RyaW5nXG4gIHN1ZmZpeDogc3RyaW5nXG4gIGRlY2ltYWw6IHN0cmluZ1xuICB0aG91c2FuZDogc3RyaW5nXG4gIHByZWNpc2lvbjogbnVtYmVyXG4gIGFjY2VwdE5lZ2F0aXZlOiBib29sZWFuXG4gIGlzSW50ZWdlcjogYm9vbGVhblxuICB2dWVWZXJzaW9uPzogc3RyaW5nXG59XG5cbmNvbnN0IGRlZmF1bHRPcHRpb25zOiBUeXBlTnVtYmVyRm9ybWF0T3B0aW9ucyA9IHtcbiAgcHJlZml4OiAnVVMkICcsXG4gIHN1ZmZpeDogJycsXG4gIGRlY2ltYWw6ICcuJyxcbiAgdGhvdXNhbmQ6ICcsJyxcbiAgcHJlY2lzaW9uOiAyLFxuICBhY2NlcHROZWdhdGl2ZTogdHJ1ZSxcbiAgaXNJbnRlZ2VyOiBmYWxzZVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0T3B0aW9ucyIsIi8qXG4gKiBpZ29ydHJpbmlkYWQvdnVlLW51bWJlci1mb3JtYXRcbiAqXG4gKiAoYykgSWdvciBUcmluZGFkZSA8aWdvcnRyaW5kYWRlLm1lQGdtYWlsLmNvbT5cbiAqIFxuICogTW9zdGx5IG9mIHRoaXMgZmlsZSBjb250ZW50IHdhcyBleHRyYWN0ZWQgZnJvbSB0aGUgaHR0cHM6Ly9naXRodWIuY29tL21haWNvOTEwL3Z1ZS1udW1iZXItZm9ybWF0L2Jsb2Ivdml0ZS10eXBlc2NyaXB0LXJlZmFjdG9yL3NyYy91dGlscy50c1xuICpcbiAqIEZvciB0aGUgZnVsbCBjb3B5cmlnaHQgYW5kIGxpY2Vuc2UgaW5mb3JtYXRpb24sIHBsZWFzZSB2aWV3IHRoZSBMSUNFTlNFXG4gKiBmaWxlIHRoYXQgd2FzIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyBzb3VyY2UgY29kZS5cbiAqL1xuXG5pbXBvcnQgZGVmYXVsdE9wdGlvbnMsIHsgdHlwZSBUeXBlTnVtYmVyRm9ybWF0T3B0aW9ucyB9IGZyb20gJy4vdHlwZXMvTnVtYmVyRm9ybWF0T3B0aW9ucydcblxuZXhwb3J0IGNvbnN0IGZvcm1hdE51bWJlciA9IChpbnB1dDogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCA9ICcwJywgb3B0OiBQYXJ0aWFsPFR5cGVOdW1iZXJGb3JtYXRPcHRpb25zPiA9IHt9KSA9PiB7XG4gIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSB7Li4uZGVmYXVsdE9wdGlvbnMsIC4uLm9wdH07XG5cbiAgbGV0IGlucHV0SW5TdHJpbmc7XG5cbiAgaWYgKCEhaW5wdXQpIHtcbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnbnVtYmVyJyAmJiAhbWVyZ2VkT3B0aW9ucy5pc0ludGVnZXIpIHtcbiAgICAgIGlucHV0SW5TdHJpbmcgPSBpbnB1dC50b0ZpeGVkKGZpeGVkKG1lcmdlZE9wdGlvbnMucHJlY2lzaW9uKSlcbiAgICB9IGVsc2Uge1xuICAgICAgaW5wdXRJblN0cmluZyA9IGlucHV0LnRvU3RyaW5nKClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaW5wdXRJblN0cmluZyA9ICcnXG4gIH1cblxuXG4gIGNvbnN0IG1pbnVzU3ltYm9sID0gaXNOZWdhdGl2ZShpbnB1dEluU3RyaW5nLCBtZXJnZWRPcHRpb25zLmFjY2VwdE5lZ2F0aXZlKSAgPyAnLScgOiAnJ1xuICBjb25zdCBudW1iZXJzID0gaW5wdXRPbmx5TnVtYmVycyhpbnB1dEluU3RyaW5nLnRvU3RyaW5nKCkpXG4gIGNvbnN0IGN1cnJlbmN5SW5TdHJpbmcgPSBudW1iZXJzVG9DdXJyZW5jeShudW1iZXJzLCBtZXJnZWRPcHRpb25zLnByZWNpc2lvbilcblxuICBjb25zdCBjdXJyZW5jeVBhcnRzID0gY3VycmVuY3lJblN0cmluZy5zcGxpdCgnLicpXG4gIGNvbnN0IGRlY2ltYWwgPSBjdXJyZW5jeVBhcnRzWzFdXG4gIGNvbnN0IGludGVnZXIgPSBhZGRUaG91c2FuZFNlcGFyYXRvcihjdXJyZW5jeVBhcnRzWzBdLCBtZXJnZWRPcHRpb25zLnRob3VzYW5kKVxuXG4gIHJldHVybiBtaW51c1N5bWJvbCArIG1lcmdlZE9wdGlvbnMucHJlZml4ICsgam9pbkludGVnZXJBbmREZWNpbWFsKGludGVnZXIsIGRlY2ltYWwsIG1lcmdlZE9wdGlvbnMuZGVjaW1hbCkgKyBtZXJnZWRPcHRpb25zLnN1ZmZpeFxufVxuXG5leHBvcnQgY29uc3QgdW5mb3JtYXROdW1iZXIgPSAoaW5wdXQ6IHN0cmluZyB8IG51bWJlciB8IG51bGwgPSAwLCBvcHQ6IFBhcnRpYWw8VHlwZU51bWJlckZvcm1hdE9wdGlvbnM+ID0ge30pID0+IHtcbiAgY29uc3QgbWVyZ2VkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBvcHQpO1xuXG4gIGNvbnN0IHVzZXJJbnB1dCA9IGlucHV0IHx8IDA7XG5cbiAgY29uc3QgbnVtYmVycyA9IGlucHV0T25seU51bWJlcnModXNlcklucHV0KVxuXG4gIGlmKG1lcmdlZE9wdGlvbnMuaXNJbnRlZ2VyKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KGAke2lzTmVnYXRpdmUodXNlcklucHV0LCBtZXJnZWRPcHRpb25zLmFjY2VwdE5lZ2F0aXZlKSA/ICctJyA6ICcnfSR7bnVtYmVycy50b1N0cmluZygpfWApXG4gIH1cblxuICBjb25zdCBtYWtlTnVtYmVyTmVnYXRpdmUgPSAoaXNOZWdhdGl2ZSh1c2VySW5wdXQsIG1lcmdlZE9wdGlvbnMuYWNjZXB0TmVnYXRpdmUpKVxuICBjb25zdCBjdXJyZW5jeSA9IG51bWJlcnNUb0N1cnJlbmN5KG51bWJlcnMsIG1lcmdlZE9wdGlvbnMucHJlY2lzaW9uKVxuICByZXR1cm4gbWFrZU51bWJlck5lZ2F0aXZlID8gcGFyc2VGbG9hdChjdXJyZW5jeSkgKiAtIDEgOiBwYXJzZUZsb2F0KGN1cnJlbmN5KVxufVxuXG5mdW5jdGlvbiBpbnB1dE9ubHlOdW1iZXJzIChpbnB1dDogc3RyaW5nIHwgbnVtYmVyID0gMCkge1xuICByZXR1cm4gaW5wdXQgPyBpbnB1dC50b1N0cmluZygpLnJlcGxhY2UoL1xcRCsvZywgJycpIDogJzAnXG59XG5cbi8vIDEyMyBSYW5nZUVycm9yOiB0b0ZpeGVkKCkgZGlnaXRzIGFyZ3VtZW50IG11c3QgYmUgYmV0d2VlbiAwIGFuZCAyMCBhdCBOdW1iZXIudG9GaXhlZFxuZnVuY3Rpb24gZml4ZWQocHJlY2lzaW9uOiBudW1iZXIpIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKHByZWNpc2lvbiwgMjApKVxufVxuXG5mdW5jdGlvbiBudW1iZXJzVG9DdXJyZW5jeSAobnVtYmVyczogc3RyaW5nLCBwcmVjaXNpb246IG51bWJlcikge1xuICBjb25zdCBleHAgPSBNYXRoLnBvdygxMCwgcHJlY2lzaW9uKVxuICBjb25zdCBmbG9hdCA9IHBhcnNlRmxvYXQobnVtYmVycykgLyBleHBcbiAgcmV0dXJuIGZsb2F0LnRvRml4ZWQoZml4ZWQocHJlY2lzaW9uKSlcbn1cblxuZnVuY3Rpb24gYWRkVGhvdXNhbmRTZXBhcmF0b3IgKGludGVnZXI6IHN0cmluZywgc2VwYXJhdG9yOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oPzpcXGR7M30pK1xcYikvZ20sIGAkMSR7c2VwYXJhdG9yfWApXG59XG5cbmZ1bmN0aW9uIGpvaW5JbnRlZ2VyQW5kRGVjaW1hbCAoaW50ZWdlcjogc3RyaW5nLCBkZWNpbWFsOiBzdHJpbmcsIHNlcGFyYXRvcjogc3RyaW5nKSB7XG4gIGlmIChkZWNpbWFsKSB7XG4gICAgcmV0dXJuIGludGVnZXIgKyBzZXBhcmF0b3IgKyBkZWNpbWFsO1xuICB9XG5cbiAgcmV0dXJuIGludGVnZXI7XG59XG5cbmZ1bmN0aW9uIGlzTmVnYXRpdmUoc3RyaW5nOiBudW1iZXIgfCBzdHJpbmcsIGFjY2VwdE5lZ2F0aXZlID0gdHJ1ZSkge1xuICBpZighYWNjZXB0TmVnYXRpdmUpIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IHZhbHVlID0gc3RyaW5nLnRvU3RyaW5nKCk7XG4gIGNvbnN0IGlzTmVnYXRpdmUgPSAodmFsdWUuc3RhcnRzV2l0aCgnLScpIHx8IHZhbHVlLmVuZHNXaXRoKCctJykpXG4gIGNvbnN0IGZvcmNlUG9zaXRpdmUgPSB2YWx1ZS5pbmRleE9mKCcrJykgPiAwXG5cbiAgcmV0dXJuIGlzTmVnYXRpdmUgJiYgIWZvcmNlUG9zaXRpdmVcbn1cblxuZXhwb3J0IGNvbnN0IE51bWJlckZvcm1hdCA9IHtcbiAgZm9ybWF0TnVtYmVyLFxuICB1bmZvcm1hdE51bWJlcixcbn0iLCJcbmludGVyZmFjZSBVcmxJbWFnZSB7XG4gIHVybDogc3RyaW5nXG4gIHRpdGxlOiBzdHJpbmdcbiAgY2FwdGlvbjogc3RyaW5nXG59XG5cbnR5cGUgQ2hhbmdlRnJlcXMgPSAnYWx3YXlzJyB8ICdob3VybHknIHwgJ2RhaWx5JyB8ICd3ZWVrbHknIHwgJ21vbnRobHknIHwgJ2FudWFsJyB8ICduZXZlcidcblxuaW50ZXJmYWNlIFVybEl0ZW1JbnRlcmZhY2Uge1xuICB1cmw6IHN0cmluZ1xuICBsYXN0TW9kaWZpZWQ/OiBzdHJpbmdcbiAgY2hhbmdlRnJlcT86IENoYW5nZUZyZXFzXG4gIHByaW9yaXR5Pzogc3RyaW5nXG4gIGltYWdlPzogVXJsSW1hZ2Vcbn1cblxuZXhwb3J0IGNsYXNzIFVybEl0ZW0ge1xuXG4gIHVybDogc3RyaW5nXG4gIGxhc3RNb2RpZmllZDogc3RyaW5nID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLDEwKVxuICBjaGFuZ2VGcmVxOiBDaGFuZ2VGcmVxcyA9ICdtb250aGx5J1xuICBwcmlvcml0eTogc3RyaW5nID0gJzEuMCdcbiAgaW1hZ2U/OiBVcmxJbWFnZSA9IG51bGxcblxuICBjb25zdHJ1Y3Rvcih1cmxJdGVtOiBVcmxJdGVtSW50ZXJmYWNlKXtcbiAgICBpZighdXJsSXRlbS51cmwpIHRocm93IG5ldyBFcnJvcignVXJsIGlzIHJlcXVpcmVkJylcbiAgICB0aGlzLnVybCA9IHRoaXMucmVtb3ZlRmlyc3RTbGFzaEZyb21VcmwodXJsSXRlbS51cmwpXG4gICAgaWYodXJsSXRlbS5sYXN0TW9kaWZpZWQgKSB0aGlzLmxhc3RNb2RpZmllZCA9IHVybEl0ZW0ubGFzdE1vZGlmaWVkXG4gICAgaWYodXJsSXRlbS5jaGFuZ2VGcmVxICkgdGhpcy5jaGFuZ2VGcmVxID0gdXJsSXRlbS5jaGFuZ2VGcmVxXG4gICAgaWYodXJsSXRlbS5wcmlvcml0eSApIHRoaXMucHJpb3JpdHkgPSB1cmxJdGVtLnByaW9yaXR5XG4gICAgaWYodXJsSXRlbS5pbWFnZSApIHRoaXMuaW1hZ2UgPSB1cmxJdGVtLmltYWdlXG4gIH1cblxuICByZW1vdmVGaXJzdFNsYXNoRnJvbVVybCh1cmw6IHN0cmluZykge1xuICAgIGlmKHVybFswXSA9PSAnLycpIHJldHVybiB1cmwuc3Vic3RyaW5nKDEpXG4gICAgcmV0dXJuIHVybFxuICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFNpdGVNYXBHZW5lcmF0b3Ige1xuXG4gIGJhc2VVcmw6IHN0cmluZyA9ICcnXG4gIGl0ZW1zOiBVcmxJdGVtW10gPSBbXVxuICB4bWxTdHlsZXNoZWV0UGF0aDogc3RyaW5nID0gJydcblxuICBjb25zdHJ1Y3RvcihiYXNlVXJsOiBzdHJpbmcpIHtcbiAgICB0aGlzLmJhc2VVcmwgPSBiYXNlVXJsXG4gICAgdGhpcy5pdGVtcyA9IFtdXG4gIH1cblxuICBwcml2YXRlIGdldCBnZXRIZWFkZXIgKCkge1xuY29uc3QgaGVhZGVyID0gXG5gXG4keyB0aGlzLnhtbFN0eWxlc2hlZXRQYXRoID8gYDw/eG1sLXN0eWxlc2hlZXQgaHJlZj1cIiR7IHRoaXMueG1sU3R5bGVzaGVldFBhdGggfVwiIHR5cGU9XCJ0ZXh0L3hzbFwiPz5gIDogJycgfVxuPHVybHNldCB4bWxucz1cImh0dHA6Ly93d3cuc2l0ZW1hcHMub3JnL3NjaGVtYXMvc2l0ZW1hcC8wLjlcIiB4bWxuczp4aHRtbD1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIiB4bWxuczppbWFnZT1cImh0dHA6Ly93d3cuZ29vZ2xlLmNvbS9zY2hlbWFzL3NpdGVtYXAtaW1hZ2UvMS4xXCIgeG1sbnM6dmlkZW89XCJodHRwOi8vd3d3Lmdvb2dsZS5jb20vc2NoZW1hcy9zaXRlbWFwLXZpZGVvLzEuMVwiPlxuYFxucmV0dXJuIGhlYWRlclxuICB9XG5cbiAgcHJpdmF0ZSBnZXQgZ2V0Qm9keSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXRlbXMubWFwKChpdGVtKSA9PiB7XG4gICAgICB2YXIgaXRlbVJlc3VsdCA9ICBcbmBcbiAgPHVybD5cbiAgICA8bG9jPiR7IHRoaXMuYmFzZVVybCB9JHsgKCFpdGVtLnVybCkgPyAnJyA6IGAvJHsgaXRlbS51cmwgfWAgfTwvbG9jPlxuICAgIDxwcmlvcml0eT4ke2l0ZW0ucHJpb3JpdHl9PC9wcmlvcml0eT5cbiAgICA8bGFzdG1vZD4ke2l0ZW0ubGFzdE1vZGlmaWVkfTwvbGFzdG1vZD5cbiAgICA8Y2hhbmdlZnJlcT4ke2l0ZW0uY2hhbmdlRnJlcX08L2NoYW5nZWZyZXE+YFxuXG4gICAgaWYoaXRlbS5pbWFnZSkge1xuICAgICAgXG4gICAgICBpdGVtUmVzdWx0ICs9IFxuYFxuICAgICAgPGltYWdlOmltYWdlPlxuICAgICAgICA8aW1hZ2U6bG9jPiR7aXRlbS5pbWFnZS51cmx9PC9pbWFnZTpsb2M+XG4gICAgICAgIDxpbWFnZTpjYXB0aW9uPiR7aXRlbS5pbWFnZS5jYXB0aW9ufTwvaW1hZ2U6Y2FwdGlvbj5cbiAgICAgICAgPGltYWdlOnRpdGxlPiR7aXRlbS5pbWFnZS50aXRsZX08L2ltYWdlOnRpdGxlPlxuICAgICAgPC9pbWFnZTppbWFnZT5gXG4gICAgfVxuICAgIGl0ZW1SZXN1bHQgKz0gXG5gXG4gIDwvdXJsPlxuYFxucmV0dXJuIGl0ZW1SZXN1bHRcbiAgICBcbiAgfSlcbiAgLmpvaW4oJycpXG5cbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGdldEZvb3RlciAoKSB7XG4gICAgcmV0dXJuIGA8L3VybHNldD5gXG4gIH1cblxuICBwdWJsaWMgc2V0WG1sU3R5bGVTaGVldFBhdGgocGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy54bWxTdHlsZXNoZWV0UGF0aCA9IHBhdGhcbiAgfVxuXG4gIHB1YmxpYyBhZGRJdGVtKHVybEl0ZW06IFVybEl0ZW1JbnRlcmZhY2UpOiB2b2lkIHtcbiAgICB0aGlzLml0ZW1zLnB1c2gobmV3IFVybEl0ZW0odXJsSXRlbSkpXG4gIH1cblxuICBwdWJsaWMgZ2VuZXJhdGUoKTogc3RyaW5ne1xuICAgIGNvbnN0IHJlc3VsdCA9IFxuYFxuJHsgdGhpcy5nZXRIZWFkZXIgfVxuJHsgdGhpcy5nZXRCb2R5IH1cbiR7IHRoaXMuZ2V0Rm9vdGVyIH1cbmBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxufVxuXG4iLCJleHBvcnQgY29uc3QgdGl0bGVDYXNlU3RyaW5nID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgcmV0dXJuIHN0ci50b1N0cmluZygpLnNwbGl0KCcgJykubWFwKChzdHIpID0+IHN0ci50b1VwcGVyQ2FzZSgpLmNoYXJBdCgwKSArIHN0ci5zdWJzdHJpbmcoMSkudG9Mb3dlckNhc2UoKSkuam9pbignICcpXG59XG5cbmV4cG9ydCBjb25zdCByYW5kb21TdHJpbmcgPSAobGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xuICB2YXIgcmVzdWx0ICAgICAgICAgICA9ICcnXG4gIHZhciBjaGFyYWN0ZXJzICAgICAgID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5J1xuICB2YXIgY2hhcmFjdGVyc0xlbmd0aCA9IGNoYXJhY3RlcnMubGVuZ3RoXG4gIGZvciAoIHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICByZXN1bHQgKz0gY2hhcmFjdGVycy5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2hhcmFjdGVyc0xlbmd0aCkpXG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5leHBvcnQgY29uc3Qgam9pbkNvbW1hUGx1c0FuZCA9IChhOiBBcnJheTxhbnk+LCB1bmlmaWVyU3RyaW5nID0gJyBhbmQgJykgPT4ge1xuICByZXR1cm4gW2Euc2xpY2UoMCwgLTEpLmpvaW4oJywgJyksIGEuc2xpY2UoLTEpWzBdXS5qb2luKGEubGVuZ3RoIDwgMiA/ICcnIDogdW5pZmllclN0cmluZylcbn1cblxuZnVuY3Rpb24gbGV2ZW5zaHRlaW4oYTogc3RyaW5nLCBiOiBzdHJpbmcpIHtcbiAgY29uc3QgbWF0cml4ID0gW11cblxuICBmb3IgKGxldCBpID0gMDsgaSA8PSBiLmxlbmd0aDsgaSsrKSB7XG4gICAgICBtYXRyaXhbaV0gPSBbaV1cbiAgfVxuXG4gIGZvciAobGV0IGogPSAwOyBqIDw9IGEubGVuZ3RoOyBqKyspIHtcbiAgICAgIG1hdHJpeFswXVtqXSA9IGpcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IGIubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAxOyBqIDw9IGEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAoYi5jaGFyQXQoaSAtIDEpID09PSBhLmNoYXJBdChqIC0gMSkpIHtcbiAgICAgICAgICAgICAgbWF0cml4W2ldW2pdID0gbWF0cml4W2kgLSAxXVtqIC0gMV1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtYXRyaXhbaV1bal0gPSBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICAgIG1hdHJpeFtpIC0gMV1baiAtIDFdICsgMSxcbiAgICAgICAgICAgICAgICAgIE1hdGgubWluKFxuICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeFtpXVtqIC0gMV0gKyAxLFxuICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeFtpIC0gMV1bal0gKyAxXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICB9XG4gIH1cblxuICByZXR1cm4gbWF0cml4W2IubGVuZ3RoXVthLmxlbmd0aF1cbn1cblxuY29uc3QgcmVtb3ZlQWNjZW50cyA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIHJldHVybiBzdHIubm9ybWFsaXplKCdORkQnKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCAnJylcbn1cblxuZXhwb3J0IGNvbnN0IGNoZWNrU3RyaW5nU2ltaWxhcml0eSA9IChiYXNlOiBzdHJpbmcsIHN0cmluZ1RvQ29tcGFyZTogc3RyaW5nLCBjYXNlSW5zZW5zaXRpdmU6IGJvb2xlYW4gPSB0cnVlKTogbnVtYmVyID0+IHtcbiAgaWYoY2FzZUluc2Vuc2l0aXZlKSB7XG4gICAgYmFzZSA9IGJhc2UudG9Mb3dlckNhc2UoKVxuICAgIHN0cmluZ1RvQ29tcGFyZSA9IHN0cmluZ1RvQ29tcGFyZS50b0xvd2VyQ2FzZSgpXG4gIH1cbiAgXG4gIC8vIFJlbW92ZSBhY2VudG9zIHBhcmEgY29tcGFyYcOnw6NvXG4gIGJhc2UgPSByZW1vdmVBY2NlbnRzKGJhc2UpXG4gIHN0cmluZ1RvQ29tcGFyZSA9IHJlbW92ZUFjY2VudHMoc3RyaW5nVG9Db21wYXJlKVxuICBcbiAgY29uc3QgZGlzdGFuY2UgPSBsZXZlbnNodGVpbihiYXNlLCBzdHJpbmdUb0NvbXBhcmUpXG4gIGNvbnN0IG1heExlbiA9IE1hdGgubWF4KGJhc2UubGVuZ3RoLCBzdHJpbmdUb0NvbXBhcmUubGVuZ3RoKVxuICBjb25zdCBzaW1pbGFyaXR5ID0gMSAtIGRpc3RhbmNlIC8gbWF4TGVuXG4gIHJldHVybiBzaW1pbGFyaXR5XG59XG5cbmV4cG9ydCBjb25zdCBjaGVja1N0cmluZ0lzU2ltaWxhciA9IChiYXNlOiBzdHJpbmcsIHN0cmluZ1RvQ29tcGFyZTogc3RyaW5nLCB0aHJlc2hvbGQ6IG51bWJlciA9IDAuOCwgY2FzZUluc2Vuc2l0aXZlOiBib29sZWFuID0gdHJ1ZSk6IGJvb2xlYW4gPT4ge1xuICByZXR1cm4gY2hlY2tTdHJpbmdTaW1pbGFyaXR5KGJhc2UsIHN0cmluZ1RvQ29tcGFyZSwgY2FzZUluc2Vuc2l0aXZlKSA+PSB0aHJlc2hvbGRcbn1cblxuZXhwb3J0IGNvbnN0IGVuc3VyZVN0YXJ0c1dpdGhVcHBlckNhc2UgPSAoc3RyID0gJycpID0+IHtcbiAgaWYgKCFzdHIpIHJldHVybiAnJ1xuICBjb25zdCB0cmltbWVkU3RhcnQgPSBzdHIudHJpbVN0YXJ0KClcbiAgcmV0dXJuIHN0ci5zbGljZSgwLCBzdHIubGVuZ3RoIC0gdHJpbW1lZFN0YXJ0Lmxlbmd0aCkgKyB0cmltbWVkU3RhcnRbMF0udG9VcHBlckNhc2UoKSArIHRyaW1tZWRTdGFydC5zbGljZSgxKVxufVxuXG5leHBvcnQgY29uc3QgdHJ1bmNhdGVUZXh0ID0gKHRleHQ6IHN0cmluZyA9ICcnLCBtYXg6IG51bWJlciA9IDQwKSA9PiB7XG4gIHRyeSB7XG4gICAgaWYoIXRleHQpIHJldHVybiAnJ1xuICAgIGlmKG1heCA8PSAwKSByZXR1cm4gdGV4dCArICcuLi4nXG4gICAgcmV0dXJuIHRleHQubGVuZ3RoID4gbWF4ID8gYCR7dGV4dC5zdWJzdHJpbmcoMCwgbWF4KX0uLi5gIDogdGV4dFxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiB0ZXh0IHx8ICcnXG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBTaW1pbGFyU2VhcmNoT3B0aW9ucyB7XG4gIHRocmVzaG9sZD86IG51bWJlcjtcbiAgY2FzZUluc2Vuc2l0aXZlPzogYm9vbGVhbjtcbiAgc3BsaXRXb3Jkcz86IGJvb2xlYW47XG4gIHNlYXJjaEtleXM/OiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGNvbnN0IGZpbmRTaW1pbGFySXRlbXMgPSA8VD4oXG4gIGl0ZW1zOiBUW10sXG4gIHNlYXJjaFRleHQ6IHN0cmluZyxcbiAgb3B0aW9uczogU2ltaWxhclNlYXJjaE9wdGlvbnMgPSB7fVxuKTogVFtdID0+IHtcbiAgY29uc3Qge1xuICAgIHRocmVzaG9sZDogdXNlclRocmVzaG9sZCxcbiAgICBjYXNlSW5zZW5zaXRpdmUgPSB0cnVlLFxuICAgIHNwbGl0V29yZHMgPSBmYWxzZSxcbiAgICBzZWFyY2hLZXlzID0gW11cbiAgfSA9IG9wdGlvbnM7XG5cbiAgLy8gVXNlIGEgbG93ZXIgdGhyZXNob2xkIGZvciBzcGxpdCB3b3JkcyB0byBhbGxvdyBtb3JlIGZ1enp5IG1hdGNoZXMgb2YgaW5kaXZpZHVhbCB3b3Jkc1xuICAvLyBVc2UgYSBoaWdoZXIgdGhyZXNob2xkIGZvciBleGFjdCBwaHJhc2UgbWF0Y2hpbmcgd2hlbiBzcGxpdFdvcmRzIGlzIGZhbHNlXG4gIGNvbnN0IHRocmVzaG9sZCA9IHVzZXJUaHJlc2hvbGQgPz8gKHNwbGl0V29yZHMgPyAwLjUgOiAwLjgpO1xuXG4gIGlmICghc2VhcmNoVGV4dCkgcmV0dXJuIFtdO1xuXG4gIGNvbnN0IHNlYXJjaFRlcm1zID0gc3BsaXRXb3JkcyBcbiAgICA/IHNlYXJjaFRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodGVybSA9PiB0ZXJtLmxlbmd0aCA+IDApIFxuICAgIDogW3NlYXJjaFRleHRdO1xuXG4gIHJldHVybiBpdGVtcy5maWx0ZXIoaXRlbSA9PiB7XG4gICAgaWYgKGl0ZW0gPT09IG51bGwgfHwgaXRlbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHN0cmluZyBpdGVtc1xuICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChzcGxpdFdvcmRzKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1Xb3JkcyA9IGl0ZW0uc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApO1xuICAgICAgICByZXR1cm4gc2VhcmNoVGVybXMuZXZlcnkoc2VhcmNoVGVybSA9PiBcbiAgICAgICAgICBpdGVtV29yZHMuc29tZSh3b3JkID0+IHtcbiAgICAgICAgICAgIC8vIFRyeSBleGFjdCBzdWJzdHJpbmcgbWF0Y2ggZmlyc3RcbiAgICAgICAgICAgIGlmIChjYXNlSW5zZW5zaXRpdmUpIHtcbiAgICAgICAgICAgICAgaWYgKHdvcmQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAod29yZC5pbmNsdWRlcyhzZWFyY2hUZXJtKSkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoZW4gdHJ5IHNpbWlsYXJpdHkgbWF0Y2hcbiAgICAgICAgICAgIHJldHVybiBjaGVja1N0cmluZ1NpbWlsYXJpdHkod29yZCwgc2VhcmNoVGVybSwgY2FzZUluc2Vuc2l0aXZlKSA+PSB0aHJlc2hvbGQ7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gRm9yIG5vbi1zcGxpdCB3b3Jkc1xuICAgICAgcmV0dXJuIHNlYXJjaFRlcm1zLnNvbWUodGVybSA9PiB7XG4gICAgICAgIC8vIFRyeSBleGFjdCBzdWJzdHJpbmcgbWF0Y2ggZmlyc3RcbiAgICAgICAgaWYgKGNhc2VJbnNlbnNpdGl2ZSkge1xuICAgICAgICAgIGlmIChpdGVtLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXModGVybS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGl0ZW0uaW5jbHVkZXModGVybSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUaGVuIHRyeSBzaW1pbGFyaXR5IG1hdGNoXG4gICAgICAgIHJldHVybiBjaGVja1N0cmluZ1NpbWlsYXJpdHkoaXRlbSwgdGVybSwgY2FzZUluc2Vuc2l0aXZlKSA+PSB0aHJlc2hvbGQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgb2JqZWN0IGl0ZW1zXG4gICAgaWYgKHR5cGVvZiBpdGVtID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHNlYXJjaEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlYXJjaEtleXMuc29tZShrZXkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IChpdGVtIGFzIGFueSlba2V5XTtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb3IgZWFjaCBzZWFyY2ggdGVybVxuICAgICAgICByZXR1cm4gc2VhcmNoVGVybXMuZXZlcnkoc2VhcmNoVGVybSA9PiB7XG4gICAgICAgICAgLy8gQWx3YXlzIHRyeSBmdWxsIHZhbHVlIHNpbWlsYXJpdHkgZmlyc3RcbiAgICAgICAgICBpZiAoY2hlY2tTdHJpbmdTaW1pbGFyaXR5KHZhbHVlLCBzZWFyY2hUZXJtLCBjYXNlSW5zZW5zaXRpdmUpID49IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVHJ5IGV4YWN0IHN1YnN0cmluZyBtYXRjaFxuICAgICAgICAgIGlmIChjYXNlSW5zZW5zaXRpdmUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS5pbmNsdWRlcyhzZWFyY2hUZXJtKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgc3BsaXR0aW5nIHdvcmRzLCB0cnkgaW5kaXZpZHVhbCB3b3JkIG1hdGNoZXNcbiAgICAgICAgICBpZiAoc3BsaXRXb3Jkcykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWVXb3JkcyA9IHZhbHVlLnNwbGl0KC9cXHMrLykuZmlsdGVyKHcgPT4gdy5sZW5ndGggPiAwKTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVdvcmRzLnNvbWUod29yZCA9PiB7XG4gICAgICAgICAgICAgIC8vIFRyeSBleGFjdCBtYXRjaCBmaXJzdFxuICAgICAgICAgICAgICBpZiAoY2FzZUluc2Vuc2l0aXZlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHdvcmQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAod29yZC5pbmNsdWRlcyhzZWFyY2hUZXJtKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFRoZW4gdHJ5IHNpbWlsYXJpdHkgbWF0Y2ggb24gaW5kaXZpZHVhbCB3b3Jkc1xuICAgICAgICAgICAgICByZXR1cm4gY2hlY2tTdHJpbmdTaW1pbGFyaXR5KHdvcmQsIHNlYXJjaFRlcm0sIGNhc2VJbnNlbnNpdGl2ZSkgPj0gdGhyZXNob2xkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgdGl0bGVDYXNlVG9TbmFrZUNhc2UgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16MC05XSkoW0EtWl0pL2csICckMV8kMicpLnRvTG93ZXJDYXNlKClcbn1cblxuZXhwb3J0IGNvbnN0IFN0cmluZ0hlbHBlcnMgPSB7XG4gIHRpdGxlQ2FzZVN0cmluZyxcbiAgcmFuZG9tU3RyaW5nLFxuICBqb2luQ29tbWFQbHVzQW5kLFxuICBjaGVja1N0cmluZ1NpbWlsYXJpdHksXG4gIGNoZWNrU3RyaW5nSXNTaW1pbGFyLFxuICBlbnN1cmVTdGFydHNXaXRoVXBwZXJDYXNlLFxuICB0cnVuY2F0ZVRleHQsXG4gIGZpbmRTaW1pbGFySXRlbXMsXG4gIHRpdGxlQ2FzZVRvU25ha2VDYXNlLFxufSIsIlxuZXhwb3J0IGNvbnN0IGV4dHJhY3RNYXRjaHMgPSAodGV4dDogc3RyaW5nLCByZWdleDogUmVnRXhwKTogQXJyYXk8c3RyaW5nPiA9PiB7XG4gIGNvbnN0IG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKHJlZ2V4KSB8fCBbXVxuICByZXR1cm4gWy4uLm5ldyBTZXQobWF0Y2hlcyldXG59XG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VXVpZHNWNCA9ICh0ZXh0OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+ID0+IHtcbiAgY29uc3QgcmVnZXggPSAvW2EtZkEtRjAtOV17OH0tW2EtZkEtRjAtOV17NH0tNFthLWZBLUYwLTldezN9LVthLWZBLUYwLTldezR9LVthLWZBLUYwLTldezEyfS9nXG4gIHJldHVybiBleHRyYWN0TWF0Y2hzKHRleHQsIHJlZ2V4KVxufVxuXG5leHBvcnQgY29uc3QgZXh0cmFjdFV1aWRzVjcgPSAodGV4dDogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiA9PiB7XG4gIGNvbnN0IHJlZ2V4ID0gL1thLWZBLUYwLTldezh9LVthLWZBLUYwLTldezR9LTdbYS1mQS1GMC05XXszfS1bODlhYkFCXVthLWZBLUYwLTldezN9LVthLWZBLUYwLTldezEyfS9nXG4gIHJldHVybiBleHRyYWN0TWF0Y2hzKHRleHQsIHJlZ2V4KVxufVxuXG5leHBvcnQgY29uc3QgUmVnZXhIZWxwZXJzID0ge1xuICBleHRyYWN0TWF0Y2hzLFxuICBleHRyYWN0VXVpZHNWNCxcbiAgZXh0cmFjdFV1aWRzVjdcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYXNraXQgKHZhbHVlOiBzdHJpbmcgfCBudWxsLCBtYXNrOiBhbnksIG1hc2tlZCA9IHRydWUsIHRva2VuczogYW55KSB7XG4gIHZhbHVlID0gdmFsdWUgfHwgJydcbiAgbWFzayA9IG1hc2sgfHwgJydcbiAgbGV0IGlNYXNrID0gMFxuICBsZXQgaVZhbHVlID0gMFxuICBsZXQgb3V0cHV0ID0gJydcbiAgd2hpbGUgKGlNYXNrIDwgbWFzay5sZW5ndGggJiYgaVZhbHVlIDwgdmFsdWUubGVuZ3RoKSB7XG4gICAgdmFyIGNNYXNrID0gbWFza1tpTWFza11cbiAgICBjb25zdCBtYXNrZXIgPSB0b2tlbnNbY01hc2tdXG4gICAgY29uc3QgY1ZhbHVlID0gdmFsdWVbaVZhbHVlXVxuICAgIGlmIChtYXNrZXIgJiYgIW1hc2tlci5lc2NhcGUpIHtcbiAgICAgIGlmIChtYXNrZXIucGF0dGVybi50ZXN0KGNWYWx1ZSkpIHtcbiAgICAgIFx0b3V0cHV0ICs9IG1hc2tlci50cmFuc2Zvcm0gPyBtYXNrZXIudHJhbnNmb3JtKGNWYWx1ZSkgOiBjVmFsdWVcbiAgICAgICAgaU1hc2srK1xuICAgICAgfVxuICAgICAgaVZhbHVlKytcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hc2tlciAmJiBtYXNrZXIuZXNjYXBlKSB7XG4gICAgICAgIGlNYXNrKysgLy8gdGFrZSB0aGUgbmV4dCBtYXNrIGNoYXIgYW5kIHRyZWF0IGl0IGFzIGNoYXJcbiAgICAgICAgY01hc2sgPSBtYXNrW2lNYXNrXVxuICAgICAgfVxuICAgICAgaWYgKG1hc2tlZCkgb3V0cHV0ICs9IGNNYXNrXG4gICAgICBpZiAoY1ZhbHVlID09PSBjTWFzaykgaVZhbHVlKysgLy8gdXNlciB0eXBlZCB0aGUgc2FtZSBjaGFyXG4gICAgICBpTWFzaysrXG4gICAgfVxuICB9XG5cbiAgLy8gZml4IG1hc2sgdGhhdCBlbmRzIHdpdGggYSBjaGFyOiAoIylcbiAgbGV0IHJlc3RPdXRwdXQgPSAnJ1xuICB3aGlsZSAoaU1hc2sgPCBtYXNrLmxlbmd0aCAmJiBtYXNrZWQpIHtcbiAgICB2YXIgY01hc2sgPSBtYXNrW2lNYXNrXVxuICAgIGlmICh0b2tlbnNbY01hc2tdKSB7XG4gICAgICByZXN0T3V0cHV0ID0gJydcbiAgICAgIGJyZWFrXG4gICAgfVxuICAgIHJlc3RPdXRwdXQgKz0gY01hc2tcbiAgICBpTWFzaysrXG4gIH1cblxuICByZXR1cm4gb3V0cHV0ICsgcmVzdE91dHB1dFxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGR5bmFtaWNNYXNrIChtYXNraXQ6IGFueSwgbWFza3M6IGFueVtdLCB0b2tlbnM6IGFueSk6IGFueSB7XG4gIG1hc2tzID0gbWFza3Muc29ydCgoYSwgYikgPT4gYS5sZW5ndGggLSBiLmxlbmd0aClcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZTogYW55LCBtYXNrOiBhbnksIG1hc2tlZCA9IHRydWUpIHtcbiAgICB2YXIgaSA9IDBcbiAgICB3aGlsZSAoaSA8IG1hc2tzLmxlbmd0aCkge1xuICAgICAgdmFyIGN1cnJlbnRNYXNrID0gbWFza3NbaV1cbiAgICAgIGkrK1xuICAgICAgdmFyIG5leHRNYXNrID0gbWFza3NbaV1cbiAgICAgIGlmICghIChuZXh0TWFzayAmJiBtYXNraXQodmFsdWUsIG5leHRNYXNrLCB0cnVlLCB0b2tlbnMpLmxlbmd0aCA+IGN1cnJlbnRNYXNrLmxlbmd0aCkgKSB7XG4gICAgICAgIHJldHVybiBtYXNraXQodmFsdWUsIGN1cnJlbnRNYXNrLCBtYXNrZWQsIHRva2VucylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICcnXG4gIH1cbn0iLCJleHBvcnQgZGVmYXVsdCB7XG4gICcjJzogeyBwYXR0ZXJuOiAvXFxkLyB9LFxuICBYOiB7IHBhdHRlcm46IC9bMC05YS16QS1aXS8gfSxcbiAgUzogeyBwYXR0ZXJuOiAvW2EtekEtWl0vIH0sXG4gIEE6IHsgcGF0dGVybjogL1thLXpBLVpdLywgdHJhbnNmb3JtOiAodjogc3RyaW5nKSA9PiB2LnRvTG9jYWxlVXBwZXJDYXNlKCkgfSxcbiAgYTogeyBwYXR0ZXJuOiAvW2EtekEtWl0vLCB0cmFuc2Zvcm06ICh2OiBzdHJpbmcpID0+IHYudG9Mb2NhbGVMb3dlckNhc2UoKSB9LFxuICAnISc6IHsgZXNjYXBlOiB0cnVlIH1cbn0iLCJpbXBvcnQgbWFza2l0IGZyb20gJy4vbWFza2l0J1xuaW1wb3J0IGR5bmFtaWNNYXNrIGZyb20gJy4vZHluYW1pYy1tYXNrJ1xuaW1wb3J0IHRva2VucyBmcm9tICcuL3Rva2VucydcblxuZXhwb3J0IGNvbnN0IG1hc2tlciA9IGZ1bmN0aW9uICh2YWx1ZTogYW55LCBtYXNrOiBhbnksIG1hc2tlZCA9IHRydWUpIHtcblxuICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgXG4gIHJldHVybiBBcnJheS5pc0FycmF5KG1hc2spXG4gICAgPyBkeW5hbWljTWFzayhtYXNraXQsIG1hc2ssIHRva2VucykodmFsdWUsIG1hc2ssIG1hc2tlZCwgdG9rZW5zKVxuICAgIDogbWFza2l0KHZhbHVlLCBtYXNrLCBtYXNrZWQsIHRva2VucylcbiAgICBcbn0iLCJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1BIT05FX0RESSA9IFsnKyMjIycsICcrIyMnLCAnKyMnLCAnKyMtIyMjJ11cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BIT05FX01BU0sgPSBbJygjIykgIyMjIyMtIyMjIycsICcoIyMpICMjIyMtIyMjIyddXG5leHBvcnQgY29uc3QgREVGQVVMVF9QSE9ORV9NQVNLX1dJVEhfRERJID0gWycrIyMgIyMjICMjICMjICMjJywgJysjICgjIyMpICMjIy0jIyMjJywgJysjIyAoIyMpICMjIyMtIyMjIycsICcrIyMgKCMjKSAjIyMjIy0jIyMjJywgXSIsImltcG9ydCB7IG1hc2tlciB9IGZyb20gJy4vbWFzay9tYXNrZXInXG5pbXBvcnQgeyBERUZBVUxUX1BIT05FX0RESSwgREVGQVVMVF9QSE9ORV9NQVNLLCBERUZBVUxUX1BIT05FX01BU0tfV0lUSF9EREl9IGZyb20gJy4vbWFzay9lbnVtcydcblxuLy8gUGhvbmUgbnVtYmVyIGZvcm1hdHMgYnkgY291bnRyeVxuaW50ZXJmYWNlIFBob25lRm9ybWF0Q29uZmlnIHtcbiAgY291bnRyeUNvZGU6IHN0cmluZztcbiAgbWFzazogc3RyaW5nIHwgc3RyaW5nW107XG4gIGRpZ2l0Q291bnQ6IG51bWJlciB8IG51bWJlcltdO1xufVxuXG5jb25zdCBQSE9ORV9GT1JNQVRTOiBSZWNvcmQ8c3RyaW5nLCBQaG9uZUZvcm1hdENvbmZpZz4gPSB7XG4gIGJyYXppbDogeyBcbiAgICBjb3VudHJ5Q29kZTogJys1NScsIFxuICAgIG1hc2s6IFsnKCMjKSAjIyMjIy0jIyMjJywgJygjIykgIyMjIy0jIyMjJ10sIFxuICAgIGRpZ2l0Q291bnQ6IFsxMSwgMTBdIFxuICB9LFxuICB1czogeyBjb3VudHJ5Q29kZTogJysxJywgbWFzazogJygjIyMpICMjIy0jIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAgdXNhOiB7IGNvdW50cnlDb2RlOiAnKzEnLCBtYXNrOiAnKCMjIykgIyMjLSMjIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICBzcGFpbjogeyBjb3VudHJ5Q29kZTogJyszNCcsIG1hc2s6ICcjIyMgIyMjICMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgcG9ydHVnYWw6IHsgY291bnRyeUNvZGU6ICcrMzUxJywgbWFzazogJyMjIyAjIyMgIyMjJywgZGlnaXRDb3VudDogOSB9LFxuICBhcmdlbnRpbmE6IHsgY291bnRyeUNvZGU6ICcrNTQnLCBtYXNrOiAnKCMjKSAjIyMjLSMjIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICBpdGFseTogeyBjb3VudHJ5Q29kZTogJyszOScsIG1hc2s6ICcjIyMgIyMjICMjIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICBzd2l0emVybGFuZDogeyBjb3VudHJ5Q29kZTogJys0MScsIG1hc2s6ICcjIyAjIyMgIyMgIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIHN3aXNzOiB7IGNvdW50cnlDb2RlOiAnKzQxJywgbWFzazogJyMjICMjIyAjIyAjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgZnJhbmNlOiB7IGNvdW50cnlDb2RlOiAnKzMzJywgbWFzazogJyMgIyMgIyMgIyMgIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIGNoaW5hOiB7IGNvdW50cnlDb2RlOiAnKzg2JywgbWFzazogJyMjIyAjIyMjICMjIyMnLCBkaWdpdENvdW50OiAxMSB9LFxuICBydXNzaWE6IHsgY291bnRyeUNvZGU6ICcrNycsIG1hc2s6ICcoIyMjKSAjIyMtIyMtIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICBjYW5hZGE6IHsgY291bnRyeUNvZGU6ICcrMScsIG1hc2s6ICcoIyMjKSAjIyMtIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIG1leGljbzogeyBjb3VudHJ5Q29kZTogJys1MicsIG1hc2s6ICcoIyMpICMjIyMtIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIGNoaWxlOiB7IGNvdW50cnlDb2RlOiAnKzU2JywgbWFzazogJyMgIyMjIyAjIyMjJywgZGlnaXRDb3VudDogOSB9LFxuICAvLyBNYWpvciBFdXJvcGVhbiBjb3VudHJpZXNcbiAgZ2VybWFueTogeyBjb3VudHJ5Q29kZTogJys0OScsIG1hc2s6ICcjIyMjICMjIyMjIyMjJywgZGlnaXRDb3VudDogMTEgfSxcbiAgdWs6IHsgY291bnRyeUNvZGU6ICcrNDQnLCBtYXNrOiAnIyMjIyAjIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIHVuaXRlZGtpbmdkb206IHsgY291bnRyeUNvZGU6ICcrNDQnLCBtYXNrOiAnIyMjIyAjIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIG5ldGhlcmxhbmRzOiB7IGNvdW50cnlDb2RlOiAnKzMxJywgbWFzazogJyMgIyMjIyMjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIGJlbGdpdW06IHsgY291bnRyeUNvZGU6ICcrMzInLCBtYXNrOiAnIyMjICMjICMjICMjJywgZGlnaXRDb3VudDogOSB9LFxuICBhdXN0cmlhOiB7IGNvdW50cnlDb2RlOiAnKzQzJywgbWFzazogJyMjIyAjIyMjIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAgcG9sYW5kOiB7IGNvdW50cnlDb2RlOiAnKzQ4JywgbWFzazogJyMjIyAjIyMgIyMjJywgZGlnaXRDb3VudDogOSB9LFxuICBzd2VkZW46IHsgY291bnRyeUNvZGU6ICcrNDYnLCBtYXNrOiAnIyMgIyMjICMjICMjJywgZGlnaXRDb3VudDogOSB9LFxuICBub3J3YXk6IHsgY291bnRyeUNvZGU6ICcrNDcnLCBtYXNrOiAnIyMjICMjICMjIycsIGRpZ2l0Q291bnQ6IDggfSxcbiAgZGVubWFyazogeyBjb3VudHJ5Q29kZTogJys0NScsIG1hc2s6ICcjIyAjIyAjIyAjIycsIGRpZ2l0Q291bnQ6IDggfSxcbiAgZmlubGFuZDogeyBjb3VudHJ5Q29kZTogJyszNTgnLCBtYXNrOiAnIyMgIyMjICMjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIC8vIE1ham9yIEFzaWFuIGNvdW50cmllc1xuICBqYXBhbjogeyBjb3VudHJ5Q29kZTogJys4MScsIG1hc2s6ICcjIy0jIyMjLSMjIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICBzb3V0aGtvcmVhOiB7IGNvdW50cnlDb2RlOiAnKzgyJywgbWFzazogJyMjLSMjIyMtIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIGtvcmVhOiB7IGNvdW50cnlDb2RlOiAnKzgyJywgbWFzazogJyMjLSMjIyMtIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIGluZGlhOiB7IGNvdW50cnlDb2RlOiAnKzkxJywgbWFzazogJyMjIyMjICMjIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAgc2luZ2Fwb3JlOiB7IGNvdW50cnlDb2RlOiAnKzY1JywgbWFzazogJyMjIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDggfSxcbiAgbWFsYXlzaWE6IHsgY291bnRyeUNvZGU6ICcrNjAnLCBtYXNrOiAnIyMtIyMjICMjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIHRoYWlsYW5kOiB7IGNvdW50cnlDb2RlOiAnKzY2JywgbWFzazogJyMjLSMjIy0jIyMjJywgZGlnaXRDb3VudDogOSB9LFxuICB2aWV0bmFtOiB7IGNvdW50cnlDb2RlOiAnKzg0JywgbWFzazogJyMjLSMjIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgcGhpbGlwcGluZXM6IHsgY291bnRyeUNvZGU6ICcrNjMnLCBtYXNrOiAnIyMjLSMjIy0jIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAgaW5kb25lc2lhOiB7IGNvdW50cnlDb2RlOiAnKzYyJywgbWFzazogJyMjLSMjIyMtIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIC8vIE1ham9yIGNvdW50cmllcyBpbiBBbWVyaWNhc1xuICBjb2xvbWJpYTogeyBjb3VudHJ5Q29kZTogJys1NycsIG1hc2s6ICcjIyMgIyMjICMjIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICB2ZW5lenVlbGE6IHsgY291bnRyeUNvZGU6ICcrNTgnLCBtYXNrOiAnIyMjLSMjIyMjIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICBwZXJ1OiB7IGNvdW50cnlDb2RlOiAnKzUxJywgbWFzazogJyMjIyAjIyMgIyMjJywgZGlnaXRDb3VudDogOSB9LFxuICBlY3VhZG9yOiB7IGNvdW50cnlDb2RlOiAnKzU5MycsIG1hc2s6ICcjIy0jIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgdXJ1Z3VheTogeyBjb3VudHJ5Q29kZTogJys1OTgnLCBtYXNrOiAnIyMgIyMjICMjIycsIGRpZ2l0Q291bnQ6IDggfSxcbiAgcGFyYWd1YXk6IHsgY291bnRyeUNvZGU6ICcrNTk1JywgbWFzazogJyMjIyAjIyMjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIGJvbGl2aWE6IHsgY291bnRyeUNvZGU6ICcrNTkxJywgbWFzazogJyMjIyMjIyMjJywgZGlnaXRDb3VudDogOCB9LFxuICAvLyBNYWpvciBBZnJpY2FuIGNvdW50cmllc1xuICBzb3V0aGFmcmljYTogeyBjb3VudHJ5Q29kZTogJysyNycsIG1hc2s6ICcjIyAjIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgbmlnZXJpYTogeyBjb3VudHJ5Q29kZTogJysyMzQnLCBtYXNrOiAnIyMjICMjIyAjIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAgZWd5cHQ6IHsgY291bnRyeUNvZGU6ICcrMjAnLCBtYXNrOiAnIyMjICMjIyAjIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAgbW9yb2NjbzogeyBjb3VudHJ5Q29kZTogJysyMTInLCBtYXNrOiAnIyMjLSMjIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgYWxnZXJpYTogeyBjb3VudHJ5Q29kZTogJysyMTMnLCBtYXNrOiAnIyMjICMjICMjICMjJywgZGlnaXRDb3VudDogOSB9LFxuICAvLyBNYWpvciBPY2VhbmlhIGNvdW50cmllc1xuICBhdXN0cmFsaWE6IHsgY291bnRyeUNvZGU6ICcrNjEnLCBtYXNrOiAnIyMjICMjIyAjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIG5ld3plYWxhbmQ6IHsgY291bnRyeUNvZGU6ICcrNjQnLCBtYXNrOiAnIyMtIyMjICMjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIC8vIE1pZGRsZSBFYXN0XG4gIGlzcmFlbDogeyBjb3VudHJ5Q29kZTogJys5NzInLCBtYXNrOiAnIyMtIyMjLSMjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIHVhZTogeyBjb3VudHJ5Q29kZTogJys5NzEnLCBtYXNrOiAnIyMtIyMjICMjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIHVuaXRlZGFyYWJlbWlyYXRlczogeyBjb3VudHJ5Q29kZTogJys5NzEnLCBtYXNrOiAnIyMtIyMjICMjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIHNhdWRpYXJhYmlhOiB7IGNvdW50cnlDb2RlOiAnKzk2NicsIG1hc2s6ICcjIy0jIyMtIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgdHVya2V5OiB7IGNvdW50cnlDb2RlOiAnKzkwJywgbWFzazogJyMjIyAjIyMgIyMgIyMnLCBkaWdpdENvdW50OiAxMCB9XG59O1xuXG4vLyBDb3VudHJ5IGNvZGUgdG8gY291bnRyeSBtYXBwaW5nIGZvciBwcmVkaWN0aW9uXG5jb25zdCBDT1VOVFJZX0NPREVfTUFQOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnMSc6ICd1cycsICAgICAgLy8gVVMvQ2FuYWRhICh3ZSdsbCBkZWZhdWx0IHRvIFVTKVxuICAnNyc6ICdydXNzaWEnLCAgLy8gUnVzc2lhL0themFraHN0YW5cbiAgJzIwJzogJ2VneXB0JyxcbiAgJzI3JzogJ3NvdXRoYWZyaWNhJyxcbiAgJzMxJzogJ25ldGhlcmxhbmRzJyxcbiAgJzMyJzogJ2JlbGdpdW0nLFxuICAnMzMnOiAnZnJhbmNlJyxcbiAgJzM0JzogJ3NwYWluJyxcbiAgJzM5JzogJ2l0YWx5JyxcbiAgJzQxJzogJ3N3aXR6ZXJsYW5kJyxcbiAgJzQzJzogJ2F1c3RyaWEnLFxuICAnNDQnOiAndWsnLFxuICAnNDUnOiAnZGVubWFyaycsXG4gICc0Nic6ICdzd2VkZW4nLFxuICAnNDcnOiAnbm9yd2F5JyxcbiAgJzQ4JzogJ3BvbGFuZCcsXG4gICc0OSc6ICdnZXJtYW55JyxcbiAgJzUxJzogJ3BlcnUnLFxuICAnNTInOiAnbWV4aWNvJyxcbiAgJzU0JzogJ2FyZ2VudGluYScsXG4gICc1NSc6ICdicmF6aWwnLFxuICAnNTYnOiAnY2hpbGUnLFxuICAnNTcnOiAnY29sb21iaWEnLFxuICAnNTgnOiAndmVuZXp1ZWxhJyxcbiAgJzYwJzogJ21hbGF5c2lhJyxcbiAgJzYxJzogJ2F1c3RyYWxpYScsXG4gICc2Mic6ICdpbmRvbmVzaWEnLFxuICAnNjMnOiAncGhpbGlwcGluZXMnLFxuICAnNjQnOiAnbmV3emVhbGFuZCcsXG4gICc2NSc6ICdzaW5nYXBvcmUnLFxuICAnNjYnOiAndGhhaWxhbmQnLFxuICAnODEnOiAnamFwYW4nLFxuICAnODInOiAnc291dGhrb3JlYScsXG4gICc4NCc6ICd2aWV0bmFtJyxcbiAgJzg2JzogJ2NoaW5hJyxcbiAgJzkwJzogJ3R1cmtleScsXG4gICc5MSc6ICdpbmRpYScsXG4gICcyMTInOiAnbW9yb2NjbycsXG4gICcyMTMnOiAnYWxnZXJpYScsXG4gICcyMzQnOiAnbmlnZXJpYScsXG4gICczNTEnOiAncG9ydHVnYWwnLFxuICAnMzU4JzogJ2ZpbmxhbmQnLFxuICAnNTkxJzogJ2JvbGl2aWEnLFxuICAnNTkzJzogJ2VjdWFkb3InLFxuICAnNTk1JzogJ3BhcmFndWF5JyxcbiAgJzU5OCc6ICd1cnVndWF5JyxcbiAgJzk2Nic6ICdzYXVkaWFyYWJpYScsXG4gICc5NzEnOiAndWFlJyxcbiAgJzk3Mic6ICdpc3JhZWwnXG59O1xuXG4vKipcbiAqIFByZWRpY3RzIHRoZSBjb3VudHJ5IGJhc2VkIG9uIHRoZSBwaG9uZSBudW1iZXIncyBjb3VudHJ5IGNvZGVcbiAqIEBwYXJhbSBwaG9uZU51bWJlciAtIFRoZSBwaG9uZSBudW1iZXIgdG8gYW5hbHl6ZVxuICogQHJldHVybnMgVGhlIHByZWRpY3RlZCBjb3VudHJ5IG5hbWUgb3IgbnVsbCBpZiBub3QgZm91bmRcbiAqL1xuY29uc3QgcHJlZGljdENvdW50cnlGcm9tUGhvbmVOdW1iZXIgPSAocGhvbmVOdW1iZXI6IHN0cmluZyk6IHN0cmluZyB8IG51bGwgPT4ge1xuICBpZiAoIXBob25lTnVtYmVyKSByZXR1cm4gbnVsbDtcbiAgXG4gIC8vIFJlbW92ZSBhbGwgbm9uLW51bWVyaWMgY2hhcmFjdGVyc1xuICBjb25zdCBjbGVhbk51bWJlciA9IHBob25lTnVtYmVyLnJlcGxhY2UoL1xcRC9nLCAnJyk7XG4gIFxuICAvLyBNdXN0IGhhdmUgYXQgbGVhc3QgMTAgZGlnaXRzIChtaW5pbXVtIGludGVybmF0aW9uYWwgbnVtYmVyIGxlbmd0aCB3aXRoIGNvdW50cnkgY29kZSlcbiAgaWYgKGNsZWFuTnVtYmVyLmxlbmd0aCA8IDEwKSByZXR1cm4gbnVsbDtcbiAgXG4gIC8vIENoZWNrIGZvciBjb3VudHJ5IGNvZGVzIHN0YXJ0aW5nIGZyb20gbG9uZ2VzdCB0byBzaG9ydGVzdFxuICBjb25zdCBzb3J0ZWRDb3VudHJ5Q29kZXMgPSBPYmplY3Qua2V5cyhDT1VOVFJZX0NPREVfTUFQKS5zb3J0KChhLCBiKSA9PiBiLmxlbmd0aCAtIGEubGVuZ3RoKTtcbiAgXG4gIGZvciAoY29uc3QgY291bnRyeUNvZGUgb2Ygc29ydGVkQ291bnRyeUNvZGVzKSB7XG4gICAgaWYgKGNsZWFuTnVtYmVyLnN0YXJ0c1dpdGgoY291bnRyeUNvZGUpKSB7XG4gICAgICAvLyBBZGRpdGlvbmFsIHZhbGlkYXRpb246IGNoZWNrIGlmIHRoZSBudW1iZXIgYWZ0ZXIgcmVtb3ZpbmcgY291bnRyeSBjb2RlXG4gICAgICAvLyBoYXMgYSByZWFzb25hYmxlIGxlbmd0aCBmb3IgdGhhdCBjb3VudHJ5XG4gICAgICBjb25zdCByZW1haW5pbmdEaWdpdHMgPSBjbGVhbk51bWJlci5zbGljZShjb3VudHJ5Q29kZS5sZW5ndGgpO1xuICAgICAgY29uc3QgY291bnRyeU5hbWUgPSBDT1VOVFJZX0NPREVfTUFQW2NvdW50cnlDb2RlXTtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IFBIT05FX0ZPUk1BVFNbY291bnRyeU5hbWVdO1xuICAgICAgXG4gICAgICBpZiAoY29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGV4cGVjdGVkQ291bnRzID0gQXJyYXkuaXNBcnJheShjb25maWcuZGlnaXRDb3VudCkgPyBjb25maWcuZGlnaXRDb3VudCA6IFtjb25maWcuZGlnaXRDb3VudF07XG4gICAgICAgIGlmIChleHBlY3RlZENvdW50cy5pbmNsdWRlcyhyZW1haW5pbmdEaWdpdHMubGVuZ3RoKSkge1xuICAgICAgICAgIC8vIEZvciBzaW5nbGUtZGlnaXQgY291bnRyeSBjb2RlcyBsaWtlIFwiMVwiIG9yIFwiN1wiLCBiZSBtb3JlIHN0cmljdFxuICAgICAgICAgIC8vIE9ubHkgYWNjZXB0IGlmIHRoZSB0b3RhbCBsZW5ndGggaXMgcmVhc29uYWJsZSBmb3IgaW50ZXJuYXRpb25hbCBmb3JtYXRcbiAgICAgICAgICBpZiAoY291bnRyeUNvZGUubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvLyBGb3IgVVMvQ2FuYWRhICgrMSksIHRvdGFsIHNob3VsZCBiZSAxMSBkaWdpdHMgbWluaW11bSAoMSArIDEwKVxuICAgICAgICAgICAgLy8gRm9yIFJ1c3NpYSAoKzcpLCB0b3RhbCBzaG91bGQgYmUgMTEgZGlnaXRzIG1pbmltdW0gKDcgKyAxMClcbiAgICAgICAgICAgIGNvbnN0IHRvdGFsTGVuZ3RoID0gY2xlYW5OdW1iZXIubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKGNvdW50cnlDb2RlID09PSAnMScgJiYgdG90YWxMZW5ndGggPT09IDExICYmIHJlbWFpbmluZ0RpZ2l0cy5sZW5ndGggPT09IDEwKSB7XG4gICAgICAgICAgICAgIC8vIEFkZGl0aW9uYWwgY2hlY2sgZm9yIFVTL0NhbmFkYTogYXJlYSBjb2RlIHNob3VsZG4ndCBzdGFydCB3aXRoIDAgb3IgMVxuICAgICAgICAgICAgICBjb25zdCBhcmVhQ29kZSA9IHJlbWFpbmluZ0RpZ2l0cy5zdWJzdHJpbmcoMCwgMyk7XG4gICAgICAgICAgICAgIGlmIChhcmVhQ29kZVswXSAhPT0gJzAnICYmIGFyZWFDb2RlWzBdICE9PSAnMScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY291bnRyeU5hbWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY291bnRyeUNvZGUgPT09ICc3JyAmJiB0b3RhbExlbmd0aCA9PT0gMTEgJiYgcmVtYWluaW5nRGlnaXRzLmxlbmd0aCA9PT0gMTApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNvdW50cnlOYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBGb3IgbXVsdGktZGlnaXQgY291bnRyeSBjb2RlcywgdXNlIG5vcm1hbCB2YWxpZGF0aW9uXG4gICAgICAgICAgICByZXR1cm4gY291bnRyeU5hbWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogRm9ybWF0cyBhIHBob25lIG51bWJlciB3aXRoIGNvdW50cnkgY29kZSBiYXNlZCBvbiB0aGUgc3BlY2lmaWVkIGNvdW50cnlcbiAqIEBwYXJhbSBwaG9uZU51bWJlciAtIFRoZSBwaG9uZSBudW1iZXIgdG8gZm9ybWF0IChkaWdpdHMgb25seSlcbiAqIEBwYXJhbSBjb3VudHJ5IC0gVGhlIGNvdW50cnkgY29kZSAoZS5nLiwgJ2JyYXppbCcsICd1cycsICdzcGFpbicpIC0gb3B0aW9uYWwsIHdpbGwgYmUgcHJlZGljdGVkIGlmIG5vdCBwcm92aWRlZFxuICogQHBhcmFtIHRocm93c0Vycm9yT25WYWxpZGF0aW9uIC0gV2hldGhlciB0byB0aHJvdyBlcnJvcnMgb24gdmFsaWRhdGlvbiBmYWlsdXJlcyAoZGVmYXVsdDogZmFsc2UpXG4gKiBAcmV0dXJucyBGb3JtYXR0ZWQgcGhvbmUgbnVtYmVyIHdpdGggY291bnRyeSBjb2RlXG4gKi9cbmV4cG9ydCBjb25zdCBmb3JtYXRQaG9uZVdpdGhDb3VudHJ5Q29kZSA9IChwaG9uZU51bWJlcjogc3RyaW5nLCBjb3VudHJ5Pzogc3RyaW5nLCB0aHJvd3NFcnJvck9uVmFsaWRhdGlvbjogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nID0+IHtcbiAgaWYgKCFwaG9uZU51bWJlcikge1xuICAgIGlmICh0aHJvd3NFcnJvck9uVmFsaWRhdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQaG9uZSBudW1iZXIgaXMgcmVxdWlyZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hc2tlcihwaG9uZU51bWJlciwgREVGQVVMVF9QSE9ORV9NQVNLX1dJVEhfRERJLCB0cnVlKTtcbiAgfVxuXG4gIC8vIElmIG5vIGNvdW50cnkgaXMgcHJvdmlkZWQsIHRyeSB0byBwcmVkaWN0IGl0IGZyb20gdGhlIHBob25lIG51bWJlclxuICBsZXQgZmluYWxDb3VudHJ5ID0gY291bnRyeTtcbiAgaWYgKCFmaW5hbENvdW50cnkpIHtcbiAgICBjb25zdCBwcmVkaWN0ZWRDb3VudHJ5ID0gcHJlZGljdENvdW50cnlGcm9tUGhvbmVOdW1iZXIocGhvbmVOdW1iZXIpO1xuICAgIGlmIChwcmVkaWN0ZWRDb3VudHJ5KSB7XG4gICAgICBmaW5hbENvdW50cnkgPSBwcmVkaWN0ZWRDb3VudHJ5O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhyb3dzRXJyb3JPblZhbGlkYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgcHJlZGljdCBjb3VudHJ5IGZyb20gcGhvbmUgbnVtYmVyIGFuZCBubyBjb3VudHJ5IHdhcyBwcm92aWRlZCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hc2tlcihwaG9uZU51bWJlciwgREVGQVVMVF9QSE9ORV9NQVNLX1dJVEhfRERJLCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBjb3VudHJ5S2V5ID0gZmluYWxDb3VudHJ5LnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IGNvbmZpZyA9IFBIT05FX0ZPUk1BVFNbY291bnRyeUtleV07XG4gIFxuICBpZiAoIWNvbmZpZykge1xuICAgIGlmICh0aHJvd3NFcnJvck9uVmFsaWRhdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VudHJ5ICcke2ZpbmFsQ291bnRyeX0nIGlzIG5vdCBzdXBwb3J0ZWQuIFN1cHBvcnRlZCBjb3VudHJpZXM6ICR7T2JqZWN0LmtleXMoUEhPTkVfRk9STUFUUykuam9pbignLCAnKX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hc2tlcihwaG9uZU51bWJlciwgREVGQVVMVF9QSE9ORV9NQVNLX1dJVEhfRERJLCB0cnVlKTtcbiAgfVxuXG4gIC8vIFJlbW92ZSBhbGwgbm9uLW51bWVyaWMgY2hhcmFjdGVyc1xuICBsZXQgY2xlYW5OdW1iZXIgPSBwaG9uZU51bWJlci5yZXBsYWNlKC9cXEQvZywgJycpO1xuICBcbiAgLy8gSGFuZGxlIGNhc2VzIHdoZXJlIGNvdW50cnkgY29kZSBpcyBhbHJlYWR5IGluY2x1ZGVkIGluIHRoZSBpbnB1dFxuICBjb25zdCBjb3VudHJ5Q29kZURpZ2l0cyA9IGNvbmZpZy5jb3VudHJ5Q29kZS5yZXBsYWNlKC9cXEQvZywgJycpO1xuICBpZiAoY2xlYW5OdW1iZXIuc3RhcnRzV2l0aChjb3VudHJ5Q29kZURpZ2l0cykpIHtcbiAgICBjbGVhbk51bWJlciA9IGNsZWFuTnVtYmVyLnNsaWNlKGNvdW50cnlDb2RlRGlnaXRzLmxlbmd0aCk7XG4gIH1cbiAgXG4gIC8vIEhhbmRsZSBtdWx0aXBsZSBmb3JtYXRzIChsaWtlIEJyYXppbCB3aXRoIGJvdGggbW9iaWxlIGFuZCBsYW5kbGluZSlcbiAgaWYgKEFycmF5LmlzQXJyYXkoY29uZmlnLmRpZ2l0Q291bnQpKSB7XG4gICAgY29uc3QgdmFsaWRJbmRleCA9IGNvbmZpZy5kaWdpdENvdW50LmZpbmRJbmRleCgoY291bnQ6IG51bWJlcikgPT4gY2xlYW5OdW1iZXIubGVuZ3RoID09PSBjb3VudCk7XG4gICAgXG4gICAgaWYgKHZhbGlkSW5kZXggPT09IC0xKSB7XG4gICAgICBpZiAodGhyb3dzRXJyb3JPblZhbGlkYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQaG9uZSBudW1iZXIgZm9yICR7ZmluYWxDb3VudHJ5fSBzaG91bGQgaGF2ZSAke2NvbmZpZy5kaWdpdENvdW50LmpvaW4oJyBvciAnKX0gZGlnaXRzLCBidXQgZ290ICR7Y2xlYW5OdW1iZXIubGVuZ3RofWApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hc2tlcihwaG9uZU51bWJlciwgREVGQVVMVF9QSE9ORV9NQVNLX1dJVEhfRERJLCB0cnVlKTtcbiAgICB9XG4gICAgXG4gICAgY29uc3Qgc2VsZWN0ZWRNYXNrID0gQXJyYXkuaXNBcnJheShjb25maWcubWFzaykgPyBjb25maWcubWFza1t2YWxpZEluZGV4XSA6IGNvbmZpZy5tYXNrO1xuICAgIGNvbnN0IG1hc2tlZE51bWJlciA9IG1hc2tlcihjbGVhbk51bWJlciwgc2VsZWN0ZWRNYXNrLCB0cnVlKTtcbiAgICByZXR1cm4gYCR7Y29uZmlnLmNvdW50cnlDb2RlfSAke21hc2tlZE51bWJlcn1gO1xuICB9IGVsc2Uge1xuICAgIC8vIEhhbmRsZSBzaW5nbGUgZm9ybWF0IGNvdW50cmllc1xuICAgIGlmIChjbGVhbk51bWJlci5sZW5ndGggIT09IGNvbmZpZy5kaWdpdENvdW50KSB7XG4gICAgICBpZiAodGhyb3dzRXJyb3JPblZhbGlkYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQaG9uZSBudW1iZXIgZm9yICR7ZmluYWxDb3VudHJ5fSBzaG91bGQgaGF2ZSAke2NvbmZpZy5kaWdpdENvdW50fSBkaWdpdHMsIGJ1dCBnb3QgJHtjbGVhbk51bWJlci5sZW5ndGh9YCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFza2VyKHBob25lTnVtYmVyLCBERUZBVUxUX1BIT05FX01BU0tfV0lUSF9EREksIHRydWUpO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCBzZWxlY3RlZE1hc2sgPSBBcnJheS5pc0FycmF5KGNvbmZpZy5tYXNrKSA/IGNvbmZpZy5tYXNrWzBdIDogY29uZmlnLm1hc2s7XG4gICAgY29uc3QgbWFza2VkTnVtYmVyID0gbWFza2VyKGNsZWFuTnVtYmVyLCBzZWxlY3RlZE1hc2ssIHRydWUpO1xuICAgIHJldHVybiBgJHtjb25maWcuY291bnRyeUNvZGV9ICR7bWFza2VkTnVtYmVyfWA7XG4gIH1cbn07XG5cbi8qKlxuICogR2V0cyB0aGUgY291bnRyeSBjb2RlIGZvciBhIHNwZWNpZmljIGNvdW50cnlcbiAqIEBwYXJhbSBjb3VudHJ5IC0gVGhlIGNvdW50cnkgbmFtZVxuICogQHJldHVybnMgVGhlIGNvdW50cnkgY29kZSAoZS5nLiwgJys1NScgZm9yIEJyYXppbClcbiAqL1xuZXhwb3J0IGNvbnN0IGdldENvdW50cnlDb2RlID0gKGNvdW50cnk6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IGNvdW50cnlLZXkgPSBjb3VudHJ5LnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IGNvbmZpZyA9IFBIT05FX0ZPUk1BVFNbY291bnRyeUtleV07XG4gIFxuICBpZiAoIWNvbmZpZykge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ291bnRyeSAnJHtjb3VudHJ5fScgaXMgbm90IHN1cHBvcnRlZC4gU3VwcG9ydGVkIGNvdW50cmllczogJHtPYmplY3Qua2V5cyhQSE9ORV9GT1JNQVRTKS5qb2luKCcsICcpfWApO1xuICB9XG4gIFxuICByZXR1cm4gY29uZmlnLmNvdW50cnlDb2RlO1xufTtcblxuLyoqXG4gKiBHZXRzIGFsbCBzdXBwb3J0ZWQgY291bnRyaWVzIGZvciBwaG9uZSBmb3JtYXR0aW5nXG4gKiBAcmV0dXJucyBBcnJheSBvZiBzdXBwb3J0ZWQgY291bnRyeSBuYW1lc1xuICovXG5leHBvcnQgY29uc3QgZ2V0U3VwcG9ydGVkQ291bnRyaWVzID0gKCk6IHN0cmluZ1tdID0+IHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKFBIT05FX0ZPUk1BVFMpO1xufTtcblxuLyoqXG4gKiBWYWxpZGF0ZXMgaWYgYSBwaG9uZSBudW1iZXIgaXMgdmFsaWQgZm9yIGEgc3BlY2lmaWMgY291bnRyeVxuICogQHBhcmFtIHBob25lTnVtYmVyIC0gVGhlIHBob25lIG51bWJlciB0byB2YWxpZGF0ZVxuICogQHBhcmFtIGNvdW50cnkgLSBUaGUgY291bnRyeSBjb2RlIChvcHRpb25hbCwgd2lsbCBiZSBwcmVkaWN0ZWQgaWYgbm90IHByb3ZpZGVkKVxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBjb25zdCBpc1ZhbGlkUGhvbmVOdW1iZXIgPSAocGhvbmVOdW1iZXI6IHN0cmluZywgY291bnRyeT86IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICB0cnkge1xuICAgIGZvcm1hdFBob25lV2l0aENvdW50cnlDb2RlKHBob25lTnVtYmVyLCBjb3VudHJ5LCB0cnVlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG4vKipcbiAqIFByZWRpY3RzIHRoZSBjb3VudHJ5IGJhc2VkIG9uIHRoZSBwaG9uZSBudW1iZXIncyBjb3VudHJ5IGNvZGVcbiAqIEBwYXJhbSBwaG9uZU51bWJlciAtIFRoZSBwaG9uZSBudW1iZXIgdG8gYW5hbHl6ZVxuICogQHJldHVybnMgVGhlIHByZWRpY3RlZCBjb3VudHJ5IG5hbWUgb3IgbnVsbCBpZiBub3QgZm91bmRcbiAqL1xuZXhwb3J0IGNvbnN0IHByZWRpY3RDb3VudHJ5RnJvbVBob25lID0gKHBob25lTnVtYmVyOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsID0+IHtcbiAgcmV0dXJuIHByZWRpY3RDb3VudHJ5RnJvbVBob25lTnVtYmVyKHBob25lTnVtYmVyKTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgdmFsaWQgZGlnaXQgY291bnRzIGZvciBhIHNwZWNpZmljIGNvdW50cnlcbiAqIEBwYXJhbSBjb3VudHJ5IC0gVGhlIGNvdW50cnkgbmFtZVxuICogQHJldHVybnMgQXJyYXkgb2YgdmFsaWQgZGlnaXQgY291bnRzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRWYWxpZERpZ2l0Q291bnRzID0gKGNvdW50cnk6IHN0cmluZyk6IG51bWJlcltdID0+IHtcbiAgY29uc3QgY291bnRyeUtleSA9IGNvdW50cnkudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgY29uZmlnID0gUEhPTkVfRk9STUFUU1tjb3VudHJ5S2V5XTtcbiAgXG4gIGlmICghY29uZmlnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDb3VudHJ5ICcke2NvdW50cnl9JyBpcyBub3Qgc3VwcG9ydGVkLiBTdXBwb3J0ZWQgY291bnRyaWVzOiAke09iamVjdC5rZXlzKFBIT05FX0ZPUk1BVFMpLmpvaW4oJywgJyl9YCk7XG4gIH1cbiAgXG4gIHJldHVybiBBcnJheS5pc0FycmF5KGNvbmZpZy5kaWdpdENvdW50KSA/IGNvbmZpZy5kaWdpdENvdW50IDogW2NvbmZpZy5kaWdpdENvdW50XTtcbn07XG5cbi8qKlxuICogRXh0cmFjdHMgdGhlIGNvdW50cnkgY29kZSBhbmQgcGhvbmUgbnVtYmVyIGZyb20gYSBmb3JtYXR0ZWQgcGhvbmUgbnVtYmVyXG4gKiBAcGFyYW0gcGhvbmVOdW1iZXIgLSBUaGUgcGhvbmUgbnVtYmVyIHRvIGV4dHJhY3QgZnJvbSAoY2FuIGJlIGZvcm1hdHRlZCBvciB1bmZvcm1hdHRlZClcbiAqIEByZXR1cm5zIE9iamVjdCBjb250YWluaW5nIGNvdW50cnlDb2RlLCBwaG9uZU51bWJlciAoaWYgY29tcGxldGUpLCBjb3VudHJ5LCBhbmQgbWFzaywgb3Igb25seSBjb3VudHJ5Q29kZSBhbmQgY291bnRyeSAoaWYgaW5jb21wbGV0ZSksIG9yIG51bGwgaWYgZXh0cmFjdGlvbiBmYWlsc1xuICovXG5leHBvcnQgY29uc3QgZXh0cmFjdENvdW50cnlDb2RlQW5kUGhvbmUgPSAocGhvbmVOdW1iZXI6IHN0cmluZyk6IHsgY291bnRyeUNvZGU6IHN0cmluZzsgcGhvbmVOdW1iZXI/OiBzdHJpbmc7IGNvdW50cnk/OiBzdHJpbmc7IG1hc2s/OiBzdHJpbmcgfCBzdHJpbmdbXSB9IHwgbnVsbCA9PiB7XG4gIGlmICghcGhvbmVOdW1iZXIpIHJldHVybiBudWxsO1xuICBcbiAgLy8gQ2hlY2sgaWYgdGhlIG9yaWdpbmFsIGlucHV0IGNvbnRhaW5zIGxldHRlcnMgbWl4ZWQgd2l0aCBudW1iZXJzIChpbnZhbGlkIHBob25lIG51bWJlcilcbiAgY29uc3QgaGFzTGV0dGVycyA9IC9bYS16QS1aXS8udGVzdChwaG9uZU51bWJlcik7XG4gIGNvbnN0IGhhc051bWJlcnMgPSAvXFxkLy50ZXN0KHBob25lTnVtYmVyKTtcbiAgXG4gIC8vIElmIHRoZXJlIGFyZSBib3RoIGxldHRlcnMgYW5kIG51bWJlcnMsIGl0J3MgYW4gaW52YWxpZCBwaG9uZSBudW1iZXJcbiAgaWYgKGhhc0xldHRlcnMgJiYgaGFzTnVtYmVycykge1xuICAgIC8vIEFsbG93IHNwZWNpZmljIGNhc2VzIGxpa2UgV2hhdHNBcHAgSklEc1xuICAgIGNvbnN0IGlzV2hhdHNBcHBKaWQgPSAvQChzXFwud2hhdHNhcHBcXC5uZXR8Z1xcLnVzfGNcXC51cykkL2kudGVzdChwaG9uZU51bWJlcik7XG4gICAgaWYgKCFpc1doYXRzQXBwSmlkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIFJlbW92ZSBhbGwgbm9uLW51bWVyaWMgY2hhcmFjdGVycyBleGNlcHQgdGhlIHBsdXMgc2lnblxuICBjb25zdCBjbGVhbk51bWJlciA9IHBob25lTnVtYmVyLnJlcGxhY2UoL1teXFxkK10vZywgJycpO1xuICBcbiAgLy8gSWYgdGhlIG51bWJlciBzdGFydHMgd2l0aCArLCBleHRyYWN0IGNvdW50cnkgY29kZSBmcm9tIGl0XG4gIGlmIChjbGVhbk51bWJlci5zdGFydHNXaXRoKCcrJykpIHtcbiAgICBjb25zdCBudW1iZXJXaXRob3V0UGx1cyA9IGNsZWFuTnVtYmVyLnNsaWNlKDEpO1xuICAgIFxuICAgIC8vIFRyeSB0byBmaW5kIG1hdGNoaW5nIGNvdW50cnkgY29kZVxuICAgIGNvbnN0IHNvcnRlZENvdW50cnlDb2RlcyA9IE9iamVjdC5rZXlzKENPVU5UUllfQ09ERV9NQVApLnNvcnQoKGEsIGIpID0+IGIubGVuZ3RoIC0gYS5sZW5ndGgpO1xuICAgIFxuICAgIGZvciAoY29uc3QgY291bnRyeUNvZGUgb2Ygc29ydGVkQ291bnRyeUNvZGVzKSB7XG4gICAgICBpZiAobnVtYmVyV2l0aG91dFBsdXMuc3RhcnRzV2l0aChjb3VudHJ5Q29kZSkpIHtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nTnVtYmVyID0gbnVtYmVyV2l0aG91dFBsdXMuc2xpY2UoY291bnRyeUNvZGUubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgY291bnRyeU5hbWUgPSBDT1VOVFJZX0NPREVfTUFQW2NvdW50cnlDb2RlXTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gUEhPTkVfRk9STUFUU1tjb3VudHJ5TmFtZV07XG4gICAgICAgIFxuICAgICAgICBpZiAoY29uZmlnKSB7XG4gICAgICAgICAgY29uc3QgZXhwZWN0ZWRDb3VudHMgPSBBcnJheS5pc0FycmF5KGNvbmZpZy5kaWdpdENvdW50KSA/IGNvbmZpZy5kaWdpdENvdW50IDogW2NvbmZpZy5kaWdpdENvdW50XTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBJZiB0aGUgcmVtYWluaW5nIG51bWJlciBoYXMgdGhlIGNvcnJlY3QgbGVuZ3RoLCByZXR1cm4gY29tcGxldGUgaW5mb3JtYXRpb25cbiAgICAgICAgICBpZiAoZXhwZWN0ZWRDb3VudHMuaW5jbHVkZXMocmVtYWluaW5nTnVtYmVyLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIC8vIEFkZGl0aW9uYWwgdmFsaWRhdGlvbiBmb3Igc2luZ2xlLWRpZ2l0IGNvdW50cnkgY29kZXNcbiAgICAgICAgICAgIGlmIChjb3VudHJ5Q29kZS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgaWYgKGNvdW50cnlDb2RlID09PSAnMScgJiYgcmVtYWluaW5nTnVtYmVyLmxlbmd0aCA9PT0gMTApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhcmVhQ29kZSA9IHJlbWFpbmluZ051bWJlci5zdWJzdHJpbmcoMCwgMyk7XG4gICAgICAgICAgICAgICAgaWYgKGFyZWFDb2RlWzBdICE9PSAnMCcgJiYgYXJlYUNvZGVbMF0gIT09ICcxJykge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnRyeUNvZGU6IGNvbmZpZy5jb3VudHJ5Q29kZSxcbiAgICAgICAgICAgICAgICAgICAgcGhvbmVOdW1iZXI6IHJlbWFpbmluZ051bWJlcixcbiAgICAgICAgICAgICAgICAgICAgY291bnRyeTogY291bnRyeU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGNvbmZpZy5tYXNrXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb3VudHJ5Q29kZSA9PT0gJzcnICYmIHJlbWFpbmluZ051bWJlci5sZW5ndGggPT09IDEwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlOiBjb25maWcuY291bnRyeUNvZGUsXG4gICAgICAgICAgICAgICAgICBwaG9uZU51bWJlcjogcmVtYWluaW5nTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgY291bnRyeTogY291bnRyeU5hbWUsXG4gICAgICAgICAgICAgICAgICBtYXNrOiBjb25maWcubWFza1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY291bnRyeUNvZGU6IGNvbmZpZy5jb3VudHJ5Q29kZSxcbiAgICAgICAgICAgICAgICBwaG9uZU51bWJlcjogcmVtYWluaW5nTnVtYmVyLFxuICAgICAgICAgICAgICAgIGNvdW50cnk6IGNvdW50cnlOYW1lLFxuICAgICAgICAgICAgICAgIG1hc2s6IGNvbmZpZy5tYXNrXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSByZW1haW5pbmcgbnVtYmVyIGlzIHNob3J0ZXIgdGhhbiBleHBlY3RlZCwgcmV0dXJuIG9ubHkgY291bnRyeSBjb2RlXG4gICAgICAgICAgICBjb25zdCBtaW5FeHBlY3RlZENvdW50ID0gTWF0aC5taW4oLi4uZXhwZWN0ZWRDb3VudHMpO1xuICAgICAgICAgICAgaWYgKHJlbWFpbmluZ051bWJlci5sZW5ndGggPiAwICYmIHJlbWFpbmluZ051bWJlci5sZW5ndGggPCBtaW5FeHBlY3RlZENvdW50KSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY291bnRyeUNvZGU6IGNvbmZpZy5jb3VudHJ5Q29kZSxcbiAgICAgICAgICAgICAgICBjb3VudHJ5OiBjb3VudHJ5TmFtZSxcbiAgICAgICAgICAgICAgICBtYXNrOiBjb25maWcubWFza1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJZiBubyArIHNpZ24sIHRyeSB0byBwcmVkaWN0IGNvdW50cnkgZnJvbSB0aGUgbnVtYmVyXG4gICAgY29uc3QgcHJlZGljdGVkQ291bnRyeSA9IHByZWRpY3RDb3VudHJ5RnJvbVBob25lTnVtYmVyKGNsZWFuTnVtYmVyKTtcbiAgICBcbiAgICBpZiAocHJlZGljdGVkQ291bnRyeSkge1xuICAgICAgY29uc3QgY29uZmlnID0gUEhPTkVfRk9STUFUU1twcmVkaWN0ZWRDb3VudHJ5XTtcbiAgICAgIGNvbnN0IGNvdW50cnlDb2RlRGlnaXRzID0gY29uZmlnLmNvdW50cnlDb2RlLnJlcGxhY2UoL1xcRC9nLCAnJyk7XG4gICAgICBcbiAgICAgIGlmIChjbGVhbk51bWJlci5zdGFydHNXaXRoKGNvdW50cnlDb2RlRGlnaXRzKSkge1xuICAgICAgICBjb25zdCBwaG9uZVdpdGhvdXRDb3VudHJ5Q29kZSA9IGNsZWFuTnVtYmVyLnNsaWNlKGNvdW50cnlDb2RlRGlnaXRzLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IGV4cGVjdGVkQ291bnRzID0gQXJyYXkuaXNBcnJheShjb25maWcuZGlnaXRDb3VudCkgPyBjb25maWcuZGlnaXRDb3VudCA6IFtjb25maWcuZGlnaXRDb3VudF07XG4gICAgICAgIFxuICAgICAgICBpZiAoZXhwZWN0ZWRDb3VudHMuaW5jbHVkZXMocGhvbmVXaXRob3V0Q291bnRyeUNvZGUubGVuZ3RoKSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb3VudHJ5Q29kZTogY29uZmlnLmNvdW50cnlDb2RlLFxuICAgICAgICAgICAgcGhvbmVOdW1iZXI6IHBob25lV2l0aG91dENvdW50cnlDb2RlLFxuICAgICAgICAgICAgY291bnRyeTogcHJlZGljdGVkQ291bnRyeSxcbiAgICAgICAgICAgIG1hc2s6IGNvbmZpZy5tYXNrXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBwaG9uZSBudW1iZXIgaXMgaW5jb21wbGV0ZSwgcmV0dXJuIG9ubHkgY291bnRyeSBjb2RlXG4gICAgICAgICAgY29uc3QgbWluRXhwZWN0ZWRDb3VudCA9IE1hdGgubWluKC4uLmV4cGVjdGVkQ291bnRzKTtcbiAgICAgICAgICBpZiAocGhvbmVXaXRob3V0Q291bnRyeUNvZGUubGVuZ3RoID4gMCAmJiBwaG9uZVdpdGhvdXRDb3VudHJ5Q29kZS5sZW5ndGggPCBtaW5FeHBlY3RlZENvdW50KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb3VudHJ5Q29kZTogY29uZmlnLmNvdW50cnlDb2RlLFxuICAgICAgICAgICAgICBjb3VudHJ5OiBwcmVkaWN0ZWRDb3VudHJ5LFxuICAgICAgICAgICAgICBtYXNrOiBjb25maWcubWFza1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE51bWJlciB3aXRob3V0IGNvdW50cnkgY29kZVxuICAgICAgICBjb25zdCBleHBlY3RlZENvdW50cyA9IEFycmF5LmlzQXJyYXkoY29uZmlnLmRpZ2l0Q291bnQpID8gY29uZmlnLmRpZ2l0Q291bnQgOiBbY29uZmlnLmRpZ2l0Q291bnRdO1xuICAgICAgICBpZiAoZXhwZWN0ZWRDb3VudHMuaW5jbHVkZXMoY2xlYW5OdW1iZXIubGVuZ3RoKSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb3VudHJ5Q29kZTogY29uZmlnLmNvdW50cnlDb2RlLFxuICAgICAgICAgICAgcGhvbmVOdW1iZXI6IGNsZWFuTnVtYmVyLFxuICAgICAgICAgICAgY291bnRyeTogcHJlZGljdGVkQ291bnRyeSxcbiAgICAgICAgICAgIG1hc2s6IGNvbmZpZy5tYXNrXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBDaGVjayBpZiBpdCdzIGEgcGFydGlhbCBudW1iZXIgdGhhdCBjb3VsZCBtYXRjaCBhIGNvdW50cnkgY29kZVxuICAgIGNvbnN0IHNvcnRlZENvdW50cnlDb2RlcyA9IE9iamVjdC5rZXlzKENPVU5UUllfQ09ERV9NQVApLnNvcnQoKGEsIGIpID0+IGIubGVuZ3RoIC0gYS5sZW5ndGgpO1xuICAgIFxuICAgIGZvciAoY29uc3QgY291bnRyeUNvZGUgb2Ygc29ydGVkQ291bnRyeUNvZGVzKSB7XG4gICAgICBpZiAoY2xlYW5OdW1iZXIuc3RhcnRzV2l0aChjb3VudHJ5Q29kZSkpIHtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nTnVtYmVyID0gY2xlYW5OdW1iZXIuc2xpY2UoY291bnRyeUNvZGUubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgY291bnRyeU5hbWUgPSBDT1VOVFJZX0NPREVfTUFQW2NvdW50cnlDb2RlXTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gUEhPTkVfRk9STUFUU1tjb3VudHJ5TmFtZV07XG4gICAgICAgIFxuICAgICAgICBpZiAoY29uZmlnKSB7XG4gICAgICAgICAgY29uc3QgZXhwZWN0ZWRDb3VudHMgPSBBcnJheS5pc0FycmF5KGNvbmZpZy5kaWdpdENvdW50KSA/IGNvbmZpZy5kaWdpdENvdW50IDogW2NvbmZpZy5kaWdpdENvdW50XTtcbiAgICAgICAgICBjb25zdCBtaW5FeHBlY3RlZENvdW50ID0gTWF0aC5taW4oLi4uZXhwZWN0ZWRDb3VudHMpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIElmIHdlIGhhdmUgc29tZSBkaWdpdHMgYnV0IG5vdCBlbm91Z2ggZm9yIGEgY29tcGxldGUgbnVtYmVyXG4gICAgICAgICAgaWYgKHJlbWFpbmluZ051bWJlci5sZW5ndGggPiAwICYmIHJlbWFpbmluZ051bWJlci5sZW5ndGggPCBtaW5FeHBlY3RlZENvdW50KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb3VudHJ5Q29kZTogY29uZmlnLmNvdW50cnlDb2RlLFxuICAgICAgICAgICAgICBjb3VudHJ5OiBjb3VudHJ5TmFtZSxcbiAgICAgICAgICAgICAgbWFzazogY29uZmlnLm1hc2tcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbnVsbDtcbn07XG5cbmV4cG9ydCBjb25zdCBtYXNrID0gKHZhbHVlOiBhbnksIG1hc2s6IGFueSkgPT4ge1xuICByZXR1cm4gbWFza2VyKHZhbHVlLCBtYXNrLCB0cnVlKVxufVxuXG5leHBvcnQgY29uc3QgdW5tYXNrID0gKHZhbHVlOiBhbnksIG1hc2s6IGFueSkgPT4ge1xuICByZXR1cm4gbWFza2VyKHZhbHVlLCBtYXNrLCBmYWxzZSlcbn1cblxuZXhwb3J0IGNvbnN0IE1hc2tlciA9IHtcbiAgbWFzayxcbiAgdW5tYXNrLFxuICBERUZBVUxUX1BIT05FX0RESSxcbiAgREVGQVVMVF9QSE9ORV9NQVNLLFxuICBERUZBVUxUX1BIT05FX01BU0tfV0lUSF9EREksXG4gIGZvcm1hdFBob25lV2l0aENvdW50cnlDb2RlLFxuICBnZXRDb3VudHJ5Q29kZSxcbiAgZ2V0U3VwcG9ydGVkQ291bnRyaWVzLFxuICBpc1ZhbGlkUGhvbmVOdW1iZXIsXG4gIGdldFZhbGlkRGlnaXRDb3VudHMsXG4gIHByZWRpY3RDb3VudHJ5RnJvbVBob25lLFxuICBleHRyYWN0Q291bnRyeUNvZGVBbmRQaG9uZVxufSIsImV4cG9ydCBjb25zdCBtYXBBcnJheVRvR3JhcGhRTCA9IChhcnJheTogYW55W10sIGtleTogc3RyaW5nIHwgbnVsbCA9IG51bGwpID0+IHtcbiAgY29uc3QgaXRlbXMgPSBhcnJheS5tYXAoKGl0ZW0pID0+IGBcIiR7IGtleSA/IGl0ZW1ba2V5XSA6IGl0ZW0gfVwiYCkuam9pbignLCcpXG4gIHJldHVybiBgWyR7IGl0ZW1zIH1dYFxufVxuXG5cbmV4cG9ydCBjb25zdCBHcmFwaFFMSGVscGVycyA9IHtcbiAgbWFwQXJyYXlUb0dyYXBoUUxcbn0iLCJcbmV4cG9ydCBjb25zdCBmb3JtYXRGaWxlU2l6ZSA9IChieXRlczogbnVtYmVyIHwgc3RyaW5nKSA9PiB7XG4gICAgaWYgKGJ5dGVzID09PSBudWxsIHx8IGJ5dGVzID09PSB1bmRlZmluZWQgfHwgYnl0ZXMgPT09ICcnKSByZXR1cm4gJzAgQnl0ZXMnXG4gICAgXG4gICAgYnl0ZXMgPSBOdW1iZXIoYnl0ZXMpXG4gICAgXG4gICAgaWYgKGlzTmFOKGJ5dGVzKSB8fCBieXRlcyA8IDAgfHwgYnl0ZXMgPT09IDApIHJldHVybiAnMCBCeXRlcydcbiAgICBcbiAgICBjb25zdCBrID0gMTAyNFxuICAgIGNvbnN0IHNpemVzID0gWydCeXRlcycsICdLQicsICdNQicsICdHQicsICdUQicsICdQQiddXG4gICAgY29uc3QgaSA9IE1hdGgubWF4KDAsIE1hdGgubWluKE1hdGguZmxvb3IoTWF0aC5sb2coYnl0ZXMpIC8gTWF0aC5sb2coaykpLCBzaXplcy5sZW5ndGggLSAxKSlcbiAgICBcbiAgICByZXR1cm4gcGFyc2VGbG9hdCgoYnl0ZXMgLyBNYXRoLnBvdyhrLCBpKSkudG9GaXhlZCgyKSkgKyAnICcgKyBzaXplc1tpXVxuICB9XG5cbmV4cG9ydCBjb25zdCBmb3JtYXRGaWxlRXh0ZW5zaW9uID0gKGZpbGU6IHN0cmluZykgPT4ge1xuICByZXR1cm4gJy4nICsgZmlsZS5zcGxpdCgnLicpLnBvcCgpXG59XG5cbmV4cG9ydCBjb25zdCBmb3JtYXRGaWxlTmFtZSA9IChmaWxlOiBzdHJpbmcpID0+IHtcbiAgcmV0dXJuIGZpbGUuc3BsaXQoJy8nKS5wb3AoKVxufVxuXG5leHBvcnQgY29uc3QgZm9ybWF0RmlsZUNvbG9yID0gKHBhdGg6IHN0cmluZykgPT4ge1xuICBjb25zdCBleHRlbnNpb24gPSBmb3JtYXRGaWxlRXh0ZW5zaW9uKHBhdGgpIGFzIHN0cmluZ1xuICBpZiAoWycucGRmJ10uaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xuICAgIHJldHVybiAnI2VmNDQ0NCdcbiAgfSBlbHNlIGlmIChbJy5kb2MnLCAnLmRvY3gnXS5pbmNsdWRlcyhleHRlbnNpb24pKSB7XG4gICAgcmV0dXJuICcjM2I4MmY2J1xuICB9IGVsc2UgaWYgKFsnLnhscycsICcueGxzeCddLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcbiAgICByZXR1cm4gJyMyMmM1NWUnXG4gIH0gZWxzZSBpZiAoWycucG5nJywgJy5qcGcnLCAnLmpwZWcnLCAnLmdpZicsICcubXA0JywgJy5tcGVnJywgJy53ZWJtJywgJy53ZWJwJywgJy5zdmcnXS5pbmNsdWRlcyhleHRlbnNpb24pKSB7XG4gICAgcmV0dXJuICcjZWFiMzA4J1xuICB9XG4gIHJldHVybiAnIzZiNzI4MCdcbn1cblxuZXhwb3J0IGNvbnN0IGdldEZpbGVJY29uID0gKHBhdGg6IHN0cmluZywgcHJvdmlkZXI6IHN0cmluZyA9ICdzb2xhcicpID0+IHtcbiAgY29uc3QgZXh0ZW5zaW9uID0gZm9ybWF0RmlsZUV4dGVuc2lvbihwYXRoKSBhcyBzdHJpbmdcbiAgaWYgKFsnLnBkZicsICcuZG9jJywgJy5kb2N4J10uaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xuICAgIGlmKHByb3ZpZGVyID09PSAnc29sYXInKSB7XG4gICAgICByZXR1cm4gJ3NvbGFyOmRvY3VtZW50LXRleHQtbGluZS1kdW90b25lJ1xuICAgIH1cblxuICB9IGVsc2UgaWYgKFsnLnhscycsICcueGxzeCddLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcbiAgICBpZihwcm92aWRlciA9PT0gJ3NvbGFyJykge1xuICAgICAgcmV0dXJuICdzb2xhcjpjbGlwYm9hcmQtbGlzdC1saW5lLWR1b3RvbmUnXG4gICAgfVxuICB9IGVsc2UgaWYgKFsnLnBuZycsICcuanBnJywgJy5qcGVnJywgJy5naWYnLCAnLndlYnAnLCAnLnN2ZyddLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcbiAgICBpZihwcm92aWRlciA9PT0gJ3NvbGFyJykge1xuICAgICAgcmV0dXJuICdzb2xhcjpnYWxsZXJ5LWJvbGQtZHVvdG9uZSdcbiAgICB9XG4gIH0gZWxzZSBpZihbJy56aXAnLCAnLnJhcicsICcuN3onLCAnLnRhcicsICcuZ3onXS5pbmNsdWRlcyhleHRlbnNpb24pKSB7XG4gICAgaWYocHJvdmlkZXIgPT09ICdzb2xhcicpIHtcbiAgICAgIHJldHVybiAnc29sYXI6YXJjaGl2ZS1saW5lLWR1b3RvbmUnXG4gICAgfVxuICB9IGVsc2UgaWYoWycubXAzJywgJy53YXYnLCAnLmZsYWMnLCAnLmFhYycsICcub2dnJ10uaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xuICAgIGlmKHByb3ZpZGVyID09PSAnc29sYXInKSB7XG4gICAgICByZXR1cm4gJ3NvbGFyOm1pY3JvcGhvbmUtMi1saW5lLWR1b3RvbmUnXG4gICAgfVxuICB9IGVsc2UgaWYoWycubXA0JywgJy53ZWJtJywgJy5tb3YnLCAnLmF2aScsICcubXBlZycsICcubXBnJ10uaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xuICAgIGlmKHByb3ZpZGVyID09PSAnc29sYXInKSB7XG4gICAgICByZXR1cm4gJ3NvbGFyOmNoYXQtcm91bmQtdmlkZW8tbGluZS1kdW90b25lJ1xuICAgIH1cbiAgfVxuICByZXR1cm4gJ3NvbGFyOmZpbGUtbGluZS1kdW90b25lJ1xufSIsIlxuZXhwb3J0IGNvbnN0IGdldFdoYXRzYXBwSmlkQW5kTnVtYmVyVmFsaWRhdGVkID0gKHBob25lOiBzdHJpbmcgKTogeyBqaWQ6IHN0cmluZywgbnVtYmVyOiBzdHJpbmcgfSA9PiB7XG4gIGxldCBqaWQgPSBmb3JtYXRQaG9uZU51bWJlclRvV2hhdHNhcHBSZW1vdGVKaWQocGhvbmUpXG4gIGlmKHR5cGVvZiBqaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgamlkID0gamlkLnJlcGxhY2UoLzpcXGQrKD89QCkvLCAnJylcbiAgfVxuICB2YWxpZGF0ZVJlbW90ZUppZChqaWQsIHBob25lKVxuICBjb25zdCBudW1iZXIgPSBqaWQucmVwbGFjZSgvXFxEL2csICcnKVxuICByZXR1cm4ge1xuICAgIGppZCxcbiAgICBudW1iZXJcbiAgfVxufVxuXG5jb25zdCBmb3JtYXRQaG9uZU51bWJlclRvV2hhdHNhcHBSZW1vdGVKaWQgPSAobnVtYmVyOiBzdHJpbmcpID0+IHtcbiAgbnVtYmVyID0gU3RyaW5nKG51bWJlcilcbiAgaWYgKG51bWJlci5pbmNsdWRlcygnQGcudXMnKSB8fCBudW1iZXIuaW5jbHVkZXMoJ0BzLndoYXRzYXBwLm5ldCcpIHx8IG51bWJlci5pbmNsdWRlcygnQGxpZCcpKSB7XG4gICAgcmV0dXJuIG51bWJlclxuICB9XG5cbiAgaWYgKG51bWJlci5pbmNsdWRlcygnQGJyb2FkY2FzdCcpKSB7XG4gICAgcmV0dXJuIG51bWJlclxuICB9XG5cbiAgbnVtYmVyID0gbnVtYmVyXG4gICAgPy5yZXBsYWNlKC9cXHMvZywgJycpXG4gICAgLnJlcGxhY2UoL1xcKy9nLCAnJylcbiAgICAucmVwbGFjZSgvXFwoL2csICcnKVxuICAgIC5yZXBsYWNlKC9cXCkvZywgJycpXG4gICAgLnNwbGl0KCc6JylbMF1cbiAgICAuc3BsaXQoJ0AnKVswXVxuXG4gIGlmIChudW1iZXIuaW5jbHVkZXMoJy0nKSAmJiBudW1iZXIubGVuZ3RoID49IDI0KSB7XG4gICAgbnVtYmVyID0gbnVtYmVyLnJlcGxhY2UoL1teXFxkLV0vZywgJycpXG4gICAgcmV0dXJuIGAke251bWJlcn1AZy51c2BcbiAgfVxuXG4gIG51bWJlciA9IG51bWJlci5yZXBsYWNlKC9cXEQvZywgJycpXG5cbiAgaWYgKG51bWJlci5sZW5ndGggPj0gMTgpIHtcbiAgICBudW1iZXIgPSBudW1iZXIucmVwbGFjZSgvW15cXGQtXS9nLCAnJylcbiAgICByZXR1cm4gYCR7bnVtYmVyfUBnLnVzYFxuICB9XG5cbiAgbnVtYmVyID0gZm9ybWF0TVhPckFSTnVtYmVyKG51bWJlcilcblxuICBudW1iZXIgPSBmb3JtYXRCUk51bWJlcihudW1iZXIpXG5cbiAgcmV0dXJuIGAke251bWJlcn1Acy53aGF0c2FwcC5uZXRgXG59XG5cbmNvbnN0IGZvcm1hdE1YT3JBUk51bWJlciA9IChqaWQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IGNvdW50cnlDb2RlID0gamlkLnN1YnN0cmluZygwLCAyKVxuXG4gIGlmIChOdW1iZXIoY291bnRyeUNvZGUpID09PSA1MiB8fCBOdW1iZXIoY291bnRyeUNvZGUpID09PSA1NCkge1xuICAgIGlmIChqaWQubGVuZ3RoID09PSAxMykge1xuICAgICAgY29uc3QgbnVtYmVyID0gY291bnRyeUNvZGUgKyBqaWQuc3Vic3RyaW5nKDMpXG4gICAgICByZXR1cm4gbnVtYmVyXG4gICAgfVxuXG4gICAgcmV0dXJuIGppZFxuICB9XG4gIHJldHVybiBqaWRcbn1cblxuLy8gQ2hlY2sgaWYgdGhlIG51bWJlciBpcyBiclxuY29uc3QgZm9ybWF0QlJOdW1iZXIgPSAoamlkOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBjb25zdCByZWdleHAgPSBuZXcgUmVnRXhwKC9eKFxcZHsyfSkoXFxkezJ9KVxcZHsxfShcXGR7OH0pJC8pXG4gIGlmIChyZWdleHAudGVzdChqaWQpKSB7XG4gICAgY29uc3QgbWF0Y2ggPSByZWdleHAuZXhlYyhqaWQpXG4gICAgaWYgKG1hdGNoICYmIG1hdGNoWzFdID09PSAnNTUnKSB7XG4gICAgICBjb25zdCBqb2tlciA9IE51bWJlci5wYXJzZUludChtYXRjaFszXVswXSlcbiAgICAgIGNvbnN0IGRkZCA9IE51bWJlci5wYXJzZUludChtYXRjaFsyXSlcbiAgICAgIGlmIChqb2tlciA8IDcgfHwgZGRkIDwgMzEpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoWzBdXG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2hbMV0gKyBtYXRjaFsyXSArIG1hdGNoWzNdXG4gICAgfVxuICAgIHJldHVybiBqaWRcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gamlkXG4gIH1cbn1cblxuY29uc3QgdmFsaWRhdGVSZW1vdGVKaWQgPSAocmVtb3RlX2ppZDogc3RyaW5nLCBwaG9uZT86IHN0cmluZyB8IG51bWJlcikgPT4ge1xuICBjb25zdCBpbnZhbGlkcyA9IFtudWxsLCAnJywgJ0BzLndoYXRzYXBwLm5ldCddXG4gIGNvbnN0IGlzSW52YWxpZFJlbW90ZUppZCA9IGludmFsaWRzLnNvbWUoaW52YWxpZCA9PiByZW1vdGVfamlkID09PSBpbnZhbGlkKVxuICBpZihpc0ludmFsaWRSZW1vdGVKaWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcmVtb3RlX2ppZCAkeyByZW1vdGVfamlkIH0gfCBwaG9uZTogJHsgcGhvbmUgPz8gJycgfWApXG4gIH1cbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBTyxNQUFNLDZCQUE2QixHQUFHLENBQUMsR0FBYSxHQUFBLEVBQUUsS0FB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QUFFLElBQUksRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtJQUNuRSxJQUFBLE1BQU0sRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO0lBQ2pFLElBQUEsT0FBTyxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7SUFDbkUsSUFBQSxPQUFPLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTs7SUFFcEUsSUFBQSxLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRTtJQUNuRSxJQUFBLFVBQVUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFO0lBQ3hFLElBQUEsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUU7SUFDbkUsSUFBQSxLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRTtJQUNsRSxJQUFBLFNBQVMsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO0lBQ25FLElBQUEsUUFBUSxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7SUFDcEUsSUFBQSxRQUFRLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtJQUNwRSxJQUFBLE9BQU8sRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO0lBQ3BFLElBQUEsV0FBVyxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUU7SUFDekUsSUFBQSxTQUFTLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRTs7SUFFdkUsSUFBQSxRQUFRLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRTtJQUN0RSxJQUFBLFNBQVMsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFO0lBQ3RFLElBQUEsSUFBSSxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7SUFDaEUsSUFBQSxPQUFPLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtJQUNwRSxJQUFBLE9BQU8sRUFBRSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO0lBQ25FLElBQUEsUUFBUSxFQUFFLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7SUFDcEUsSUFBQSxPQUFPLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTs7SUFFakUsSUFBQSxXQUFXLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtJQUN2RSxJQUFBLE9BQU8sRUFBRSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFO0lBQ3RFLElBQUEsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUU7SUFDbkUsSUFBQSxPQUFPLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtJQUNuRSxJQUFBLE9BQU8sRUFBRSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFOztJQUVyRSxJQUFBLFNBQVMsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO0lBQ3JFLElBQUEsVUFBVSxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7O0lBRXRFLElBQUEsTUFBTSxFQUFFLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7SUFDbkUsSUFBQSxHQUFHLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtJQUNoRSxJQUFBLGtCQUFrQixFQUFFLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7SUFDL0UsSUFBQSxXQUFXLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtJQUN4RSxJQUFBLE1BQU0sRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFO0tBQ3RFLENBQUM7SUFFRjtJQUNBLE1BQU0sZ0JBQWdCLEdBQTJCO0lBQy9DLElBQUEsR0FBRyxFQUFFLElBQUk7SUFDVCxJQUFBLEdBQUcsRUFBRSxRQUFRO0lBQ2IsSUFBQSxJQUFJLEVBQUUsT0FBTztJQUNiLElBQUEsSUFBSSxFQUFFLGFBQWE7SUFDbkIsSUFBQSxJQUFJLEVBQUUsYUFBYTtJQUNuQixJQUFBLElBQUksRUFBRSxTQUFTO0lBQ2YsSUFBQSxJQUFJLEVBQUUsUUFBUTtJQUNkLElBQUEsSUFBSSxFQUFFLE9BQU87SUFDYixJQUFBLElBQUksRUFBRSxPQUFPO0lBQ2IsSUFBQSxJQUFJLEVBQUUsYUFBYTtJQUNuQixJQUFBLElBQUksRUFBRSxTQUFTO0lBQ2YsSUFBQSxJQUFJLEVBQUUsSUFBSTtJQUNWLElBQUEsSUFBSSxFQUFFLFNBQVM7SUFDZixJQUFBLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBQSxJQUFJLEVBQUUsUUFBUTtJQUNkLElBQUEsSUFBSSxFQUFFLFFBQVE7SUFDZCxJQUFBLElBQUksRUFBRSxTQUFTO0lBQ2YsSUFBQSxJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUEsSUFBSSxFQUFFLFFBQVE7SUFDZCxJQUFBLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUEsSUFBSSxFQUFFLFFBQVE7SUFDZCxJQUFBLElBQUksRUFBRSxPQUFPO0lBQ2IsSUFBQSxJQUFJLEVBQUUsVUFBVTtJQUNoQixJQUFBLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUEsSUFBSSxFQUFFLFVBQVU7SUFDaEIsSUFBQSxJQUFJLEVBQUUsV0FBVztJQUNqQixJQUFBLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUEsSUFBSSxFQUFFLGFBQWE7SUFDbkIsSUFBQSxJQUFJLEVBQUUsWUFBWTtJQUNsQixJQUFBLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUEsSUFBSSxFQUFFLFVBQVU7SUFDaEIsSUFBQSxJQUFJLEVBQUUsT0FBTztJQUNiLElBQUEsSUFBSSxFQUFFLFlBQVk7SUFDbEIsSUFBQSxJQUFJLEVBQUUsU0FBUztJQUNmLElBQUEsSUFBSSxFQUFFLE9BQU87SUFDYixJQUFBLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBQSxJQUFJLEVBQUUsT0FBTztJQUNiLElBQUEsS0FBSyxFQUFFLFNBQVM7SUFDaEIsSUFBQSxLQUFLLEVBQUUsU0FBUztJQUNoQixJQUFBLEtBQUssRUFBRSxTQUFTO0lBQ2hCLElBQUEsS0FBSyxFQUFFLFVBQVU7SUFDakIsSUFBQSxLQUFLLEVBQUUsU0FBUztJQUNoQixJQUFBLEtBQUssRUFBRSxTQUFTO0lBQ2hCLElBQUEsS0FBSyxFQUFFLFNBQVM7SUFDaEIsSUFBQSxLQUFLLEVBQUUsVUFBVTtJQUNqQixJQUFBLEtBQUssRUFBRSxTQUFTO0lBQ2hCLElBQUEsS0FBSyxFQUFFLGFBQWE7SUFDcEIsSUFBQSxLQUFLLEVBQUUsS0FBSztJQUNaLElBQUEsS0FBSyxFQUFFLFFBQVE7S0FDaEIsQ0FBQztJQUVGOzs7O0lBSUc7SUFDSCxNQUFNLDZCQUE2QixHQUFHLENBQUMsV0FBbUIsS0FBbUI7SUFDM0UsSUFBQSxJQUFJLENBQUMsV0FBVztJQUFFLFFBQUEsT0FBTyxJQUFJLENBQUM7O1FBRzlCLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDOztJQUduRCxJQUFBLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxFQUFFO0lBQUUsUUFBQSxPQUFPLElBQUksQ0FBQzs7UUFHekMsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUU3RixJQUFBLEtBQUssTUFBTSxXQUFXLElBQUksa0JBQWtCLEVBQUU7SUFDNUMsUUFBQSxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUU7OztnQkFHdkMsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUQsWUFBQSxNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNsRCxZQUFBLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUUxQyxZQUFBLElBQUksTUFBTSxFQUFFO29CQUNWLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2xHLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEVBQUU7OztJQUduRCxvQkFBQSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzs7SUFHNUIsd0JBQUEsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztJQUN2Qyx3QkFBQSxJQUFJLFdBQVcsS0FBSyxHQUFHLElBQUksV0FBVyxLQUFLLEVBQUUsSUFBSSxlQUFlLENBQUMsTUFBTSxLQUFLLEVBQUUsRUFBRTs7Z0NBRTlFLE1BQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pELDRCQUFBLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0lBQzlDLGdDQUFBLE9BQU8sV0FBVyxDQUFDO0lBQ3BCLDZCQUFBO0lBQ0YseUJBQUE7SUFBTSw2QkFBQSxJQUFJLFdBQVcsS0FBSyxHQUFHLElBQUksV0FBVyxLQUFLLEVBQUUsSUFBSSxlQUFlLENBQUMsTUFBTSxLQUFLLEVBQUUsRUFBRTtJQUNyRiw0QkFBQSxPQUFPLFdBQVcsQ0FBQztJQUNwQix5QkFBQTtJQUNGLHFCQUFBO0lBQU0seUJBQUE7O0lBRUwsd0JBQUEsT0FBTyxXQUFXLENBQUM7SUFDcEIscUJBQUE7SUFDRixpQkFBQTtJQUNGLGFBQUE7SUFDRixTQUFBO0lBQ0YsS0FBQTtJQUVELElBQUEsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDLENBQUM7SUFFRjs7Ozs7O0lBTUc7QUFDSSxVQUFNLDBCQUEwQixHQUFHLENBQUMsV0FBbUIsRUFBRSxPQUFnQixFQUFFLHVCQUFBLEdBQW1DLEtBQUssS0FBWTtRQUNwSSxJQUFJLENBQUMsV0FBVyxFQUFFO0lBQ2hCLFFBQUEsSUFBSSx1QkFBdUIsRUFBRTtJQUMzQixZQUFBLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUM3QyxTQUFBO1lBQ0QsT0FBTyxNQUFNLENBQUMsV0FBVyxFQUFFLDJCQUEyQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9ELEtBQUE7O1FBR0QsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDO1FBQzNCLElBQUksQ0FBQyxZQUFZLEVBQUU7SUFDakIsUUFBQSxNQUFNLGdCQUFnQixHQUFHLDZCQUE2QixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3BFLFFBQUEsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDcEIsWUFBWSxHQUFHLGdCQUFnQixDQUFDO0lBQ2pDLFNBQUE7SUFBTSxhQUFBO0lBQ0wsWUFBQSxJQUFJLHVCQUF1QixFQUFFO0lBQzNCLGdCQUFBLE1BQU0sSUFBSSxLQUFLLENBQUMseUVBQXlFLENBQUMsQ0FBQztJQUM1RixhQUFBO2dCQUNELE9BQU8sTUFBTSxDQUFDLFdBQVcsRUFBRSwyQkFBMkIsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMvRCxTQUFBO0lBQ0YsS0FBQTtJQUVELElBQUEsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzlDLElBQUEsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxNQUFNLEVBQUU7SUFDWCxRQUFBLElBQUksdUJBQXVCLEVBQUU7SUFDM0IsWUFBQSxNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksWUFBWSxDQUFBLHlDQUFBLEVBQTRDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUUsQ0FBQyxDQUFDO0lBQzlILFNBQUE7WUFDRCxPQUFPLE1BQU0sQ0FBQyxXQUFXLEVBQUUsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0QsS0FBQTs7UUFHRCxJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQzs7SUFHakQsSUFBQSxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNoRSxJQUFBLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQzdDLFdBQVcsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNELEtBQUE7O1FBR0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtJQUNwQyxRQUFBLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBYSxLQUFLLFdBQVcsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLENBQUM7SUFFaEcsUUFBQSxJQUFJLFVBQVUsS0FBSyxDQUFDLENBQUMsRUFBRTtJQUNyQixZQUFBLElBQUksdUJBQXVCLEVBQUU7b0JBQzNCLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQSxpQkFBQSxFQUFvQixZQUFZLENBQWdCLGFBQUEsRUFBQSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBb0IsaUJBQUEsRUFBQSxXQUFXLENBQUMsTUFBTSxDQUFBLENBQUUsQ0FBQyxDQUFDO0lBQ3pJLGFBQUE7Z0JBQ0QsT0FBTyxNQUFNLENBQUMsV0FBVyxFQUFFLDJCQUEyQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9ELFNBQUE7WUFFRCxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDeEYsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0QsUUFBQSxPQUFPLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBSSxDQUFBLEVBQUEsWUFBWSxFQUFFLENBQUM7SUFDaEQsS0FBQTtJQUFNLFNBQUE7O0lBRUwsUUFBQSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLFVBQVUsRUFBRTtJQUM1QyxZQUFBLElBQUksdUJBQXVCLEVBQUU7SUFDM0IsZ0JBQUEsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFBLGlCQUFBLEVBQW9CLFlBQVksQ0FBZ0IsYUFBQSxFQUFBLE1BQU0sQ0FBQyxVQUFVLG9CQUFvQixXQUFXLENBQUMsTUFBTSxDQUFBLENBQUUsQ0FBQyxDQUFDO0lBQzVILGFBQUE7Z0JBQ0QsT0FBTyxNQUFNLENBQUMsV0FBVyxFQUFFLDJCQUEyQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9ELFNBQUE7WUFFRCxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDL0UsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0QsUUFBQSxPQUFPLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBSSxDQUFBLEVBQUEsWUFBWSxFQUFFLENBQUM7SUFDaEQsS0FBQTtJQUNILEVBQUU7SUFFRjs7OztJQUlHO0FBQ1UsVUFBQSxjQUFjLEdBQUcsQ0FBQyxPQUFlLEtBQVk7SUFDeEQsSUFBQSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDekMsSUFBQSxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFekMsSUFBSSxDQUFDLE1BQU0sRUFBRTtJQUNYLFFBQUEsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLE9BQU8sQ0FBQSx5Q0FBQSxFQUE0QyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFFLENBQUMsQ0FBQztJQUN6SCxLQUFBO1FBRUQsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQzVCLEVBQUU7SUFFRjs7O0lBR0c7QUFDSSxVQUFNLHFCQUFxQixHQUFHLE1BQWU7SUFDbEQsSUFBQSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDcEMsRUFBRTtJQUVGOzs7OztJQUtHO1VBQ1Usa0JBQWtCLEdBQUcsQ0FBQyxXQUFtQixFQUFFLE9BQWdCLEtBQWE7UUFDbkYsSUFBSTtJQUNGLFFBQUEsMEJBQTBCLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RCxRQUFBLE9BQU8sSUFBSSxDQUFDO0lBQ2IsS0FBQTtRQUFDLE9BQU0sRUFBQSxFQUFBO0lBQ04sUUFBQSxPQUFPLEtBQUssQ0FBQztJQUNkLEtBQUE7SUFDSCxFQUFFO0lBRUY7Ozs7SUFJRztBQUNVLFVBQUEsdUJBQXVCLEdBQUcsQ0FBQyxXQUFtQixLQUFtQjtJQUM1RSxJQUFBLE9BQU8sNkJBQTZCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcEQsRUFBRTtJQUVGOzs7O0lBSUc7QUFDVSxVQUFBLG1CQUFtQixHQUFHLENBQUMsT0FBZSxLQUFjO0lBQy9ELElBQUEsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pDLElBQUEsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxNQUFNLEVBQUU7SUFDWCxRQUFBLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxPQUFPLENBQUEseUNBQUEsRUFBNEMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBRSxDQUFDLENBQUM7SUFDekgsS0FBQTtRQUVELE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNwRixFQUFFO0lBRUY7Ozs7SUFJRztBQUNVLFVBQUEsMEJBQTBCLEdBQUcsQ0FBQyxXQUFtQixLQUFzRztJQUNsSyxJQUFBLElBQUksQ0FBQyxXQUFXO0lBQUUsUUFBQSxPQUFPLElBQUksQ0FBQzs7UUFHOUIsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNoRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztRQUcxQyxJQUFJLFVBQVUsSUFBSSxVQUFVLEVBQUU7O1lBRTVCLE1BQU0sYUFBYSxHQUFHLG1DQUFtQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsYUFBYSxFQUFFO0lBQ2xCLFlBQUEsT0FBTyxJQUFJLENBQUM7SUFDYixTQUFBO0lBQ0YsS0FBQTs7UUFHRCxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQzs7SUFHdkQsSUFBQSxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDL0IsTUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztZQUcvQyxNQUFNLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRTdGLFFBQUEsS0FBSyxNQUFNLFdBQVcsSUFBSSxrQkFBa0IsRUFBRTtJQUM1QyxZQUFBLElBQUksaUJBQWlCLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUM3QyxNQUFNLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BFLGdCQUFBLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2xELGdCQUFBLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUUxQyxnQkFBQSxJQUFJLE1BQU0sRUFBRTt3QkFDVixNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzt3QkFHbEcsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsRUFBRTs7SUFFbkQsd0JBQUEsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQ0FDNUIsSUFBSSxXQUFXLEtBQUssR0FBRyxJQUFJLGVBQWUsQ0FBQyxNQUFNLEtBQUssRUFBRSxFQUFFO29DQUN4RCxNQUFNLFFBQVEsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRCxnQ0FBQSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTt3Q0FDOUMsT0FBTzs0Q0FDTCxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVc7SUFDL0Isd0NBQUEsV0FBVyxFQUFFLGVBQWU7SUFDNUIsd0NBQUEsT0FBTyxFQUFFLFdBQVc7NENBQ3BCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTt5Q0FDbEIsQ0FBQztJQUNILGlDQUFBO0lBQ0YsNkJBQUE7cUNBQU0sSUFBSSxXQUFXLEtBQUssR0FBRyxJQUFJLGVBQWUsQ0FBQyxNQUFNLEtBQUssRUFBRSxFQUFFO29DQUMvRCxPQUFPO3dDQUNMLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVztJQUMvQixvQ0FBQSxXQUFXLEVBQUUsZUFBZTtJQUM1QixvQ0FBQSxPQUFPLEVBQUUsV0FBVzt3Q0FDcEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO3FDQUNsQixDQUFDO0lBQ0gsNkJBQUE7SUFDRix5QkFBQTtJQUFNLDZCQUFBO2dDQUNMLE9BQU87b0NBQ0wsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXO0lBQy9CLGdDQUFBLFdBQVcsRUFBRSxlQUFlO0lBQzVCLGdDQUFBLE9BQU8sRUFBRSxXQUFXO29DQUNwQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7aUNBQ2xCLENBQUM7SUFDSCx5QkFBQTtJQUNGLHFCQUFBO0lBQU0seUJBQUE7OzRCQUVMLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDOzRCQUNyRCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLEVBQUU7Z0NBQzNFLE9BQU87b0NBQ0wsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXO0lBQy9CLGdDQUFBLE9BQU8sRUFBRSxXQUFXO29DQUNwQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7aUNBQ2xCLENBQUM7SUFDSCx5QkFBQTtJQUNGLHFCQUFBO0lBQ0YsaUJBQUE7SUFDRixhQUFBO0lBQ0YsU0FBQTtJQUNGLEtBQUE7SUFBTSxTQUFBOztJQUVMLFFBQUEsTUFBTSxnQkFBZ0IsR0FBRyw2QkFBNkIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUVwRSxRQUFBLElBQUksZ0JBQWdCLEVBQUU7SUFDcEIsWUFBQSxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUMvQyxZQUFBLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRWhFLFlBQUEsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7b0JBQzdDLE1BQU0sdUJBQXVCLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDNUUsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFFbEcsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzRCxPQUFPOzRCQUNMLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVztJQUMvQix3QkFBQSxXQUFXLEVBQUUsdUJBQXVCO0lBQ3BDLHdCQUFBLE9BQU8sRUFBRSxnQkFBZ0I7NEJBQ3pCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTt5QkFDbEIsQ0FBQztJQUNILGlCQUFBO0lBQU0scUJBQUE7O3dCQUVMLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDO3dCQUNyRCxJQUFJLHVCQUF1QixDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksdUJBQXVCLENBQUMsTUFBTSxHQUFHLGdCQUFnQixFQUFFOzRCQUMzRixPQUFPO2dDQUNMLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVztJQUMvQiw0QkFBQSxPQUFPLEVBQUUsZ0JBQWdCO2dDQUN6QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7NkJBQ2xCLENBQUM7SUFDSCxxQkFBQTtJQUNGLGlCQUFBO0lBQ0YsYUFBQTtJQUFNLGlCQUFBOztvQkFFTCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNsRyxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMvQyxPQUFPOzRCQUNMLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVztJQUMvQix3QkFBQSxXQUFXLEVBQUUsV0FBVztJQUN4Qix3QkFBQSxPQUFPLEVBQUUsZ0JBQWdCOzRCQUN6QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7eUJBQ2xCLENBQUM7SUFDSCxpQkFBQTtJQUNGLGFBQUE7SUFDRixTQUFBOztZQUdELE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFN0YsUUFBQSxLQUFLLE1BQU0sV0FBVyxJQUFJLGtCQUFrQixFQUFFO0lBQzVDLFlBQUEsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUN2QyxNQUFNLGVBQWUsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5RCxnQkFBQSxNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNsRCxnQkFBQSxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFMUMsZ0JBQUEsSUFBSSxNQUFNLEVBQUU7d0JBQ1YsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDbEcsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUM7O3dCQUdyRCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLEVBQUU7NEJBQzNFLE9BQU87Z0NBQ0wsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXO0lBQy9CLDRCQUFBLE9BQU8sRUFBRSxXQUFXO2dDQUNwQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7NkJBQ2xCLENBQUM7SUFDSCxxQkFBQTtJQUNGLGlCQUFBO0lBQ0YsYUFBQTtJQUNGLFNBQUE7SUFDRixLQUFBO0lBRUQsSUFBQSxPQUFPLElBQUksQ0FBQztJQUNkLEVBQUU7VUFFVyxJQUFJLEdBQUcsQ0FBQyxLQUFVLEVBQUUsSUFBUyxLQUFJO1FBQzVDLE9BQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDbEMsRUFBQztVQUVZLE1BQU0sR0FBRyxDQUFDLEtBQVUsRUFBRSxJQUFTLEtBQUk7UUFDOUMsT0FBTyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNuQyxFQUFDO0FBRVksVUFBQSxNQUFNLEdBQUc7UUFDcEIsSUFBSTtRQUNKLE1BQU07UUFDTixpQkFBaUI7UUFDakIsa0JBQWtCO1FBQ2xCLDJCQUEyQjtRQUMzQiwwQkFBMEI7UUFDMUIsY0FBYztRQUNkLHFCQUFxQjtRQUNyQixrQkFBa0I7UUFDbEIsbUJBQW1CO1FBQ25CLHVCQUF1QjtRQUN2QiwwQkFBMEI7OztBQ3hmZixVQUFBLGlCQUFpQixHQUFHLENBQUMsS0FBWSxFQUFFLEdBQUEsR0FBcUIsSUFBSSxLQUFJO0lBQzNFLElBQUEsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFBLENBQUEsRUFBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUssQ0FBRyxDQUFBLENBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM1RSxPQUFPLENBQUEsQ0FBQSxFQUFLLEtBQU0sQ0FBQSxDQUFBLENBQUcsQ0FBQTtJQUN2QixFQUFDO0FBR1ksVUFBQSxjQUFjLEdBQUc7UUFDNUIsaUJBQWlCOzs7QUNOTixVQUFBLGNBQWMsR0FBRyxDQUFDLEtBQXNCLEtBQUk7UUFDckQsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLEVBQUU7SUFBRSxRQUFBLE9BQU8sU0FBUyxDQUFBO0lBRTNFLElBQUEsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUVyQixJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDO0lBQUUsUUFBQSxPQUFPLFNBQVMsQ0FBQTtRQUU5RCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUE7SUFDZCxJQUFBLE1BQU0sS0FBSyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUNyRCxJQUFBLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFNUYsT0FBTyxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN6RSxFQUFDO0FBRVUsVUFBQSxtQkFBbUIsR0FBRyxDQUFDLElBQVksS0FBSTtRQUNsRCxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQ3BDLEVBQUM7QUFFWSxVQUFBLGNBQWMsR0FBRyxDQUFDLElBQVksS0FBSTtRQUM3QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7SUFDOUIsRUFBQztBQUVZLFVBQUEsZUFBZSxHQUFHLENBQUMsSUFBWSxLQUFJO0lBQzlDLElBQUEsTUFBTSxTQUFTLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFXLENBQUE7UUFDckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtJQUNoQyxRQUFBLE9BQU8sU0FBUyxDQUFBO0lBQ2pCLEtBQUE7YUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtJQUNoRCxRQUFBLE9BQU8sU0FBUyxDQUFBO0lBQ2pCLEtBQUE7YUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtJQUNoRCxRQUFBLE9BQU8sU0FBUyxDQUFBO0lBQ2pCLEtBQUE7YUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7SUFDM0csUUFBQSxPQUFPLFNBQVMsQ0FBQTtJQUNqQixLQUFBO0lBQ0QsSUFBQSxPQUFPLFNBQVMsQ0FBQTtJQUNsQixFQUFDO0FBRVksVUFBQSxXQUFXLEdBQUcsQ0FBQyxJQUFZLEVBQUUsUUFBQSxHQUFtQixPQUFPLEtBQUk7SUFDdEUsSUFBQSxNQUFNLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQVcsQ0FBQTtJQUNyRCxJQUFBLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNqRCxJQUFHLFFBQVEsS0FBSyxPQUFPLEVBQUU7SUFDdkIsWUFBQSxPQUFPLGtDQUFrQyxDQUFBO0lBQzFDLFNBQUE7SUFFRixLQUFBO2FBQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDaEQsSUFBRyxRQUFRLEtBQUssT0FBTyxFQUFFO0lBQ3ZCLFlBQUEsT0FBTyxtQ0FBbUMsQ0FBQTtJQUMzQyxTQUFBO0lBQ0YsS0FBQTtJQUFNLFNBQUEsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2pGLElBQUcsUUFBUSxLQUFLLE9BQU8sRUFBRTtJQUN2QixZQUFBLE9BQU8sNEJBQTRCLENBQUE7SUFDcEMsU0FBQTtJQUNGLEtBQUE7SUFBTSxTQUFBLElBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3BFLElBQUcsUUFBUSxLQUFLLE9BQU8sRUFBRTtJQUN2QixZQUFBLE9BQU8sNEJBQTRCLENBQUE7SUFDcEMsU0FBQTtJQUNGLEtBQUE7SUFBTSxTQUFBLElBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3ZFLElBQUcsUUFBUSxLQUFLLE9BQU8sRUFBRTtJQUN2QixZQUFBLE9BQU8saUNBQWlDLENBQUE7SUFDekMsU0FBQTtJQUNGLEtBQUE7SUFBTSxTQUFBLElBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNoRixJQUFHLFFBQVEsS0FBSyxPQUFPLEVBQUU7SUFDdkIsWUFBQSxPQUFPLHFDQUFxQyxDQUFBO0lBQzdDLFNBQUE7SUFDRixLQUFBO0lBQ0QsSUFBQSxPQUFPLHlCQUF5QixDQUFBO0lBQ2xDOztBQ2pFYSxVQUFBLGdDQUFnQyxHQUFHLENBQUMsS0FBYSxLQUFzQztJQUNsRyxJQUFBLElBQUksR0FBRyxHQUFHLG9DQUFvQyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3JELElBQUEsSUFBRyxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDMUIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ25DLEtBQUE7SUFDRCxJQUFBLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUM3QixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUNyQyxPQUFPO1lBQ0wsR0FBRztZQUNILE1BQU07U0FDUCxDQUFBO0lBQ0gsRUFBQztJQUVELE1BQU0sb0NBQW9DLEdBQUcsQ0FBQyxNQUFjLEtBQUk7SUFDOUQsSUFBQSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3ZCLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtJQUM3RixRQUFBLE9BQU8sTUFBTSxDQUFBO0lBQ2QsS0FBQTtJQUVELElBQUEsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO0lBQ2pDLFFBQUEsT0FBTyxNQUFNLENBQUE7SUFDZCxLQUFBO0lBRUQsSUFBQSxNQUFNLEdBQUcsTUFBTSxLQUFBLElBQUEsSUFBTixNQUFNLEtBQU4sS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsTUFBTSxDQUNYLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUNsQixPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFDakIsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQ2pCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUNqQixLQUFLLENBQUMsR0FBRyxDQUFFLENBQUEsQ0FBQyxFQUNaLEtBQUssQ0FBQyxHQUFHLENBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQTtJQUVoQixJQUFBLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLEVBQUUsRUFBRTtZQUMvQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUE7WUFDdEMsT0FBTyxDQUFBLEVBQUcsTUFBTSxDQUFBLEtBQUEsQ0FBTyxDQUFBO0lBQ3hCLEtBQUE7UUFFRCxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFbEMsSUFBQSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBRSxFQUFFO1lBQ3ZCLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUN0QyxPQUFPLENBQUEsRUFBRyxNQUFNLENBQUEsS0FBQSxDQUFPLENBQUE7SUFDeEIsS0FBQTtJQUVELElBQUEsTUFBTSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBRW5DLElBQUEsTUFBTSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUUvQixPQUFPLENBQUEsRUFBRyxNQUFNLENBQUEsZUFBQSxDQUFpQixDQUFBO0lBQ25DLENBQUMsQ0FBQTtJQUVELE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxHQUFXLEtBQVk7UUFDakQsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFFdkMsSUFBQSxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtJQUM1RCxRQUFBLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxFQUFFLEVBQUU7Z0JBQ3JCLE1BQU0sTUFBTSxHQUFHLFdBQVcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzdDLFlBQUEsT0FBTyxNQUFNLENBQUE7SUFDZCxTQUFBO0lBRUQsUUFBQSxPQUFPLEdBQUcsQ0FBQTtJQUNYLEtBQUE7SUFDRCxJQUFBLE9BQU8sR0FBRyxDQUFBO0lBQ1osQ0FBQyxDQUFBO0lBRUQ7SUFDQSxNQUFNLGNBQWMsR0FBRyxDQUFDLEdBQVcsS0FBWTtJQUM3QyxJQUFBLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLDhCQUE4QixDQUFDLENBQUE7SUFDekQsSUFBQSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDcEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQzlCLFlBQUEsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDMUMsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNyQyxZQUFBLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRSxFQUFFO0lBQ3pCLGdCQUFBLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ2hCLGFBQUE7SUFDRCxZQUFBLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdEMsU0FBQTtJQUNELFFBQUEsT0FBTyxHQUFHLENBQUE7SUFDWCxLQUFBO0lBQU0sU0FBQTtJQUNMLFFBQUEsT0FBTyxHQUFHLENBQUE7SUFDWCxLQUFBO0lBQ0gsQ0FBQyxDQUFBO0lBRUQsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLFVBQWtCLEVBQUUsS0FBdUIsS0FBSTtRQUN4RSxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsaUJBQWlCLENBQUMsQ0FBQTtJQUM5QyxJQUFBLE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksVUFBVSxLQUFLLE9BQU8sQ0FBQyxDQUFBO0lBQzNFLElBQUEsSUFBRyxrQkFBa0IsRUFBRTtJQUNyQixRQUFBLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQSxtQkFBQSxFQUF1QixVQUFXLENBQWMsVUFBQSxFQUFBLEtBQUssS0FBTCxJQUFBLElBQUEsS0FBSyxjQUFMLEtBQUssR0FBSSxFQUFHLENBQUEsQ0FBRSxDQUFDLENBQUE7SUFDaEYsS0FBQTtJQUNILENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
