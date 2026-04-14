
  /**
   * @license
   * author: igortrindade.dev
   * lazyfy.js v2.58.2
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eWZ5LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvVXRpbC50cyIsIi4uLy4uLy4uL3NyYy9PYmplY3RIZWxwZXJzLnRzIiwiLi4vLi4vLi4vc3JjL0FycmF5SGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9NYXRoSGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9Db21tb25IZWxwZXJzLnRzIiwiLi4vLi4vLi4vc3JjL3R5cGVzL051bWJlckZvcm1hdE9wdGlvbnMudHMiLCIuLi8uLi8uLi9zcmMvTnVtYmVyRm9ybWF0LnRzIiwiLi4vLi4vLi4vc3JjL1NpdGVNYXBHZW5lcmF0b3IudHMiLCIuLi8uLi8uLi9zcmMvU3RyaW5nSGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9SZWdleEhlbHBlcnMudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9tYXNraXQudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9keW5hbWljLW1hc2sudHMiLCIuLi8uLi8uLi9zcmMvbWFzay90b2tlbnMudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9tYXNrZXIudHMiLCIuLi8uLi8uLi9zcmMvbWFzay9lbnVtcy50cyIsIi4uLy4uLy4uL3NyYy9NYXNrZXIudHMiLCIuLi8uLi8uLi9zcmMvR3JhcGhRTC9pbmRleC50cyIsIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2ZpbGUtaGVscGVycy50cyIsIi4uLy4uLy4uL3NyYy9mb3JtYXR0ZXJzL2dldFdoYXRzYXBwSmlkQW5kTnVtYmVyVmFsaWRhdGVkLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCByZW1hcEFycmF5VG9Mb3dlckNhc2VJZlN0cmluZyA9IChhcnI6IGFueVtdID0gW10pID0+IHtcbiAgcmV0dXJuIGFyci5tYXAoaXRlbSA9PiBsb3dlckNhc2VBbmRTdHJpbmdpZnlJZk51bWJlcihpdGVtKSlcbn1cblxuXG5leHBvcnQgY29uc3QgbG93ZXJDYXNlQW5kU3RyaW5naWZ5SWZOdW1iZXIgPSAoaXRlbTogYW55KSA9PiB7XG4gIGlmKHR5cGVvZihpdGVtKSA9PT0gJ3N0cmluZycpIHJldHVybiBpdGVtLnRvTG93ZXJDYXNlKClcbiAgaWYodHlwZW9mKGl0ZW0pID09PSAnbnVtYmVyJykgcmV0dXJuIGl0ZW0udG9TdHJpbmcoKVxuICByZXR1cm4gaXRlbVxufSIsImltcG9ydCB7IHJlbWFwQXJyYXlUb0xvd2VyQ2FzZUlmU3RyaW5nLCBsb3dlckNhc2VBbmRTdHJpbmdpZnlJZk51bWJlciB9IGZyb20gJy4vVXRpbCdcblxuZXhwb3J0IGNvbnN0IGZpbHRlck9iamVjdEtleXMgPSAoYWxsb3dlZDogYW55W10sIG9iamVjdDogYW55KTogYW55ID0+IHtcbiAgcmV0dXJuIGFsbG93ZWQucmVkdWNlKChhY2MsIGFsbG93ZWRBdHRyaWJ1dGUpID0+IHtcbiAgICBpZiAob2JqZWN0ICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGFsbG93ZWRBdHRyaWJ1dGUpKSB7IGFjY1thbGxvd2VkQXR0cmlidXRlXSA9IG9iamVjdFthbGxvd2VkQXR0cmlidXRlXSB9XG4gICAgcmV0dXJuIGFjY1xuICB9LCB7fSlcbn1cblxuZXhwb3J0IGNvbnN0IGNoZWNrT2JqTWF0Y2ggPSAoaXRlbTogYW55LCBxdWVyeTogYW55LCBpZ25vcmVFbXB0eUFycmF5OiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBjb25zdCBkaWZmS2V5cyA9IE9iamVjdC5rZXlzKHF1ZXJ5KS5maWx0ZXIoKGtleSkgPT4ge1xuICAgIGxldCBhdHRyUXVlcnkgPSBsb3dlckNhc2VBbmRTdHJpbmdpZnlJZk51bWJlcihpdGVtW2tleV0pXG4gICAgaWYoQXJyYXkuaXNBcnJheShxdWVyeVtrZXldKSkge1xuICAgICAgaWYoIXF1ZXJ5W2tleV0ubGVuZ3RoKSByZXR1cm4gaWdub3JlRW1wdHlBcnJheVxuICAgICAgcmV0dXJuICFyZW1hcEFycmF5VG9Mb3dlckNhc2VJZlN0cmluZyhxdWVyeVtrZXldKS5pbmNsdWRlcyhhdHRyUXVlcnkpXG4gICAgfVxuICAgIHJldHVybiAhY2hlY2tJc0VxdWFsKGF0dHJRdWVyeSwgcXVlcnlba2V5XSlcbiAgfSlcbiAgaWYoZGlmZktleXMubGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGl0ZW1cbn1cblxuZXhwb3J0IGNvbnN0IGNoZWNrSXNFcXVhbCA9ICh2YWx1ZTogYW55LCBxdWVyeTogYW55KTogYm9vbGVhbiA9PiB7XG4gIGlmKHR5cGVvZihxdWVyeSkgPT09ICdzdHJpbmcnICYmIHR5cGVvZih2YWx1ZSkgPT09ICdzdHJpbmcnKSByZXR1cm4gdmFsdWUudG9Mb3dlckNhc2UoKSA9PSBxdWVyeS50b0xvd2VyQ2FzZSgpXG4gIHJldHVybiB2YWx1ZSA9PSBxdWVyeVxufVxuXG5leHBvcnQgY29uc3QgaW5pdENsYXNzRGF0YSA9IChmaWxsYWJsZTogYW55W10sIGluc3RhbmNlOiBhbnksIG9iajogYW55ID0ge30pID0+IHsgIFxuICBmb3IoY29uc3QgYXR0ciBvZiBmaWxsYWJsZSkge1xuICAgIGlmKHR5cGVvZihvYmpbYXR0ci5rZXldKSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgaW5zdGFuY2VbYXR0ci5rZXldID0gb2JqW2F0dHIua2V5XVxuICAgIH0gZWxzZSB7XG4gICAgICBpbnN0YW5jZVthdHRyLmtleV0gPSBhdHRyLmRlZmF1bHRcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5zdGFuY2UsICdnZXRGaWxsYWJsZUtleXMnLCB7XG4gICAgICBnZXQoKSB7IHJldHVybiBmaWxsYWJsZS5tYXAoKGl0ZW0pID0+IGl0ZW0ua2V5KSB9LFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZGVmaW5lUHJvcGVydHkgPSAob2JqZWN0OiBhbnksIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KVxuICByZXR1cm4gb2JqZWN0XG59XG5cbmV4cG9ydCBjb25zdCBpc09iamVjdCA9IChpdGVtOiBhbnkpOiBib29sZWFuID0+IHtcbiAgcmV0dXJuIChpdGVtICYmIHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShpdGVtKSk7XG59XG5cbmV4cG9ydCBjb25zdCBkZWVwTWVyZ2VPYmplY3QgPSAodGFyZ2V0OiBhbnksIC4uLnNvdXJjZXM6IGFueSk6IGFueSA9PiB7XG4gIGlmICghc291cmNlcy5sZW5ndGgpIHJldHVybiB0YXJnZXQ7XG4gIGNvbnN0IHNvdXJjZSA9IHNvdXJjZXMuc2hpZnQoKTtcblxuICBpZiAoaXNPYmplY3QodGFyZ2V0KSAmJiBpc09iamVjdChzb3VyY2UpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XG4gICAgICBpZiAoaXNPYmplY3Qoc291cmNlW2tleV0pKSB7XG4gICAgICAgIGlmICghdGFyZ2V0W2tleV0pIE9iamVjdC5hc3NpZ24odGFyZ2V0LCB7XG4gICAgICAgICAgW2tleV06IHt9XG4gICAgICAgIH0pO1xuICAgICAgICBkZWVwTWVyZ2VPYmplY3QodGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGFyZ2V0LCB7XG4gICAgICAgICAgW2tleV06IHNvdXJjZVtrZXldXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkZWVwTWVyZ2VPYmplY3QodGFyZ2V0LCAuLi5zb3VyY2VzKTtcbn1cblxuZXhwb3J0IGNvbnN0IGdldE5lc3RlZE9iamVjdEJ5S2V5ID0gKG9iajogYW55ID0ge30sIGtleTogc3RyaW5nID0gJycpOiBhbnkgPT4ge1xuICByZXR1cm4ga2V5LnNwbGl0KCcuJykucmVkdWNlKChhY2MsIGspID0+IHtcbiAgICBpZiAoYWNjID09PSB1bmRlZmluZWQgfHwgYWNjID09PSBudWxsKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjb25zdCBhcnJheU1hdGNoID0gay5tYXRjaCgvXihbXlxcW10rKVxcWyhcXGQrKVxcXSQvKVxuICAgIGlmIChhcnJheU1hdGNoKSB7XG4gICAgICBjb25zdCBhcnJheUtleSA9IGFycmF5TWF0Y2hbMV1cbiAgICAgIGNvbnN0IGFycmF5SW5kZXggPSBwYXJzZUludChhcnJheU1hdGNoWzJdLCAxMClcblxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFjY1thcnJheUtleV0pIHx8IGFjY1thcnJheUtleV1bYXJyYXlJbmRleF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjW2FycmF5S2V5XVthcnJheUluZGV4XVxuICAgIH1cblxuICAgIHJldHVybiBhY2Nba11cbiAgfSwgb2JqKVxufVxuXG5leHBvcnQgY29uc3Qgc2V0TmVzdGVkT2JqZWN0QnlLZXkgPSAob2JqOiBhbnkgPSB7fSwga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnksIGFsbG93Tm9uRXhpc3RpbmdBcnJheUluZGV4OiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBvYmogPSBPYmplY3QuYXNzaWduKHt9LCBvYmopXG4gIGtleS5zcGxpdCgnLicpLnJlZHVjZSgoYWNjLCBrLCBpbmRleCwga2V5cykgPT4ge1xuICAgIGNvbnN0IGFycmF5TWF0Y2ggPSBrLm1hdGNoKC9eKFteXFxbXSspXFxbKFxcZCspXFxdJC8pXG5cbiAgICBpZiAoYXJyYXlNYXRjaCkge1xuICAgICAgY29uc3QgYXJyYXlLZXkgPSBhcnJheU1hdGNoWzFdXG4gICAgICBjb25zdCBhcnJheUluZGV4ID0gcGFyc2VJbnQoYXJyYXlNYXRjaFsyXSwgMTApXG5cbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShhY2NbYXJyYXlLZXldKSkge1xuICAgICAgICBpZiAoYWNjW2FycmF5S2V5XSAhPT0gdW5kZWZpbmVkICYmICh0eXBlb2YgYWNjW2FycmF5S2V5XSAhPT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQ2Fubm90IHNldCBwcm9wZXJ0eSAnJHthcnJheUtleX1bJHthcnJheUluZGV4fV0nIG9uIG5vbi1vYmplY3QgdHlwZSAoJHt0eXBlb2YgYWNjW2FycmF5S2V5XX0pIGF0IHBhdGggJyR7a2V5cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKX0nYClcbiAgICAgICAgfVxuICAgICAgICBhY2NbYXJyYXlLZXldID0gW11cbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgaWYgdGhlIGFycmF5IGhhcyB0aGUgc3BlY2lmaWVkIGluZGV4XG4gICAgICBpZiAoIWFsbG93Tm9uRXhpc3RpbmdBcnJheUluZGV4ICYmIGFycmF5SW5kZXggPj0gYWNjW2FycmF5S2V5XS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEFycmF5ICcke2FycmF5S2V5fScgZG9lcyBub3QgaGF2ZSBpbmRleCAke2FycmF5SW5kZXh9IGF0IHBhdGggJyR7a2V5cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKX0nYClcbiAgICAgIH1cblxuICAgICAgLy8gU2V0IHRoZSBjdXJyZW50IGFjY3VtdWxhdG9yIHRvIHRoZSBzcGVjaWZpZWQgaW5kZXggaW4gdGhlIGFycmF5XG4gICAgICBhY2MgPSBhY2NbYXJyYXlLZXldXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBrID0gYXJyYXlJbmRleFxuICAgIH1cblxuICAgIGlmIChpbmRleCA9PT0ga2V5cy5sZW5ndGggLSAxKSB7XG4gICAgICBhY2Nba10gPSB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaHJvdyBhbiBlcnJvciBpZiB0aGUgY3VycmVudCBsZXZlbCBpcyBub3QgYW4gb2JqZWN0XG4gICAgICBpZiAoYWNjW2tdICE9PSB1bmRlZmluZWQgJiYgKHR5cGVvZiBhY2Nba10gIT09ICdvYmplY3QnKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBDYW5ub3Qgc2V0IHByb3BlcnR5ICcke2t9JyBvbiBub24tb2JqZWN0IHR5cGUgKCR7dHlwZW9mIGFjY1trXX0pIGF0IHBhdGggJyR7a2V5cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKX0nYClcbiAgICAgIH1cbiAgICAgIGFjY1trXSA9IGFjY1trXSB8fCB7fVxuICAgIH1cblxuICAgIHJldHVybiBhY2Nba11cbiAgfSwgb2JqKVxuXG4gIHJldHVybiBvYmpcbn1cblxuZXhwb3J0IGNvbnN0IGRlbGV0ZU5lc3RlZE9iamVjdEJ5S2V5ID0gKG9iajogYW55LCBrZXk6IHN0cmluZywgaWdub3JlTm9uRXhpc3Rpbmc6IGJvb2xlYW4gPSB0cnVlKTogYW55ID0+IHtcbiAgY29uc3Qga2V5cyA9IGtleS5zcGxpdCgnLicpXG5cbiAga2V5cy5yZWR1Y2UoKGFjYzogYW55LCBrLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGFycmF5TWF0Y2ggPSBrLm1hdGNoKC9eKFteXFxbXSspXFxbKFxcZCspXFxdJC8pXG5cbiAgICBpZiAoYXJyYXlNYXRjaCkge1xuICAgICAgY29uc3QgYXJyYXlLZXkgPSBhcnJheU1hdGNoWzFdXG4gICAgICBjb25zdCBhcnJheUluZGV4ID0gcGFyc2VJbnQoYXJyYXlNYXRjaFsyXSwgMTApXG5cbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShhY2NbYXJyYXlLZXldKSAmJiAhaWdub3JlTm9uRXhpc3RpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQ2Fubm90IGRlbGV0ZSBwcm9wZXJ0eSAnJHthcnJheUtleX1bJHthcnJheUluZGV4fV0nIG9uIG5vbi1hcnJheSB0eXBlIGF0IHBhdGggJyR7a2V5cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKX0nYClcbiAgICAgIH1cblxuICAgICAgaWYgKGluZGV4ID09PSBrZXlzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgLy8gTGFzdCBlbGVtZW50IGluIHBhdGg6IGRlbGV0ZSBhcnJheSBpdGVtXG4gICAgICAgIGlmIChhcnJheUluZGV4ID49IGFjY1thcnJheUtleV0ubGVuZ3RoICYmICFpZ25vcmVOb25FeGlzdGluZykge1xuICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBBcnJheSAnJHthcnJheUtleX0nIGRvZXMgbm90IGhhdmUgaW5kZXggJHthcnJheUluZGV4fSBhdCBwYXRoICcke2tleXMuc2xpY2UoMCwgaW5kZXggKyAxKS5qb2luKCcuJyl9J2ApXG4gICAgICAgIH1cbiAgICAgICAgYWNjW2FycmF5S2V5XS5zcGxpY2UoYXJyYXlJbmRleCwgMSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFjYyA9IGFjY1thcnJheUtleV1bYXJyYXlJbmRleF1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGluZGV4ID09PSBrZXlzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgLy8gTGFzdCBlbGVtZW50IGluIHBhdGg6IGRlbGV0ZSBvYmplY3Qga2V5XG4gICAgICAgIGlmIChhY2MgJiYgYWNjLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgZGVsZXRlIGFjY1trXVxuICAgICAgICB9IGVsc2UgaWYoIWlnbm9yZU5vbkV4aXN0aW5nKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgZGVsZXRlIG5vbi1leGlzdGVudCBwcm9wZXJ0eSAnJHtrfScgYXQgcGF0aCAnJHtrZXlzLnNsaWNlKDAsIGluZGV4ICsgMSkuam9pbignLicpfSdgKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUcmF2ZXJzZSB0aGUgb2JqZWN0LCBlbnN1cmluZyB3ZSBkb24ndCB0cnkgdG8gYWNjZXNzIGEgbm9uLW9iamVjdFxuICAgICAgICBpZihpZ25vcmVOb25FeGlzdGluZykge1xuICAgICAgICAgIGlmICghYWNjW2tdIHx8IHR5cGVvZiBhY2Nba10gIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gYWNjXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghaWdub3JlTm9uRXhpc3RpbmcgJiYgKCFhY2Nba10gfHwgdHlwZW9mIGFjY1trXSAhPT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQ2Fubm90IGRlbGV0ZSBwcm9wZXJ0eSAnJHtrfScgb24gbm9uLW9iamVjdCB0eXBlIGF0IHBhdGggJyR7a2V5cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKX0nYClcbiAgICAgICAgfVxuICAgICAgICBhY2MgPSBhY2Nba11cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYWNjXG4gIH0sIG9iailcblxuICByZXR1cm4gb2JqXG59XG5cbnR5cGUgQW55T2JqZWN0ID0gUmVjb3JkPHN0cmluZywgYW55PlxuXG5leHBvcnQgY29uc3QgZGVlcFNlYXJjaEtleSA9IChcbiAgb2JqOiBBbnlPYmplY3QsXG4gIHRhcmdldEtleTogc3RyaW5nLFxuICByZXR1cm5BbGw6IGJvb2xlYW4gPSBmYWxzZVxuKTogYW55W10gfCBhbnkgPT4ge1xuICBjb25zdCByZXN1bHRzOiBhbnlbXSA9IFtdXG4gIGxldCBmaXJzdFJlc3VsdDogYW55ID0gbnVsbFxuXG4gIGNvbnN0IHNlYXJjaCA9IChjdXJyZW50T2JqOiBBbnlPYmplY3QpID0+IHtcbiAgICBpZiAoIXJldHVybkFsbCAmJiBmaXJzdFJlc3VsdCAhPT0gbnVsbCkgcmV0dXJuXG4gICAgaWYgKHR5cGVvZiBjdXJyZW50T2JqICE9PSAnb2JqZWN0JyB8fCBjdXJyZW50T2JqID09PSBudWxsKSByZXR1cm5cblxuICAgIGZvciAoY29uc3Qga2V5IGluIGN1cnJlbnRPYmopIHtcbiAgICAgIGlmIChrZXkgPT09IHRhcmdldEtleSkge1xuICAgICAgICBpZiAocmV0dXJuQWxsKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGN1cnJlbnRPYmpba2V5XSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmaXJzdFJlc3VsdCA9IGN1cnJlbnRPYmpba2V5XVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZWFyY2goY3VycmVudE9ialtrZXldKVxuICAgIH1cbiAgfVxuXG4gIHNlYXJjaChvYmopXG4gIHJldHVybiByZXR1cm5BbGwgPyByZXN1bHRzIDogZmlyc3RSZXN1bHRcbn1cblxuZXhwb3J0IGNvbnN0IGNoZWNrU2FtZVN0cnVjdHVyZSA9IChcbiAgYmFzZU9iajogQW55T2JqZWN0LFxuICBjb21wYXJlT2JqOiBBbnlPYmplY3Rcbik6IGJvb2xlYW4gPT4ge1xuICBpZiAodHlwZW9mIGJhc2VPYmogIT09ICdvYmplY3QnIHx8IGJhc2VPYmogPT09IG51bGwpIHtcbiAgICByZXR1cm4gdHlwZW9mIGJhc2VPYmogPT09IHR5cGVvZiBjb21wYXJlT2JqXG4gIH1cbiAgaWYgKHR5cGVvZiBjb21wYXJlT2JqICE9PSAnb2JqZWN0JyB8fCBjb21wYXJlT2JqID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgZm9yIChjb25zdCBrZXkgaW4gYmFzZU9iaikge1xuICAgIGlmICghKGtleSBpbiBjb21wYXJlT2JqKSkgcmV0dXJuIGZhbHNlXG4gICAgaWYgKCFjaGVja1NhbWVTdHJ1Y3R1cmUoYmFzZU9ialtrZXldLCBjb21wYXJlT2JqW2tleV0pKSByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gdHJ1ZVxufVxuXG5leHBvcnQgY29uc3QgZ2V0T2JqZWN0TWFwcGVkID0gKG9iamVjdDogYW55ID0ge30pID0+IHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG9iamVjdCkubWFwKChrZXkpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4ub2JqZWN0W2tleV0sXG4gICAgICBrZXk6IGtleSxcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBjb25zdCBPYmplY3RIZWxwZXJzID0ge1xuICBmaWx0ZXJPYmplY3RLZXlzLFxuICBjaGVja09iak1hdGNoLFxuICBjaGVja0lzRXF1YWwsXG4gIGluaXRDbGFzc0RhdGEsXG4gIGRlZmluZVByb3BlcnR5LFxuICBpc09iamVjdCxcbiAgZGVlcE1lcmdlT2JqZWN0LFxuICBnZXROZXN0ZWRPYmplY3RCeUtleSxcbiAgc2V0TmVzdGVkT2JqZWN0QnlLZXksXG4gIGRlbGV0ZU5lc3RlZE9iamVjdEJ5S2V5LFxuICBkZWVwU2VhcmNoS2V5LFxuICBnZXRPYmplY3RNYXBwZWRcbn0iLCJpbXBvcnQgeyBjaGVja09iak1hdGNoLCBjaGVja0lzRXF1YWwgfSBmcm9tICcuL09iamVjdEhlbHBlcnMnXG5pbXBvcnQgeyByZW1hcEFycmF5VG9Mb3dlckNhc2VJZlN0cmluZyB9IGZyb20gJy4vVXRpbCdcblxuZXhwb3J0IGNvbnN0IGZpbmRCeU9iaiA9IChhcnI6IGFueVtdLCBvYmo6IGFueSwgYXNCb29sZWFuOiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBmb3IoY29uc3QgaXRlbSBvZiBhcnIpIHtcbiAgICBpZighY2hlY2tPYmpNYXRjaChpdGVtLCBvYmopKSBjb250aW51ZVxuICAgIHJldHVybiBhc0Jvb2xlYW4gPyB0cnVlIDogaXRlbVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5leHBvcnQgY29uc3QgZmluZEJ5U3RyaW5nID0gKGFycjogYW55W10sIGl0ZW06IGFueSwgYXNCb29sZWFuOiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBmb3IoY29uc3QgYXJySXRlbSBvZiBhcnIpIHtcbiAgICBpZih0eXBlb2YoYXJySXRlbSkgPT09ICdzdHJpbmcnICYmIHR5cGVvZihpdGVtKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmKGFyckl0ZW0udG9Mb3dlckNhc2UoKSA9PSBpdGVtLnRvTG93ZXJDYXNlKCkpIHJldHVybiBhc0Jvb2xlYW4gPyB0cnVlIDogYXJySXRlbVxuICAgIH0gXG5cbiAgICBpZihhcnJJdGVtID09IGl0ZW0pIHtcbiAgICAgIHJldHVybiBhc0Jvb2xlYW4gPyB0cnVlIDogYXJySXRlbVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZXhwb3J0IGNvbnN0IGZpbmQgPSAoYXJyOiBhbnlbXSwgcXVlcnk6IGFueSwgYXNCb29sZWFuOiBib29sZWFuID0gZmFsc2UpOiBhbnkgPT4ge1xuICBpZihBcnJheS5pc0FycmF5KHF1ZXJ5KSApIHJldHVybiBmYWxzZVxuICBpZih0eXBlb2YocXVlcnkpID09PSAnb2JqZWN0JykgcmV0dXJuIGZpbmRCeU9iaihhcnIsIHF1ZXJ5LCBhc0Jvb2xlYW4pXG4gIHJldHVybiBmaW5kQnlTdHJpbmcoYXJyLCBxdWVyeSwgYXNCb29sZWFuKVxufVxuXG5leHBvcnQgY29uc3QgZmluZEluZGV4ID0gKGFycjogYW55W10sIHF1ZXJ5OiBhbnkpOiBudW1iZXIgPT4ge1xuICBpZih0eXBlb2YocXVlcnkpID09PSAnb2JqZWN0Jykge1xuICAgIGNvbnN0IGZpbmRlZEJ5T2JqID0gZmluZEJ5T2JqKGFyciwgcXVlcnkpXG4gICAgcmV0dXJuIGZpbmRlZEJ5T2JqICE9IGZhbHNlID8gYXJyLmluZGV4T2YoZmluZGVkQnlPYmopIDogLTEgXG4gIH1cbiAgY29uc3QgZmluZGVkQnlTdHJpbmcgPSBmaW5kQnlTdHJpbmcoYXJyLCBxdWVyeSlcbiAgcmV0dXJuIGZpbmRlZEJ5U3RyaW5nICE9PSBmYWxzZSA/IGFyci5pbmRleE9mKGZpbmRlZEJ5U3RyaW5nKSA6IC0xICBcbn1cblxuZXhwb3J0IGNvbnN0IGZpbmRBbGwgPSAoYXJyOiBhbnlbXSwgcXVlcnk6IGFueSwgaWdub3JlRW1wdHlBcnJheTogYm9vbGVhbiA9IGZhbHNlKTogYW55W10gPT4ge1xuICBpZiAoIXF1ZXJ5KSByZXR1cm4gYXJyXG4gIHJldHVybiBhcnIuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgY29uc3QgaXRlbVRvTWF0Y2ggPSB0eXBlb2YoaXRlbSkgPT09ICdzdHJpbmcnID8gaXRlbS50b0xvd2VyQ2FzZSgpIDogaXRlbVxuICAgIGlmKHR5cGVvZihxdWVyeSkgPT0gJ3N0cmluZycpIHJldHVybiBjaGVja0lzRXF1YWwoaXRlbSwgcXVlcnkpXG4gICAgaWYoQXJyYXkuaXNBcnJheShxdWVyeSkpIHJldHVybiByZW1hcEFycmF5VG9Mb3dlckNhc2VJZlN0cmluZyhxdWVyeSkuaW5jbHVkZXMoaXRlbVRvTWF0Y2gpID8gdHJ1ZSA6IGZhbHNlXG4gICAgcmV0dXJuIGNoZWNrT2JqTWF0Y2goaXRlbSwgcXVlcnksICFpZ25vcmVFbXB0eUFycmF5KSA/IHRydWUgOiBmYWxzZVxuICB9KVxufVxuXG5leHBvcnQgY29uc3QgcmVtb3ZlQWxsID0gKGFycjogYW55W10sIHF1ZXJ5OiBhbnksIGlnbm9yZUVtcHR5QXJyYXk6IGJvb2xlYW4gPSB0cnVlKTogYW55W10gPT4ge1xuICBpZiAoIXF1ZXJ5KSByZXR1cm4gYXJyXG4gIHJldHVybiBhcnIuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgY29uc3QgaXRlbVRvTWF0Y2ggPSB0eXBlb2YoaXRlbSkgPT09ICdzdHJpbmcnID8gaXRlbS50b0xvd2VyQ2FzZSgpIDogaXRlbVxuICAgIGlmKHR5cGVvZihxdWVyeSkgPT09ICdzdHJpbmcnKSByZXR1cm4gIWNoZWNrSXNFcXVhbChpdGVtLCBxdWVyeSlcbiAgICBpZihBcnJheS5pc0FycmF5KHF1ZXJ5KSkgcmV0dXJuIHJlbWFwQXJyYXlUb0xvd2VyQ2FzZUlmU3RyaW5nKHF1ZXJ5KS5pbmNsdWRlcyhpdGVtVG9NYXRjaCkgPyBmYWxzZSA6IHRydWVcbiAgICByZXR1cm4gY2hlY2tPYmpNYXRjaChpdGVtLCBxdWVyeSwgaWdub3JlRW1wdHlBcnJheSkgPyBmYWxzZSA6IHRydWVcbiAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHJlbW92ZSA9IChhcnI6IGFueVtdLCBxdWVyeTogYW55ID0gbnVsbCk6IGFueSA9PiB7XG4gIGlmICghcXVlcnkpIHJldHVybiBhcnJcbiAgY29uc3QgaW5kZXggPSBmaW5kSW5kZXgoYXJyLCBxdWVyeSlcbiAgaWYoaW5kZXggPiAtMSkgYXJyLnNwbGljZShpbmRleCwgMSlcbiAgcmV0dXJuIGFyclxufVxuXG5leHBvcnQgY29uc3QgdW5pcXVlQnlLZXkgPSAoYXJyOiBhbnlbXSwgcXVlcnk6IGFueSA9IG51bGwpOiBhbnlbXSA9PiB7XG4gIGNvbnN0IHVuaXF1ZUl0ZW1zID0gW11cbiAgZm9yKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XG4gICAgbGV0IHNlYXJjaFxuICAgIGlmKCFxdWVyeSkge1xuICAgICAgc2VhcmNoID0gaXRlbVxuICAgIH0gZWxzZSBpZih0eXBlb2YocXVlcnkpID09PSAnc3RyaW5nJykge1xuICAgICAgc2VhcmNoID0geyBbcXVlcnldOiBpdGVtW3F1ZXJ5XSB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlYXJjaCA9IHF1ZXJ5XG4gICAgfVxuICAgIGNvbnN0IGZpbmRlZCA9IGZpbmQodW5pcXVlSXRlbXMsIHNlYXJjaClcbiAgICBpZighZmluZGVkKSB1bmlxdWVJdGVtcy5wdXNoKGl0ZW0pXG4gIH1cbiAgcmV0dXJuIHVuaXF1ZUl0ZW1zXG59XG5cbmV4cG9ydCBjb25zdCBvYmpBcnJheVRvQ3N2ID0gKGFycjogYW55W10sIGRlbGltaXRlcjogc3RyaW5nID0gJywnKTogc3RyaW5nID0+IHtcbiAgaWYoIUFycmF5LmlzQXJyYXkoYXJyKSB8fCB0eXBlb2YoYXJyWzBdKSAhPSAnb2JqZWN0JykgdGhyb3cgbmV3IEVycm9yKGBGaXJzdCBwYXJhbWV0ZXIgbXVzdCBiZSBhbiBhcnJheSBvZiBvYmplY3RzYClcbiAgY29uc3QgaGVhZGVyID0gT2JqZWN0LmtleXMoYXJyWzBdKVxuXHRyZXR1cm4gW2hlYWRlci5qb2luKGRlbGltaXRlcikgLCBhcnIubWFwKHJvdyA9PiBoZWFkZXIubWFwKGtleSA9PiByb3dba2V5XSkuam9pbihkZWxpbWl0ZXIpKS5qb2luKFwiXFxuXCIpXS5qb2luKFwiXFxuXCIpXG59XG5cbmV4cG9ydCBjb25zdCB0b2dnbGVJbkFycmF5ID0gKGFycjogYW55W10sIG9iajogYW55KTogYW55W10gPT4ge1xuICBjb25zdCBmaW5kZWQgPSBmaW5kSW5kZXgoYXJyLCBvYmopXG4gIGlmKGZpbmRlZCA+IC0xKSB7XG4gICAgYXJyLnNwbGljZShmaW5kZWQsIDEpXG4gIH0gZWxzZSB7XG4gICAgYXJyLnB1c2gob2JqKVxuICB9XG4gIHJldHVybiBhcnJcbn1cblxuZXhwb3J0IGNvbnN0IGNvbXBhcmVBcnJheSA9IChhcnJGcm9tOiBhbnlbXSwgYXJyVG9Db21wYXJlOiBhbnlbXSwga2V5OiBzdHJpbmcgPSBudWxsKTogYm9vbGVhbiA9PiB7XG4gIGlmKGFyckZyb20ubGVuZ3RoICE9PSBhcnJUb0NvbXBhcmUubGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgZm9yKGNvbnN0IGl0ZW0gb2YgYXJyRnJvbSkge1xuICAgIGxldCBzZWFyY2hcbiAgICBpZih0eXBlb2YoaXRlbSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBzZWFyY2ggPSBpdGVtXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKHR5cGVvZihrZXkpICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdUaGlyZCBwYXJhbWV0ZXIgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICBzZWFyY2ggPXsgW2tleV06IGl0ZW1ba2V5XSB9XG4gICAgfVxuICAgIGNvbnN0IGZpbmRlZCA9IGZpbmQoYXJyVG9Db21wYXJlLCBzZWFyY2gpXG4gICAgaWYoIWZpbmRlZCkgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcmV0dXJuIHRydWVcbn1cblxuZXhwb3J0IGNvbnN0IHNodWZmbGUgPSAoYXJyYXk6IGFueVtdKSA9PiB7XG4gIGZvciAobGV0IGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgY29uc3QgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpIGFzIG51bWJlclxuICAgIFthcnJheVtpXSwgYXJyYXlbal1dID0gW2FycmF5W2pdLCBhcnJheVtpXV1cbiAgfVxuICByZXR1cm4gYXJyYXlcbn1cblxuZXhwb3J0IGNvbnN0IGdldFJhbmRvbUVsZW1lbnQgPSAobGlzdDogYW55W10pOiBhbnkgPT4gbGlzdFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsaXN0Lmxlbmd0aCldXG5cbmV4cG9ydCBjb25zdCBjaHVua0FycmF5ID0gKGFycjogYW55W10sIHNpemU6IG51bWJlcik6IGFueVtdW10gPT4ge1xuICBjb25zdCBjaHVua3M6IGFueVtdW10gPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkgKz0gc2l6ZSkge1xuICAgIGNodW5rcy5wdXNoKGFyci5zbGljZShpLCBpICsgc2l6ZSkpXG4gIH1cbiAgcmV0dXJuIGNodW5rc1xufVxuXG5leHBvcnQgY29uc3QgZ2V0UmFuZG9tV2VpdGhlZEVsZW1lbnRzSW5BcnJheXMgPSAobGlzdHM6IGFueVtdW10sIHdlaWdodHM6IG51bWJlcltdLCBjb3VudDogbnVtYmVyKTogYW55W10gPT4ge1xuICBpZiAobGlzdHMubGVuZ3RoICE9PSB3ZWlnaHRzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTGlzdHMgYW5kIHdlaWdodHMgYXJyYXlzIG11c3QgaGF2ZSB0aGUgc2FtZSBsZW5ndGgnKVxuICB9XG4gIFxuICBpZiAobGlzdHMubGVuZ3RoID09PSAwIHx8IHdlaWdodHMubGVuZ3RoID09PSAwIHx8IGNvdW50IDw9IDApIHtcbiAgICByZXR1cm4gW11cbiAgfVxuXG4gIC8vIENyaWFyIGPDs3BpYXMgZGFzIGxpc3RhcyBwYXJhIG7Do28gbW9kaWZpY2FyIGFzIG9yaWdpbmFpc1xuICBjb25zdCBhdmFpbGFibGVMaXN0cyA9IGxpc3RzLm1hcChsaXN0ID0+IFsuLi5saXN0XSlcbiAgY29uc3QgYXZhaWxhYmxlV2VpZ2h0cyA9IFsuLi53ZWlnaHRzXVxuXG4gIC8vIE5vcm1hbGl6YXIgb3MgcGVzb3MgcGFyYSBjcmlhciB1bWEgZGlzdHJpYnVpw6fDo28gZGUgcHJvYmFiaWxpZGFkZVxuICBjb25zdCBub3JtYWxpemVXZWlnaHRzID0gKHdlaWdodHM6IG51bWJlcltdKSA9PiB7XG4gICAgY29uc3QgdG90YWxXZWlnaHQgPSB3ZWlnaHRzLnJlZHVjZSgoc3VtLCB3ZWlnaHQpID0+IHN1bSArIHdlaWdodCwgMClcbiAgICBpZiAodG90YWxXZWlnaHQgPT09IDApIHJldHVybiB3ZWlnaHRzLm1hcCgoKSA9PiAwKVxuICAgIHJldHVybiB3ZWlnaHRzLm1hcCh3ZWlnaHQgPT4gd2VpZ2h0IC8gdG90YWxXZWlnaHQpXG4gIH1cblxuICBjb25zdCByZXN1bHQ6IGFueVtdID0gW11cbiAgXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgIC8vIFZlcmlmaWNhciBzZSBhaW5kYSBleGlzdGVtIGxpc3RhcyBjb20gaXRlbnNcbiAgICBjb25zdCBsaXN0c1dpdGhJdGVtcyA9IGF2YWlsYWJsZUxpc3RzXG4gICAgICAubWFwKChsaXN0LCBpbmRleCkgPT4gKHsgbGlzdCwgaW5kZXgsIHdlaWdodDogYXZhaWxhYmxlV2VpZ2h0c1tpbmRleF0gfSkpXG4gICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS5saXN0Lmxlbmd0aCA+IDApXG4gICAgXG4gICAgaWYgKGxpc3RzV2l0aEl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgYnJlYWsgLy8gTsOjbyBow6EgbWFpcyBpdGVucyBkaXNwb27DrXZlaXNcbiAgICB9XG5cbiAgICAvLyBSZWNhbGN1bGFyIHBlc29zIGFwZW5hcyBwYXJhIGxpc3RhcyBxdWUgYWluZGEgdMOqbSBpdGVuc1xuICAgIGNvbnN0IGFjdGl2ZVdlaWdodHMgPSBsaXN0c1dpdGhJdGVtcy5tYXAoaXRlbSA9PiBpdGVtLndlaWdodClcbiAgICBjb25zdCBub3JtYWxpemVkV2VpZ2h0cyA9IG5vcm1hbGl6ZVdlaWdodHMoYWN0aXZlV2VpZ2h0cylcbiAgICBcbiAgICAvLyBDcmlhciBpbnRlcnZhbG9zIGFjdW11bGF0aXZvcyBwYXJhIHNlbGXDp8OjbyBwb3IgcGVzb1xuICAgIGNvbnN0IGN1bXVsYXRpdmVXZWlnaHRzID0gW11cbiAgICBsZXQgY3VtdWxhdGl2ZSA9IDBcbiAgICBmb3IgKGNvbnN0IHdlaWdodCBvZiBub3JtYWxpemVkV2VpZ2h0cykge1xuICAgICAgY3VtdWxhdGl2ZSArPSB3ZWlnaHRcbiAgICAgIGN1bXVsYXRpdmVXZWlnaHRzLnB1c2goY3VtdWxhdGl2ZSlcbiAgICB9XG5cbiAgICBjb25zdCByYW5kb20gPSBNYXRoLnJhbmRvbSgpXG4gICAgXG4gICAgLy8gRW5jb250cmFyIHF1YWwgbGlzdGEgZGV2ZSBzZXIgc2VsZWNpb25hZGEgYmFzZWFkbyBubyBwZXNvXG4gICAgbGV0IHNlbGVjdGVkTGlzdEluZGV4ID0gMFxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgY3VtdWxhdGl2ZVdlaWdodHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGlmIChyYW5kb20gPD0gY3VtdWxhdGl2ZVdlaWdodHNbal0pIHtcbiAgICAgICAgc2VsZWN0ZWRMaXN0SW5kZXggPSBqXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFBlZ2FyIG8gw61uZGljZSByZWFsIGRhIGxpc3RhIG9yaWdpbmFsXG4gICAgY29uc3QgcmVhbExpc3RJbmRleCA9IGxpc3RzV2l0aEl0ZW1zW3NlbGVjdGVkTGlzdEluZGV4XS5pbmRleFxuICAgIGNvbnN0IHNlbGVjdGVkTGlzdCA9IGF2YWlsYWJsZUxpc3RzW3JlYWxMaXN0SW5kZXhdXG4gICAgXG4gICAgaWYgKHNlbGVjdGVkTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZ2V0UmFuZG9tRWxlbWVudChzZWxlY3RlZExpc3QpXG4gICAgICByZXN1bHQucHVzaChlbGVtZW50KVxuICAgICAgXG4gICAgICAvLyBSZW1vdmVyIG8gZWxlbWVudG8gc2VsZWNpb25hZG8gZGEgbGlzdGEgcGFyYSBldml0YXIgcmVwZXRpw6fDo29cbiAgICAgIGNvbnN0IGVsZW1lbnRJbmRleCA9IHNlbGVjdGVkTGlzdC5pbmRleE9mKGVsZW1lbnQpXG4gICAgICBzZWxlY3RlZExpc3Quc3BsaWNlKGVsZW1lbnRJbmRleCwgMSlcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiByZXN1bHRcbn1cblxuZXhwb3J0IGNvbnN0IEFycmF5SGVscGVycyA9IHtcbiAgZmluZEJ5T2JqLFxuICBmaW5kQnlTdHJpbmcsXG4gIGZpbmQsXG4gIGZpbmRJbmRleCxcbiAgZmluZEFsbCxcbiAgcmVtb3ZlQWxsLFxuICByZW1vdmUsXG4gIHVuaXF1ZUJ5S2V5LFxuICBvYmpBcnJheVRvQ3N2LFxuICB0b2dnbGVJbkFycmF5LFxuICBjb21wYXJlQXJyYXksXG4gIHNodWZmbGUsXG4gIGdldFJhbmRvbUVsZW1lbnQsXG4gIGNodW5rQXJyYXksXG4gIGdldFJhbmRvbVdlaXRoZWRFbGVtZW50c0luQXJyYXlzXG59XG5cbiIsIlxuLyoqXG4gKiBcbiAqIGdldCBhbW91bnQgb2YgYSBnaXZlbiAlIG9mIGEgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFtb3VudE9mUGVyY2VudGFnZSA9IChhbW91bnQ6IG51bWJlciwgcGVyY2VudGFnZTogbnVtYmVyIHwgc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHBjdCA9IGdldFBhcnNlZFZhbHVlKHBlcmNlbnRhZ2UpXG4gIGNvbnN0IGFtdCA9IGdldFBhcnNlZFZhbHVlKGFtb3VudClcbiAgcmV0dXJuIE51bWJlcihhbXQgLyAxMDAgKiBwY3QpXG59XG5cbi8qKlxuICogXG4gKiBnZXQgdGhlICUgb2YgYSBnaXZlbiBhbW91bnQgYW5kIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQZXJjZW50YWdlT2ZBbW91bnQgPSAoYW1vdW50OiBudW1iZXIsIHZhbHVlOiBudW1iZXIsIHBlcmNlbnRhZ2VTaWduOiBib29sZWFuID0gZmFsc2UsIGRpZ2l0czpudW1iZXIgPSAyLCByZXR1cm5XaGVuQW1vdW50SXNaZXJvOiBudWxsIHwgc3RyaW5nIHwgbnVtYmVyID0gJy0tJyk6IG51bWJlciB8IHN0cmluZyA9PiB7XG4gIGNvbnN0IGFtdCA9IGdldFBhcnNlZFZhbHVlKGFtb3VudClcbiAgaWYoYW10ID09PSAwICYmIHR5cGVvZiByZXR1cm5XaGVuQW1vdW50SXNaZXJvICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiByZXR1cm5XaGVuQW1vdW50SXNaZXJvXG4gIH1cbiAgY29uc3QgcmVzdWx0ID0gTnVtYmVyKDEwMCAvIGFtdCAqIHZhbHVlKVxuICBpZighcGVyY2VudGFnZVNpZ24pIHJldHVybiByZXN1bHRcbiAgaWYoaXNOYU4oTnVtYmVyKCByZXN1bHQgLyAxMDAgKSkpIHJldHVybiBOdW1iZXIocmVzdWx0LzEwMClcbiAgcmV0dXJuIE51bWJlciggcmVzdWx0IC8gMTAwICkudG9Mb2NhbGVTdHJpbmcodW5kZWZpbmVkLCB7IHN0eWxlOiAncGVyY2VudCcsIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogZGlnaXRzIH0pXG59XG5cbmV4cG9ydCBjb25zdCByb3VuZCA9ICh2YWx1ZTogbnVtYmVyLCBkZWNpbWFsczogbnVtYmVyID0gMikgPT4ge1xuICBjb25zdCB2bCA9IGdldFBhcnNlZFZhbHVlKHZhbHVlKVxuICB2YXIgcCA9IE1hdGgucG93KDEwLCBkZWNpbWFscylcbiAgcmV0dXJuIE1hdGgucm91bmQodmwgKiBwKSAvIHBcbn1cblxuZXhwb3J0IGNvbnN0IHJhbmRvbUludCA9IChtYXg6IG51bWJlciwgbWluOiBudW1iZXIgPSAwKSA9PiB7XG4gIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKChtYXggLSBtaW4pICogTWF0aC5yYW5kb20oKSk7XG59XG5cbi8qKlxuICogYWRkIGEgcmF3IHBlcmNlbnRhZ2UgdmFsdWUgdG8gYSBudW1iZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGFkZFBlcmNlbnRhZ2UgPSAodmFsdWU6IG51bWJlciwgcGVyY2VudGFnZTogc3RyaW5nIHwgbnVtYmVyKSA9PiB7XG4gIGNvbnN0IHBjdCA9IGdldFBhcnNlZFZhbHVlKHBlcmNlbnRhZ2UpXG4gIGNvbnN0IHZsID0gZ2V0UGFyc2VkVmFsdWUodmFsdWUpXG4gIHJldHVybiB2bCAqICgxICsgKHBjdCAvIDEwMCkpXG59XG5cbi8qKlxuICogXG4gKiByZXR1cm5zIGEgbWluIHZhbHVlIHVzaW5nIGEgcGVyY2VudGFnZSBhcyByZWZlcmVuY2VzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRWYWx1ZU9yTWluUGVyY2VudGFnZSA9IChhbW91bnQ6IG51bWJlciwgdmFsdWU6IG51bWJlciwgcGVyY2VudGFnZTogbnVtYmVyID0gMTApID0+IHtcbiAgY29uc3QgYW10ID0gZ2V0UGFyc2VkVmFsdWUoYW1vdW50KVxuICBjb25zdCB2bCA9IGdldFBhcnNlZFZhbHVlKHZhbHVlKVxuICBjb25zdCBwY3QgPSBnZXRQYXJzZWRWYWx1ZShwZXJjZW50YWdlKVxuICBpZigoYW10IC8gMTAwICogcGN0KSA+IHZsKSByZXR1cm4gZ2V0QW1vdW50T2ZQZXJjZW50YWdlKGFtdCwgcGN0KVxuICByZXR1cm4gdmxcbn1cblxuY29uc3QgZ2V0UGFyc2VkVmFsdWUgPSAodmFsdWU6IG51bWJlciB8IHN0cmluZyk6IG51bWJlciA9PiB7XG4gIHJldHVybiB0eXBlb2YodmFsdWUpID09PSAnbnVtYmVyJyA/IHZhbHVlIDogcGFyc2VGbG9hdCh2YWx1ZSlcbn1cblxuZXhwb3J0IGNvbnN0IE1hdGhIZWxwZXJzID0ge1xuICBnZXRBbW91bnRPZlBlcmNlbnRhZ2UsXG4gIGdldFBlcmNlbnRhZ2VPZkFtb3VudCxcbiAgcm91bmQsXG4gIHJhbmRvbUludCxcbiAgYWRkUGVyY2VudGFnZSxcbiAgZ2V0VmFsdWVPck1pblBlcmNlbnRhZ2Vcbn0iLCJcbmV4cG9ydCBjb25zdCBkb3dubG9hZFJhd0RhdGEgPSAoZGF0YTogc3RyaW5nLCBmaWxlTmFtZTpzdHJpbmcgPSAnZmlsZS50eHQnKTogdm9pZCA9PiB7XG4gIGlmKCF3aW5kb3cpIHRocm93IG5ldyBFcnJvcihgTWV0aG9kIGRvd25sb2FkUmF3RGF0YSBtdXN0IHJ1biBpbiBcIndpbmRvd1wiIGNvbnRleHQuYClcbiAgY29uc3QgYmxvYiA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtkYXRhXSkpXG5cdGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcblx0bGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBibG9iKVxuXHRsaW5rLnNldEF0dHJpYnV0ZSgnZG93bmxvYWQnLCBmaWxlTmFtZSlcblx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKVxuXHRsaW5rLmNsaWNrKClcblx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKVxufVxuXG5leHBvcnQgY29uc3QgY29weVRvQ2xpcGJvYXJkID0gKHN0cmluZzogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGlmKG5hdmlnYXRvci5jbGlwYm9hcmQpIHtcbiAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChzdHJpbmcpXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZHVtbXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIilcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGR1bW15KVxuICAgIGR1bW15LnZhbHVlID0gc3RyaW5nXG4gICAgZHVtbXkuc2VsZWN0KClcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIilcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGR1bW15KVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBnZXRMZXR0ZXJCeU51bWJlciA9IChudW1iZXI6IG51bWJlcik6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHN0cmluZyA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eidcbiAgaWYoc3RyaW5nLmxlbmd0aC0xIDwgbnVtYmVyKSByZXR1cm4gJy0tJ1xuICByZXR1cm4gc3RyaW5nW251bWJlcl1cbn1cblxuZXhwb3J0IGNvbnN0IHJlbW92ZUFsbENvb2tpZXMgPSAoKTogdm9pZCA9PiB7XG4gIGlmKGRvY3VtZW50KSB7XG4gICAgY29uc3QgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY29va2llID0gY29va2llc1tpXTtcbiAgICAgIGNvbnN0IGVxUG9zID0gY29va2llLmluZGV4T2YoJz0nKTtcbiAgICAgIGNvbnN0IG5hbWUgPSBlcVBvcyA+IC0xID8gY29va2llLnN1YnN0cigwLCBlcVBvcykgOiBjb29raWU7XG4gICAgICBjb25zdCBwYXRoID0gJy8nO1xuICAgICAgZG9jdW1lbnQuY29va2llID0gbmFtZSArICc9O2V4cGlyZXM9VGh1LCAwMSBKYW4gMTk3MCAwMDowMDowMCBHTVQ7cGF0aD0nICsgcGF0aDtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNsZWFyQnJvd3NlckNhY2hlID0gKHJlbW92ZUNvb2tpZXM6IGJvb2xlYW4gPSB0cnVlKSA9PiB7XG4gIGxvY2FsU3RvcmFnZS5jbGVhcigpXG4gIHNlc3Npb25TdG9yYWdlLmNsZWFyKClcbiAgaWYocmVtb3ZlQ29va2llcykge1xuICAgIHJlbW92ZUFsbENvb2tpZXMoKVxuICB9XG59XG5cblxuZXhwb3J0IGNvbnN0IGNsZWFyQnJvd3NlckNhY2hlTGlzdGVuZXIgPSAoaG90S2V5OiBzdHJpbmcgPSAnS2V5WCcsIHJlbW92ZUNvb2tpZXM6IGJvb2xlYW4gPSB0cnVlLCBjYjogRnVuY3Rpb24gfCBudWxsID0gbnVsbCk6IHZvaWQgPT4ge1xuICBpZihkb2N1bWVudCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQuYWx0S2V5ICYmIGV2ZW50LmNvZGUgPT09IGhvdEtleSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGNsZWFyQnJvd3NlckNhY2hlKHJlbW92ZUNvb2tpZXMpXG4gICAgICAgIGlmKGNiKSB7XG4gICAgICAgICAgY2IoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZGVib3VuY2UgPSA8VCBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gYW55PihcbiAgY2FsbGJhY2s6IFQsIFxuICB0aW1lb3V0OiBudW1iZXIgPSAzMDBcbik6ICgoLi4uYXJnczogUGFyYW1ldGVyczxUPikgPT4gdm9pZCkgPT4ge1xuICBsZXQgdGltZXI6IE5vZGVKUy5UaW1lb3V0IHwgbnVtYmVyXG4gIFxuICByZXR1cm4gKC4uLmFyZ3M6IFBhcmFtZXRlcnM8VD4pID0+IHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNhbGxiYWNrKC4uLmFyZ3MpXG4gICAgfSwgdGltZW91dClcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQ29tbW9uSGVscGVycyA9IHtcbiAgZG93bmxvYWRSYXdEYXRhLFxuICBjb3B5VG9DbGlwYm9hcmQsXG4gIGdldExldHRlckJ5TnVtYmVyLFxuICBjbGVhckJyb3dzZXJDYWNoZSxcbiAgY2xlYXJCcm93c2VyQ2FjaGVMaXN0ZW5lcixcbiAgcmVtb3ZlQWxsQ29va2llcyxcbiAgZGVib3VuY2Vcbn0iLCJcblxuZXhwb3J0IHR5cGUgVHlwZU51bWJlckZvcm1hdE9wdGlvbnMgPSB7XG4gIHByZWZpeDogc3RyaW5nXG4gIHN1ZmZpeDogc3RyaW5nXG4gIGRlY2ltYWw6IHN0cmluZ1xuICB0aG91c2FuZDogc3RyaW5nXG4gIHByZWNpc2lvbjogbnVtYmVyXG4gIGFjY2VwdE5lZ2F0aXZlOiBib29sZWFuXG4gIGlzSW50ZWdlcjogYm9vbGVhblxuICB2dWVWZXJzaW9uPzogc3RyaW5nXG59XG5cbmNvbnN0IGRlZmF1bHRPcHRpb25zOiBUeXBlTnVtYmVyRm9ybWF0T3B0aW9ucyA9IHtcbiAgcHJlZml4OiAnVVMkICcsXG4gIHN1ZmZpeDogJycsXG4gIGRlY2ltYWw6ICcuJyxcbiAgdGhvdXNhbmQ6ICcsJyxcbiAgcHJlY2lzaW9uOiAyLFxuICBhY2NlcHROZWdhdGl2ZTogdHJ1ZSxcbiAgaXNJbnRlZ2VyOiBmYWxzZVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0T3B0aW9ucyIsIi8qXG4gKiBpZ29ydHJpbmlkYWQvdnVlLW51bWJlci1mb3JtYXRcbiAqXG4gKiAoYykgSWdvciBUcmluZGFkZSA8aWdvcnRyaW5kYWRlLm1lQGdtYWlsLmNvbT5cbiAqIFxuICogTW9zdGx5IG9mIHRoaXMgZmlsZSBjb250ZW50IHdhcyBleHRyYWN0ZWQgZnJvbSB0aGUgaHR0cHM6Ly9naXRodWIuY29tL21haWNvOTEwL3Z1ZS1udW1iZXItZm9ybWF0L2Jsb2Ivdml0ZS10eXBlc2NyaXB0LXJlZmFjdG9yL3NyYy91dGlscy50c1xuICpcbiAqIEZvciB0aGUgZnVsbCBjb3B5cmlnaHQgYW5kIGxpY2Vuc2UgaW5mb3JtYXRpb24sIHBsZWFzZSB2aWV3IHRoZSBMSUNFTlNFXG4gKiBmaWxlIHRoYXQgd2FzIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyBzb3VyY2UgY29kZS5cbiAqL1xuXG5pbXBvcnQgZGVmYXVsdE9wdGlvbnMsIHsgdHlwZSBUeXBlTnVtYmVyRm9ybWF0T3B0aW9ucyB9IGZyb20gJy4vdHlwZXMvTnVtYmVyRm9ybWF0T3B0aW9ucydcblxuZXhwb3J0IGNvbnN0IGZvcm1hdE51bWJlciA9IChpbnB1dDogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCA9ICcwJywgb3B0OiBQYXJ0aWFsPFR5cGVOdW1iZXJGb3JtYXRPcHRpb25zPiA9IHt9KSA9PiB7XG4gIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSB7Li4uZGVmYXVsdE9wdGlvbnMsIC4uLm9wdH07XG5cbiAgbGV0IGlucHV0SW5TdHJpbmc7XG5cbiAgaWYgKCEhaW5wdXQpIHtcbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnbnVtYmVyJyAmJiAhbWVyZ2VkT3B0aW9ucy5pc0ludGVnZXIpIHtcbiAgICAgIGlucHV0SW5TdHJpbmcgPSBpbnB1dC50b0ZpeGVkKGZpeGVkKG1lcmdlZE9wdGlvbnMucHJlY2lzaW9uKSlcbiAgICB9IGVsc2Uge1xuICAgICAgaW5wdXRJblN0cmluZyA9IGlucHV0LnRvU3RyaW5nKClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaW5wdXRJblN0cmluZyA9ICcnXG4gIH1cblxuXG4gIGNvbnN0IG1pbnVzU3ltYm9sID0gaXNOZWdhdGl2ZShpbnB1dEluU3RyaW5nLCBtZXJnZWRPcHRpb25zLmFjY2VwdE5lZ2F0aXZlKSAgPyAnLScgOiAnJ1xuICBjb25zdCBudW1iZXJzID0gaW5wdXRPbmx5TnVtYmVycyhpbnB1dEluU3RyaW5nLnRvU3RyaW5nKCkpXG4gIGNvbnN0IGN1cnJlbmN5SW5TdHJpbmcgPSBudW1iZXJzVG9DdXJyZW5jeShudW1iZXJzLCBtZXJnZWRPcHRpb25zLnByZWNpc2lvbilcblxuICBjb25zdCBjdXJyZW5jeVBhcnRzID0gY3VycmVuY3lJblN0cmluZy5zcGxpdCgnLicpXG4gIGNvbnN0IGRlY2ltYWwgPSBjdXJyZW5jeVBhcnRzWzFdXG4gIGNvbnN0IGludGVnZXIgPSBhZGRUaG91c2FuZFNlcGFyYXRvcihjdXJyZW5jeVBhcnRzWzBdLCBtZXJnZWRPcHRpb25zLnRob3VzYW5kKVxuXG4gIHJldHVybiBtaW51c1N5bWJvbCArIG1lcmdlZE9wdGlvbnMucHJlZml4ICsgam9pbkludGVnZXJBbmREZWNpbWFsKGludGVnZXIsIGRlY2ltYWwsIG1lcmdlZE9wdGlvbnMuZGVjaW1hbCkgKyBtZXJnZWRPcHRpb25zLnN1ZmZpeFxufVxuXG5leHBvcnQgY29uc3QgdW5mb3JtYXROdW1iZXIgPSAoaW5wdXQ6IHN0cmluZyB8IG51bWJlciB8IG51bGwgPSAwLCBvcHQ6IFBhcnRpYWw8VHlwZU51bWJlckZvcm1hdE9wdGlvbnM+ID0ge30pID0+IHtcbiAgY29uc3QgbWVyZ2VkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBvcHQpO1xuXG4gIGNvbnN0IHVzZXJJbnB1dCA9IGlucHV0IHx8IDA7XG5cbiAgY29uc3QgbnVtYmVycyA9IGlucHV0T25seU51bWJlcnModXNlcklucHV0KVxuXG4gIGlmKG1lcmdlZE9wdGlvbnMuaXNJbnRlZ2VyKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KGAke2lzTmVnYXRpdmUodXNlcklucHV0LCBtZXJnZWRPcHRpb25zLmFjY2VwdE5lZ2F0aXZlKSA/ICctJyA6ICcnfSR7bnVtYmVycy50b1N0cmluZygpfWApXG4gIH1cblxuICBjb25zdCBtYWtlTnVtYmVyTmVnYXRpdmUgPSAoaXNOZWdhdGl2ZSh1c2VySW5wdXQsIG1lcmdlZE9wdGlvbnMuYWNjZXB0TmVnYXRpdmUpKVxuICBjb25zdCBjdXJyZW5jeSA9IG51bWJlcnNUb0N1cnJlbmN5KG51bWJlcnMsIG1lcmdlZE9wdGlvbnMucHJlY2lzaW9uKVxuICByZXR1cm4gbWFrZU51bWJlck5lZ2F0aXZlID8gcGFyc2VGbG9hdChjdXJyZW5jeSkgKiAtIDEgOiBwYXJzZUZsb2F0KGN1cnJlbmN5KVxufVxuXG5mdW5jdGlvbiBpbnB1dE9ubHlOdW1iZXJzIChpbnB1dDogc3RyaW5nIHwgbnVtYmVyID0gMCkge1xuICByZXR1cm4gaW5wdXQgPyBpbnB1dC50b1N0cmluZygpLnJlcGxhY2UoL1xcRCsvZywgJycpIDogJzAnXG59XG5cbi8vIDEyMyBSYW5nZUVycm9yOiB0b0ZpeGVkKCkgZGlnaXRzIGFyZ3VtZW50IG11c3QgYmUgYmV0d2VlbiAwIGFuZCAyMCBhdCBOdW1iZXIudG9GaXhlZFxuZnVuY3Rpb24gZml4ZWQocHJlY2lzaW9uOiBudW1iZXIpIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKHByZWNpc2lvbiwgMjApKVxufVxuXG5mdW5jdGlvbiBudW1iZXJzVG9DdXJyZW5jeSAobnVtYmVyczogc3RyaW5nLCBwcmVjaXNpb246IG51bWJlcikge1xuICBjb25zdCBleHAgPSBNYXRoLnBvdygxMCwgcHJlY2lzaW9uKVxuICBjb25zdCBmbG9hdCA9IHBhcnNlRmxvYXQobnVtYmVycykgLyBleHBcbiAgcmV0dXJuIGZsb2F0LnRvRml4ZWQoZml4ZWQocHJlY2lzaW9uKSlcbn1cblxuZnVuY3Rpb24gYWRkVGhvdXNhbmRTZXBhcmF0b3IgKGludGVnZXI6IHN0cmluZywgc2VwYXJhdG9yOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oPzpcXGR7M30pK1xcYikvZ20sIGAkMSR7c2VwYXJhdG9yfWApXG59XG5cbmZ1bmN0aW9uIGpvaW5JbnRlZ2VyQW5kRGVjaW1hbCAoaW50ZWdlcjogc3RyaW5nLCBkZWNpbWFsOiBzdHJpbmcsIHNlcGFyYXRvcjogc3RyaW5nKSB7XG4gIGlmIChkZWNpbWFsKSB7XG4gICAgcmV0dXJuIGludGVnZXIgKyBzZXBhcmF0b3IgKyBkZWNpbWFsO1xuICB9XG5cbiAgcmV0dXJuIGludGVnZXI7XG59XG5cbmZ1bmN0aW9uIGlzTmVnYXRpdmUoc3RyaW5nOiBudW1iZXIgfCBzdHJpbmcsIGFjY2VwdE5lZ2F0aXZlID0gdHJ1ZSkge1xuICBpZighYWNjZXB0TmVnYXRpdmUpIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IHZhbHVlID0gc3RyaW5nLnRvU3RyaW5nKCk7XG4gIGNvbnN0IGlzTmVnYXRpdmUgPSAodmFsdWUuc3RhcnRzV2l0aCgnLScpIHx8IHZhbHVlLmVuZHNXaXRoKCctJykpXG4gIGNvbnN0IGZvcmNlUG9zaXRpdmUgPSB2YWx1ZS5pbmRleE9mKCcrJykgPiAwXG5cbiAgcmV0dXJuIGlzTmVnYXRpdmUgJiYgIWZvcmNlUG9zaXRpdmVcbn1cblxuZXhwb3J0IGNvbnN0IE51bWJlckZvcm1hdCA9IHtcbiAgZm9ybWF0TnVtYmVyLFxuICB1bmZvcm1hdE51bWJlcixcbn0iLCJcbmludGVyZmFjZSBVcmxJbWFnZSB7XG4gIHVybDogc3RyaW5nXG4gIHRpdGxlOiBzdHJpbmdcbiAgY2FwdGlvbjogc3RyaW5nXG59XG5cbnR5cGUgQ2hhbmdlRnJlcXMgPSAnYWx3YXlzJyB8ICdob3VybHknIHwgJ2RhaWx5JyB8ICd3ZWVrbHknIHwgJ21vbnRobHknIHwgJ2FudWFsJyB8ICduZXZlcidcblxuaW50ZXJmYWNlIFVybEl0ZW1JbnRlcmZhY2Uge1xuICB1cmw6IHN0cmluZ1xuICBsYXN0TW9kaWZpZWQ/OiBzdHJpbmdcbiAgY2hhbmdlRnJlcT86IENoYW5nZUZyZXFzXG4gIHByaW9yaXR5Pzogc3RyaW5nXG4gIGltYWdlPzogVXJsSW1hZ2Vcbn1cblxuZXhwb3J0IGNsYXNzIFVybEl0ZW0ge1xuXG4gIHVybDogc3RyaW5nXG4gIGxhc3RNb2RpZmllZDogc3RyaW5nID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLDEwKVxuICBjaGFuZ2VGcmVxOiBDaGFuZ2VGcmVxcyA9ICdtb250aGx5J1xuICBwcmlvcml0eTogc3RyaW5nID0gJzEuMCdcbiAgaW1hZ2U/OiBVcmxJbWFnZSA9IG51bGxcblxuICBjb25zdHJ1Y3Rvcih1cmxJdGVtOiBVcmxJdGVtSW50ZXJmYWNlKXtcbiAgICBpZighdXJsSXRlbS51cmwpIHRocm93IG5ldyBFcnJvcignVXJsIGlzIHJlcXVpcmVkJylcbiAgICB0aGlzLnVybCA9IHRoaXMucmVtb3ZlRmlyc3RTbGFzaEZyb21VcmwodXJsSXRlbS51cmwpXG4gICAgaWYodXJsSXRlbS5sYXN0TW9kaWZpZWQgKSB0aGlzLmxhc3RNb2RpZmllZCA9IHVybEl0ZW0ubGFzdE1vZGlmaWVkXG4gICAgaWYodXJsSXRlbS5jaGFuZ2VGcmVxICkgdGhpcy5jaGFuZ2VGcmVxID0gdXJsSXRlbS5jaGFuZ2VGcmVxXG4gICAgaWYodXJsSXRlbS5wcmlvcml0eSApIHRoaXMucHJpb3JpdHkgPSB1cmxJdGVtLnByaW9yaXR5XG4gICAgaWYodXJsSXRlbS5pbWFnZSApIHRoaXMuaW1hZ2UgPSB1cmxJdGVtLmltYWdlXG4gIH1cblxuICByZW1vdmVGaXJzdFNsYXNoRnJvbVVybCh1cmw6IHN0cmluZykge1xuICAgIGlmKHVybFswXSA9PSAnLycpIHJldHVybiB1cmwuc3Vic3RyaW5nKDEpXG4gICAgcmV0dXJuIHVybFxuICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFNpdGVNYXBHZW5lcmF0b3Ige1xuXG4gIGJhc2VVcmw6IHN0cmluZyA9ICcnXG4gIGl0ZW1zOiBVcmxJdGVtW10gPSBbXVxuICB4bWxTdHlsZXNoZWV0UGF0aDogc3RyaW5nID0gJydcblxuICBjb25zdHJ1Y3RvcihiYXNlVXJsOiBzdHJpbmcpIHtcbiAgICB0aGlzLmJhc2VVcmwgPSBiYXNlVXJsXG4gICAgdGhpcy5pdGVtcyA9IFtdXG4gIH1cblxuICBwcml2YXRlIGdldCBnZXRIZWFkZXIgKCkge1xuY29uc3QgaGVhZGVyID0gXG5gXG4keyB0aGlzLnhtbFN0eWxlc2hlZXRQYXRoID8gYDw/eG1sLXN0eWxlc2hlZXQgaHJlZj1cIiR7IHRoaXMueG1sU3R5bGVzaGVldFBhdGggfVwiIHR5cGU9XCJ0ZXh0L3hzbFwiPz5gIDogJycgfVxuPHVybHNldCB4bWxucz1cImh0dHA6Ly93d3cuc2l0ZW1hcHMub3JnL3NjaGVtYXMvc2l0ZW1hcC8wLjlcIiB4bWxuczp4aHRtbD1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIiB4bWxuczppbWFnZT1cImh0dHA6Ly93d3cuZ29vZ2xlLmNvbS9zY2hlbWFzL3NpdGVtYXAtaW1hZ2UvMS4xXCIgeG1sbnM6dmlkZW89XCJodHRwOi8vd3d3Lmdvb2dsZS5jb20vc2NoZW1hcy9zaXRlbWFwLXZpZGVvLzEuMVwiPlxuYFxucmV0dXJuIGhlYWRlclxuICB9XG5cbiAgcHJpdmF0ZSBnZXQgZ2V0Qm9keSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXRlbXMubWFwKChpdGVtKSA9PiB7XG4gICAgICB2YXIgaXRlbVJlc3VsdCA9ICBcbmBcbiAgPHVybD5cbiAgICA8bG9jPiR7IHRoaXMuYmFzZVVybCB9JHsgKCFpdGVtLnVybCkgPyAnJyA6IGAvJHsgaXRlbS51cmwgfWAgfTwvbG9jPlxuICAgIDxwcmlvcml0eT4ke2l0ZW0ucHJpb3JpdHl9PC9wcmlvcml0eT5cbiAgICA8bGFzdG1vZD4ke2l0ZW0ubGFzdE1vZGlmaWVkfTwvbGFzdG1vZD5cbiAgICA8Y2hhbmdlZnJlcT4ke2l0ZW0uY2hhbmdlRnJlcX08L2NoYW5nZWZyZXE+YFxuXG4gICAgaWYoaXRlbS5pbWFnZSkge1xuICAgICAgXG4gICAgICBpdGVtUmVzdWx0ICs9IFxuYFxuICAgICAgPGltYWdlOmltYWdlPlxuICAgICAgICA8aW1hZ2U6bG9jPiR7aXRlbS5pbWFnZS51cmx9PC9pbWFnZTpsb2M+XG4gICAgICAgIDxpbWFnZTpjYXB0aW9uPiR7aXRlbS5pbWFnZS5jYXB0aW9ufTwvaW1hZ2U6Y2FwdGlvbj5cbiAgICAgICAgPGltYWdlOnRpdGxlPiR7aXRlbS5pbWFnZS50aXRsZX08L2ltYWdlOnRpdGxlPlxuICAgICAgPC9pbWFnZTppbWFnZT5gXG4gICAgfVxuICAgIGl0ZW1SZXN1bHQgKz0gXG5gXG4gIDwvdXJsPlxuYFxucmV0dXJuIGl0ZW1SZXN1bHRcbiAgICBcbiAgfSlcbiAgLmpvaW4oJycpXG5cbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGdldEZvb3RlciAoKSB7XG4gICAgcmV0dXJuIGA8L3VybHNldD5gXG4gIH1cblxuICBwdWJsaWMgc2V0WG1sU3R5bGVTaGVldFBhdGgocGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy54bWxTdHlsZXNoZWV0UGF0aCA9IHBhdGhcbiAgfVxuXG4gIHB1YmxpYyBhZGRJdGVtKHVybEl0ZW06IFVybEl0ZW1JbnRlcmZhY2UpOiB2b2lkIHtcbiAgICB0aGlzLml0ZW1zLnB1c2gobmV3IFVybEl0ZW0odXJsSXRlbSkpXG4gIH1cblxuICBwdWJsaWMgZ2VuZXJhdGUoKTogc3RyaW5ne1xuICAgIGNvbnN0IHJlc3VsdCA9IFxuYFxuJHsgdGhpcy5nZXRIZWFkZXIgfVxuJHsgdGhpcy5nZXRCb2R5IH1cbiR7IHRoaXMuZ2V0Rm9vdGVyIH1cbmBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxufVxuXG4iLCJleHBvcnQgY29uc3QgdGl0bGVDYXNlU3RyaW5nID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgcmV0dXJuIHN0ci50b1N0cmluZygpLnNwbGl0KCcgJykubWFwKChzdHIpID0+IHN0ci50b1VwcGVyQ2FzZSgpLmNoYXJBdCgwKSArIHN0ci5zdWJzdHJpbmcoMSkudG9Mb3dlckNhc2UoKSkuam9pbignICcpXG59XG5cbmV4cG9ydCBjb25zdCByYW5kb21TdHJpbmcgPSAobGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xuICB2YXIgcmVzdWx0ICAgICAgICAgICA9ICcnXG4gIHZhciBjaGFyYWN0ZXJzICAgICAgID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5J1xuICB2YXIgY2hhcmFjdGVyc0xlbmd0aCA9IGNoYXJhY3RlcnMubGVuZ3RoXG4gIGZvciAoIHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICByZXN1bHQgKz0gY2hhcmFjdGVycy5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2hhcmFjdGVyc0xlbmd0aCkpXG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5leHBvcnQgY29uc3Qgam9pbkNvbW1hUGx1c0FuZCA9IChhOiBBcnJheTxhbnk+LCB1bmlmaWVyU3RyaW5nID0gJyBhbmQgJykgPT4ge1xuICByZXR1cm4gW2Euc2xpY2UoMCwgLTEpLmpvaW4oJywgJyksIGEuc2xpY2UoLTEpWzBdXS5qb2luKGEubGVuZ3RoIDwgMiA/ICcnIDogdW5pZmllclN0cmluZylcbn1cblxuZnVuY3Rpb24gbGV2ZW5zaHRlaW4oYTogc3RyaW5nLCBiOiBzdHJpbmcpIHtcbiAgY29uc3QgbWF0cml4ID0gW11cblxuICBmb3IgKGxldCBpID0gMDsgaSA8PSBiLmxlbmd0aDsgaSsrKSB7XG4gICAgICBtYXRyaXhbaV0gPSBbaV1cbiAgfVxuXG4gIGZvciAobGV0IGogPSAwOyBqIDw9IGEubGVuZ3RoOyBqKyspIHtcbiAgICAgIG1hdHJpeFswXVtqXSA9IGpcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IGIubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAxOyBqIDw9IGEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAoYi5jaGFyQXQoaSAtIDEpID09PSBhLmNoYXJBdChqIC0gMSkpIHtcbiAgICAgICAgICAgICAgbWF0cml4W2ldW2pdID0gbWF0cml4W2kgLSAxXVtqIC0gMV1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtYXRyaXhbaV1bal0gPSBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICAgIG1hdHJpeFtpIC0gMV1baiAtIDFdICsgMSxcbiAgICAgICAgICAgICAgICAgIE1hdGgubWluKFxuICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeFtpXVtqIC0gMV0gKyAxLFxuICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeFtpIC0gMV1bal0gKyAxXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICB9XG4gIH1cblxuICByZXR1cm4gbWF0cml4W2IubGVuZ3RoXVthLmxlbmd0aF1cbn1cblxuY29uc3QgcmVtb3ZlQWNjZW50cyA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIHJldHVybiBzdHIubm9ybWFsaXplKCdORkQnKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCAnJylcbn1cblxuZXhwb3J0IGNvbnN0IGNoZWNrU3RyaW5nU2ltaWxhcml0eSA9IChiYXNlOiBzdHJpbmcsIHN0cmluZ1RvQ29tcGFyZTogc3RyaW5nLCBjYXNlSW5zZW5zaXRpdmU6IGJvb2xlYW4gPSB0cnVlKTogbnVtYmVyID0+IHtcbiAgaWYoY2FzZUluc2Vuc2l0aXZlKSB7XG4gICAgYmFzZSA9IGJhc2UudG9Mb3dlckNhc2UoKVxuICAgIHN0cmluZ1RvQ29tcGFyZSA9IHN0cmluZ1RvQ29tcGFyZS50b0xvd2VyQ2FzZSgpXG4gIH1cbiAgXG4gIC8vIFJlbW92ZSBhY2VudG9zIHBhcmEgY29tcGFyYcOnw6NvXG4gIGJhc2UgPSByZW1vdmVBY2NlbnRzKGJhc2UpXG4gIHN0cmluZ1RvQ29tcGFyZSA9IHJlbW92ZUFjY2VudHMoc3RyaW5nVG9Db21wYXJlKVxuICBcbiAgY29uc3QgZGlzdGFuY2UgPSBsZXZlbnNodGVpbihiYXNlLCBzdHJpbmdUb0NvbXBhcmUpXG4gIGNvbnN0IG1heExlbiA9IE1hdGgubWF4KGJhc2UubGVuZ3RoLCBzdHJpbmdUb0NvbXBhcmUubGVuZ3RoKVxuICBjb25zdCBzaW1pbGFyaXR5ID0gMSAtIGRpc3RhbmNlIC8gbWF4TGVuXG4gIHJldHVybiBzaW1pbGFyaXR5XG59XG5cbmV4cG9ydCBjb25zdCBjaGVja1N0cmluZ0lzU2ltaWxhciA9IChiYXNlOiBzdHJpbmcsIHN0cmluZ1RvQ29tcGFyZTogc3RyaW5nLCB0aHJlc2hvbGQ6IG51bWJlciA9IDAuOCwgY2FzZUluc2Vuc2l0aXZlOiBib29sZWFuID0gdHJ1ZSk6IGJvb2xlYW4gPT4ge1xuICByZXR1cm4gY2hlY2tTdHJpbmdTaW1pbGFyaXR5KGJhc2UsIHN0cmluZ1RvQ29tcGFyZSwgY2FzZUluc2Vuc2l0aXZlKSA+PSB0aHJlc2hvbGRcbn1cblxuZXhwb3J0IGNvbnN0IGVuc3VyZVN0YXJ0c1dpdGhVcHBlckNhc2UgPSAoc3RyID0gJycpID0+IHtcbiAgaWYgKCFzdHIpIHJldHVybiAnJ1xuICBjb25zdCB0cmltbWVkU3RhcnQgPSBzdHIudHJpbVN0YXJ0KClcbiAgcmV0dXJuIHN0ci5zbGljZSgwLCBzdHIubGVuZ3RoIC0gdHJpbW1lZFN0YXJ0Lmxlbmd0aCkgKyB0cmltbWVkU3RhcnRbMF0udG9VcHBlckNhc2UoKSArIHRyaW1tZWRTdGFydC5zbGljZSgxKVxufVxuXG5leHBvcnQgY29uc3QgdHJ1bmNhdGVUZXh0ID0gKHRleHQ6IHN0cmluZyA9ICcnLCBtYXg6IG51bWJlciA9IDQwKSA9PiB7XG4gIHRyeSB7XG4gICAgaWYoIXRleHQpIHJldHVybiAnJ1xuICAgIGlmKG1heCA8PSAwKSByZXR1cm4gdGV4dCArICcuLi4nXG4gICAgcmV0dXJuIHRleHQubGVuZ3RoID4gbWF4ID8gYCR7dGV4dC5zdWJzdHJpbmcoMCwgbWF4KX0uLi5gIDogdGV4dFxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiB0ZXh0IHx8ICcnXG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBTaW1pbGFyU2VhcmNoT3B0aW9ucyB7XG4gIHRocmVzaG9sZD86IG51bWJlcjtcbiAgY2FzZUluc2Vuc2l0aXZlPzogYm9vbGVhbjtcbiAgc3BsaXRXb3Jkcz86IGJvb2xlYW47XG4gIHNlYXJjaEtleXM/OiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGNvbnN0IGZpbmRTaW1pbGFySXRlbXMgPSA8VD4oXG4gIGl0ZW1zOiBUW10sXG4gIHNlYXJjaFRleHQ6IHN0cmluZyxcbiAgb3B0aW9uczogU2ltaWxhclNlYXJjaE9wdGlvbnMgPSB7fVxuKTogVFtdID0+IHtcbiAgY29uc3Qge1xuICAgIHRocmVzaG9sZDogdXNlclRocmVzaG9sZCxcbiAgICBjYXNlSW5zZW5zaXRpdmUgPSB0cnVlLFxuICAgIHNwbGl0V29yZHMgPSBmYWxzZSxcbiAgICBzZWFyY2hLZXlzID0gW11cbiAgfSA9IG9wdGlvbnM7XG5cbiAgLy8gVXNlIGEgbG93ZXIgdGhyZXNob2xkIGZvciBzcGxpdCB3b3JkcyB0byBhbGxvdyBtb3JlIGZ1enp5IG1hdGNoZXMgb2YgaW5kaXZpZHVhbCB3b3Jkc1xuICAvLyBVc2UgYSBoaWdoZXIgdGhyZXNob2xkIGZvciBleGFjdCBwaHJhc2UgbWF0Y2hpbmcgd2hlbiBzcGxpdFdvcmRzIGlzIGZhbHNlXG4gIGNvbnN0IHRocmVzaG9sZCA9IHVzZXJUaHJlc2hvbGQgPz8gKHNwbGl0V29yZHMgPyAwLjUgOiAwLjgpO1xuXG4gIGlmICghc2VhcmNoVGV4dCkgcmV0dXJuIFtdO1xuXG4gIGNvbnN0IHNlYXJjaFRlcm1zID0gc3BsaXRXb3JkcyBcbiAgICA/IHNlYXJjaFRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodGVybSA9PiB0ZXJtLmxlbmd0aCA+IDApIFxuICAgIDogW3NlYXJjaFRleHRdO1xuXG4gIHJldHVybiBpdGVtcy5maWx0ZXIoaXRlbSA9PiB7XG4gICAgaWYgKGl0ZW0gPT09IG51bGwgfHwgaXRlbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHN0cmluZyBpdGVtc1xuICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChzcGxpdFdvcmRzKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1Xb3JkcyA9IGl0ZW0uc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApO1xuICAgICAgICByZXR1cm4gc2VhcmNoVGVybXMuZXZlcnkoc2VhcmNoVGVybSA9PiBcbiAgICAgICAgICBpdGVtV29yZHMuc29tZSh3b3JkID0+IHtcbiAgICAgICAgICAgIC8vIFRyeSBleGFjdCBzdWJzdHJpbmcgbWF0Y2ggZmlyc3RcbiAgICAgICAgICAgIGlmIChjYXNlSW5zZW5zaXRpdmUpIHtcbiAgICAgICAgICAgICAgaWYgKHdvcmQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAod29yZC5pbmNsdWRlcyhzZWFyY2hUZXJtKSkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoZW4gdHJ5IHNpbWlsYXJpdHkgbWF0Y2hcbiAgICAgICAgICAgIHJldHVybiBjaGVja1N0cmluZ1NpbWlsYXJpdHkod29yZCwgc2VhcmNoVGVybSwgY2FzZUluc2Vuc2l0aXZlKSA+PSB0aHJlc2hvbGQ7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gRm9yIG5vbi1zcGxpdCB3b3Jkc1xuICAgICAgcmV0dXJuIHNlYXJjaFRlcm1zLnNvbWUodGVybSA9PiB7XG4gICAgICAgIC8vIFRyeSBleGFjdCBzdWJzdHJpbmcgbWF0Y2ggZmlyc3RcbiAgICAgICAgaWYgKGNhc2VJbnNlbnNpdGl2ZSkge1xuICAgICAgICAgIGlmIChpdGVtLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXModGVybS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGl0ZW0uaW5jbHVkZXModGVybSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUaGVuIHRyeSBzaW1pbGFyaXR5IG1hdGNoXG4gICAgICAgIHJldHVybiBjaGVja1N0cmluZ1NpbWlsYXJpdHkoaXRlbSwgdGVybSwgY2FzZUluc2Vuc2l0aXZlKSA+PSB0aHJlc2hvbGQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgb2JqZWN0IGl0ZW1zXG4gICAgaWYgKHR5cGVvZiBpdGVtID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHNlYXJjaEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlYXJjaEtleXMuc29tZShrZXkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IChpdGVtIGFzIGFueSlba2V5XTtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb3IgZWFjaCBzZWFyY2ggdGVybVxuICAgICAgICByZXR1cm4gc2VhcmNoVGVybXMuZXZlcnkoc2VhcmNoVGVybSA9PiB7XG4gICAgICAgICAgLy8gQWx3YXlzIHRyeSBmdWxsIHZhbHVlIHNpbWlsYXJpdHkgZmlyc3RcbiAgICAgICAgICBpZiAoY2hlY2tTdHJpbmdTaW1pbGFyaXR5KHZhbHVlLCBzZWFyY2hUZXJtLCBjYXNlSW5zZW5zaXRpdmUpID49IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVHJ5IGV4YWN0IHN1YnN0cmluZyBtYXRjaFxuICAgICAgICAgIGlmIChjYXNlSW5zZW5zaXRpdmUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS5pbmNsdWRlcyhzZWFyY2hUZXJtKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgc3BsaXR0aW5nIHdvcmRzLCB0cnkgaW5kaXZpZHVhbCB3b3JkIG1hdGNoZXNcbiAgICAgICAgICBpZiAoc3BsaXRXb3Jkcykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWVXb3JkcyA9IHZhbHVlLnNwbGl0KC9cXHMrLykuZmlsdGVyKHcgPT4gdy5sZW5ndGggPiAwKTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVdvcmRzLnNvbWUod29yZCA9PiB7XG4gICAgICAgICAgICAgIC8vIFRyeSBleGFjdCBtYXRjaCBmaXJzdFxuICAgICAgICAgICAgICBpZiAoY2FzZUluc2Vuc2l0aXZlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHdvcmQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAod29yZC5pbmNsdWRlcyhzZWFyY2hUZXJtKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFRoZW4gdHJ5IHNpbWlsYXJpdHkgbWF0Y2ggb24gaW5kaXZpZHVhbCB3b3Jkc1xuICAgICAgICAgICAgICByZXR1cm4gY2hlY2tTdHJpbmdTaW1pbGFyaXR5KHdvcmQsIHNlYXJjaFRlcm0sIGNhc2VJbnNlbnNpdGl2ZSkgPj0gdGhyZXNob2xkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgdGl0bGVDYXNlVG9TbmFrZUNhc2UgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16MC05XSkoW0EtWl0pL2csICckMV8kMicpLnRvTG93ZXJDYXNlKClcbn1cblxuZXhwb3J0IGNvbnN0IFN0cmluZ0hlbHBlcnMgPSB7XG4gIHRpdGxlQ2FzZVN0cmluZyxcbiAgcmFuZG9tU3RyaW5nLFxuICBqb2luQ29tbWFQbHVzQW5kLFxuICBjaGVja1N0cmluZ1NpbWlsYXJpdHksXG4gIGNoZWNrU3RyaW5nSXNTaW1pbGFyLFxuICBlbnN1cmVTdGFydHNXaXRoVXBwZXJDYXNlLFxuICB0cnVuY2F0ZVRleHQsXG4gIGZpbmRTaW1pbGFySXRlbXMsXG4gIHRpdGxlQ2FzZVRvU25ha2VDYXNlLFxufSIsIlxuZXhwb3J0IGNvbnN0IGV4dHJhY3RNYXRjaHMgPSAodGV4dDogc3RyaW5nLCByZWdleDogUmVnRXhwKTogQXJyYXk8c3RyaW5nPiA9PiB7XG4gIGNvbnN0IG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKHJlZ2V4KSB8fCBbXVxuICByZXR1cm4gWy4uLm5ldyBTZXQobWF0Y2hlcyldXG59XG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VXVpZHNWNCA9ICh0ZXh0OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+ID0+IHtcbiAgY29uc3QgcmVnZXggPSAvW2EtZkEtRjAtOV17OH0tW2EtZkEtRjAtOV17NH0tNFthLWZBLUYwLTldezN9LVthLWZBLUYwLTldezR9LVthLWZBLUYwLTldezEyfS9nXG4gIHJldHVybiBleHRyYWN0TWF0Y2hzKHRleHQsIHJlZ2V4KVxufVxuXG5leHBvcnQgY29uc3QgUmVnZXhIZWxwZXJzID0ge1xuICBleHRyYWN0TWF0Y2hzLFxuICBleHRyYWN0VXVpZHNWNFxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1hc2tpdCAodmFsdWU6IHN0cmluZyB8IG51bGwsIG1hc2s6IGFueSwgbWFza2VkID0gdHJ1ZSwgdG9rZW5zOiBhbnkpIHtcbiAgdmFsdWUgPSB2YWx1ZSB8fCAnJ1xuICBtYXNrID0gbWFzayB8fCAnJ1xuICBsZXQgaU1hc2sgPSAwXG4gIGxldCBpVmFsdWUgPSAwXG4gIGxldCBvdXRwdXQgPSAnJ1xuICB3aGlsZSAoaU1hc2sgPCBtYXNrLmxlbmd0aCAmJiBpVmFsdWUgPCB2YWx1ZS5sZW5ndGgpIHtcbiAgICB2YXIgY01hc2sgPSBtYXNrW2lNYXNrXVxuICAgIGNvbnN0IG1hc2tlciA9IHRva2Vuc1tjTWFza11cbiAgICBjb25zdCBjVmFsdWUgPSB2YWx1ZVtpVmFsdWVdXG4gICAgaWYgKG1hc2tlciAmJiAhbWFza2VyLmVzY2FwZSkge1xuICAgICAgaWYgKG1hc2tlci5wYXR0ZXJuLnRlc3QoY1ZhbHVlKSkge1xuICAgICAgXHRvdXRwdXQgKz0gbWFza2VyLnRyYW5zZm9ybSA/IG1hc2tlci50cmFuc2Zvcm0oY1ZhbHVlKSA6IGNWYWx1ZVxuICAgICAgICBpTWFzaysrXG4gICAgICB9XG4gICAgICBpVmFsdWUrK1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWFza2VyICYmIG1hc2tlci5lc2NhcGUpIHtcbiAgICAgICAgaU1hc2srKyAvLyB0YWtlIHRoZSBuZXh0IG1hc2sgY2hhciBhbmQgdHJlYXQgaXQgYXMgY2hhclxuICAgICAgICBjTWFzayA9IG1hc2tbaU1hc2tdXG4gICAgICB9XG4gICAgICBpZiAobWFza2VkKSBvdXRwdXQgKz0gY01hc2tcbiAgICAgIGlmIChjVmFsdWUgPT09IGNNYXNrKSBpVmFsdWUrKyAvLyB1c2VyIHR5cGVkIHRoZSBzYW1lIGNoYXJcbiAgICAgIGlNYXNrKytcbiAgICB9XG4gIH1cblxuICAvLyBmaXggbWFzayB0aGF0IGVuZHMgd2l0aCBhIGNoYXI6ICgjKVxuICBsZXQgcmVzdE91dHB1dCA9ICcnXG4gIHdoaWxlIChpTWFzayA8IG1hc2subGVuZ3RoICYmIG1hc2tlZCkge1xuICAgIHZhciBjTWFzayA9IG1hc2tbaU1hc2tdXG4gICAgaWYgKHRva2Vuc1tjTWFza10pIHtcbiAgICAgIHJlc3RPdXRwdXQgPSAnJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gICAgcmVzdE91dHB1dCArPSBjTWFza1xuICAgIGlNYXNrKytcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQgKyByZXN0T3V0cHV0XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZHluYW1pY01hc2sgKG1hc2tpdDogYW55LCBtYXNrczogYW55W10sIHRva2VuczogYW55KTogYW55IHtcbiAgbWFza3MgPSBtYXNrcy5zb3J0KChhLCBiKSA9PiBhLmxlbmd0aCAtIGIubGVuZ3RoKVxuICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlOiBhbnksIG1hc2s6IGFueSwgbWFza2VkID0gdHJ1ZSkge1xuICAgIHZhciBpID0gMFxuICAgIHdoaWxlIChpIDwgbWFza3MubGVuZ3RoKSB7XG4gICAgICB2YXIgY3VycmVudE1hc2sgPSBtYXNrc1tpXVxuICAgICAgaSsrXG4gICAgICB2YXIgbmV4dE1hc2sgPSBtYXNrc1tpXVxuICAgICAgaWYgKCEgKG5leHRNYXNrICYmIG1hc2tpdCh2YWx1ZSwgbmV4dE1hc2ssIHRydWUsIHRva2VucykubGVuZ3RoID4gY3VycmVudE1hc2subGVuZ3RoKSApIHtcbiAgICAgICAgcmV0dXJuIG1hc2tpdCh2YWx1ZSwgY3VycmVudE1hc2ssIG1hc2tlZCwgdG9rZW5zKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gJydcbiAgfVxufSIsImV4cG9ydCBkZWZhdWx0IHtcbiAgJyMnOiB7IHBhdHRlcm46IC9cXGQvIH0sXG4gIFg6IHsgcGF0dGVybjogL1swLTlhLXpBLVpdLyB9LFxuICBTOiB7IHBhdHRlcm46IC9bYS16QS1aXS8gfSxcbiAgQTogeyBwYXR0ZXJuOiAvW2EtekEtWl0vLCB0cmFuc2Zvcm06ICh2OiBzdHJpbmcpID0+IHYudG9Mb2NhbGVVcHBlckNhc2UoKSB9LFxuICBhOiB7IHBhdHRlcm46IC9bYS16QS1aXS8sIHRyYW5zZm9ybTogKHY6IHN0cmluZykgPT4gdi50b0xvY2FsZUxvd2VyQ2FzZSgpIH0sXG4gICchJzogeyBlc2NhcGU6IHRydWUgfVxufSIsImltcG9ydCBtYXNraXQgZnJvbSAnLi9tYXNraXQnXG5pbXBvcnQgZHluYW1pY01hc2sgZnJvbSAnLi9keW5hbWljLW1hc2snXG5pbXBvcnQgdG9rZW5zIGZyb20gJy4vdG9rZW5zJ1xuXG5leHBvcnQgY29uc3QgbWFza2VyID0gZnVuY3Rpb24gKHZhbHVlOiBhbnksIG1hc2s6IGFueSwgbWFza2VkID0gdHJ1ZSkge1xuXG4gIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICBcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkobWFzaylcbiAgICA/IGR5bmFtaWNNYXNrKG1hc2tpdCwgbWFzaywgdG9rZW5zKSh2YWx1ZSwgbWFzaywgbWFza2VkLCB0b2tlbnMpXG4gICAgOiBtYXNraXQodmFsdWUsIG1hc2ssIG1hc2tlZCwgdG9rZW5zKVxuICAgIFxufSIsIlxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUEhPTkVfRERJID0gWycrIyMjJywgJysjIycsICcrIycsICcrIy0jIyMnXVxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUEhPTkVfTUFTSyA9IFsnKCMjKSAjIyMjIy0jIyMjJywgJygjIykgIyMjIy0jIyMjJ11cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BIT05FX01BU0tfV0lUSF9EREkgPSBbJysjIyAjIyMgIyMgIyMgIyMnLCAnKyMgKCMjIykgIyMjLSMjIyMnLCAnKyMjICgjIykgIyMjIy0jIyMjJywgJysjIyAoIyMpICMjIyMjLSMjIyMnLCBdIiwiaW1wb3J0IHsgbWFza2VyIH0gZnJvbSAnLi9tYXNrL21hc2tlcidcbmltcG9ydCB7IERFRkFVTFRfUEhPTkVfRERJLCBERUZBVUxUX1BIT05FX01BU0ssIERFRkFVTFRfUEhPTkVfTUFTS19XSVRIX0RESX0gZnJvbSAnLi9tYXNrL2VudW1zJ1xuXG4vLyBQaG9uZSBudW1iZXIgZm9ybWF0cyBieSBjb3VudHJ5XG5pbnRlcmZhY2UgUGhvbmVGb3JtYXRDb25maWcge1xuICBjb3VudHJ5Q29kZTogc3RyaW5nO1xuICBtYXNrOiBzdHJpbmcgfCBzdHJpbmdbXTtcbiAgZGlnaXRDb3VudDogbnVtYmVyIHwgbnVtYmVyW107XG59XG5cbmNvbnN0IFBIT05FX0ZPUk1BVFM6IFJlY29yZDxzdHJpbmcsIFBob25lRm9ybWF0Q29uZmlnPiA9IHtcbiAgYnJhemlsOiB7IFxuICAgIGNvdW50cnlDb2RlOiAnKzU1JywgXG4gICAgbWFzazogWycoIyMpICMjIyMjLSMjIyMnLCAnKCMjKSAjIyMjLSMjIyMnXSwgXG4gICAgZGlnaXRDb3VudDogWzExLCAxMF0gXG4gIH0sXG4gIHVzOiB7IGNvdW50cnlDb2RlOiAnKzEnLCBtYXNrOiAnKCMjIykgIyMjLSMjIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICB1c2E6IHsgY291bnRyeUNvZGU6ICcrMScsIG1hc2s6ICcoIyMjKSAjIyMtIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIHNwYWluOiB7IGNvdW50cnlDb2RlOiAnKzM0JywgbWFzazogJyMjIyAjIyMgIyMjJywgZGlnaXRDb3VudDogOSB9LFxuICBwb3J0dWdhbDogeyBjb3VudHJ5Q29kZTogJyszNTEnLCBtYXNrOiAnIyMjICMjIyAjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIGFyZ2VudGluYTogeyBjb3VudHJ5Q29kZTogJys1NCcsIG1hc2s6ICcoIyMpICMjIyMtIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIGl0YWx5OiB7IGNvdW50cnlDb2RlOiAnKzM5JywgbWFzazogJyMjIyAjIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIHN3aXR6ZXJsYW5kOiB7IGNvdW50cnlDb2RlOiAnKzQxJywgbWFzazogJyMjICMjIyAjIyAjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgc3dpc3M6IHsgY291bnRyeUNvZGU6ICcrNDEnLCBtYXNrOiAnIyMgIyMjICMjICMjJywgZGlnaXRDb3VudDogOSB9LFxuICBmcmFuY2U6IHsgY291bnRyeUNvZGU6ICcrMzMnLCBtYXNrOiAnIyAjIyAjIyAjIyAjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgY2hpbmE6IHsgY291bnRyeUNvZGU6ICcrODYnLCBtYXNrOiAnIyMjICMjIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDExIH0sXG4gIHJ1c3NpYTogeyBjb3VudHJ5Q29kZTogJys3JywgbWFzazogJygjIyMpICMjIy0jIy0jIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIGNhbmFkYTogeyBjb3VudHJ5Q29kZTogJysxJywgbWFzazogJygjIyMpICMjIy0jIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAgbWV4aWNvOiB7IGNvdW50cnlDb2RlOiAnKzUyJywgbWFzazogJygjIykgIyMjIy0jIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAgY2hpbGU6IHsgY291bnRyeUNvZGU6ICcrNTYnLCBtYXNrOiAnIyAjIyMjICMjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIC8vIE1ham9yIEV1cm9wZWFuIGNvdW50cmllc1xuICBnZXJtYW55OiB7IGNvdW50cnlDb2RlOiAnKzQ5JywgbWFzazogJyMjIyMgIyMjIyMjIyMnLCBkaWdpdENvdW50OiAxMSB9LFxuICB1azogeyBjb3VudHJ5Q29kZTogJys0NCcsIG1hc2s6ICcjIyMjICMjIyAjIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAgdW5pdGVka2luZ2RvbTogeyBjb3VudHJ5Q29kZTogJys0NCcsIG1hc2s6ICcjIyMjICMjIyAjIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAgbmV0aGVybGFuZHM6IHsgY291bnRyeUNvZGU6ICcrMzEnLCBtYXNrOiAnIyAjIyMjIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgYmVsZ2l1bTogeyBjb3VudHJ5Q29kZTogJyszMicsIG1hc2s6ICcjIyMgIyMgIyMgIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIGF1c3RyaWE6IHsgY291bnRyeUNvZGU6ICcrNDMnLCBtYXNrOiAnIyMjICMjIyMjIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICBwb2xhbmQ6IHsgY291bnRyeUNvZGU6ICcrNDgnLCBtYXNrOiAnIyMjICMjIyAjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIHN3ZWRlbjogeyBjb3VudHJ5Q29kZTogJys0NicsIG1hc2s6ICcjIyAjIyMgIyMgIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIG5vcndheTogeyBjb3VudHJ5Q29kZTogJys0NycsIG1hc2s6ICcjIyMgIyMgIyMjJywgZGlnaXRDb3VudDogOCB9LFxuICBkZW5tYXJrOiB7IGNvdW50cnlDb2RlOiAnKzQ1JywgbWFzazogJyMjICMjICMjICMjJywgZGlnaXRDb3VudDogOCB9LFxuICBmaW5sYW5kOiB7IGNvdW50cnlDb2RlOiAnKzM1OCcsIG1hc2s6ICcjIyAjIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgLy8gTWFqb3IgQXNpYW4gY291bnRyaWVzXG4gIGphcGFuOiB7IGNvdW50cnlDb2RlOiAnKzgxJywgbWFzazogJyMjLSMjIyMtIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIHNvdXRoa29yZWE6IHsgY291bnRyeUNvZGU6ICcrODInLCBtYXNrOiAnIyMtIyMjIy0jIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAga29yZWE6IHsgY291bnRyeUNvZGU6ICcrODInLCBtYXNrOiAnIyMtIyMjIy0jIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAgaW5kaWE6IHsgY291bnRyeUNvZGU6ICcrOTEnLCBtYXNrOiAnIyMjIyMgIyMjIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICBzaW5nYXBvcmU6IHsgY291bnRyeUNvZGU6ICcrNjUnLCBtYXNrOiAnIyMjIyAjIyMjJywgZGlnaXRDb3VudDogOCB9LFxuICBtYWxheXNpYTogeyBjb3VudHJ5Q29kZTogJys2MCcsIG1hc2s6ICcjIy0jIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgdGhhaWxhbmQ6IHsgY291bnRyeUNvZGU6ICcrNjYnLCBtYXNrOiAnIyMtIyMjLSMjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIHZpZXRuYW06IHsgY291bnRyeUNvZGU6ICcrODQnLCBtYXNrOiAnIyMtIyMjIyAjIyMjJywgZGlnaXRDb3VudDogOSB9LFxuICBwaGlsaXBwaW5lczogeyBjb3VudHJ5Q29kZTogJys2MycsIG1hc2s6ICcjIyMtIyMjLSMjIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICBpbmRvbmVzaWE6IHsgY291bnRyeUNvZGU6ICcrNjInLCBtYXNrOiAnIyMtIyMjIy0jIyMjJywgZGlnaXRDb3VudDogMTAgfSxcbiAgLy8gTWFqb3IgY291bnRyaWVzIGluIEFtZXJpY2FzXG4gIGNvbG9tYmlhOiB7IGNvdW50cnlDb2RlOiAnKzU3JywgbWFzazogJyMjIyAjIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIHZlbmV6dWVsYTogeyBjb3VudHJ5Q29kZTogJys1OCcsIG1hc2s6ICcjIyMtIyMjIyMjIycsIGRpZ2l0Q291bnQ6IDEwIH0sXG4gIHBlcnU6IHsgY291bnRyeUNvZGU6ICcrNTEnLCBtYXNrOiAnIyMjICMjIyAjIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIGVjdWFkb3I6IHsgY291bnRyeUNvZGU6ICcrNTkzJywgbWFzazogJyMjLSMjIyAjIyMjJywgZGlnaXRDb3VudDogOSB9LFxuICB1cnVndWF5OiB7IGNvdW50cnlDb2RlOiAnKzU5OCcsIG1hc2s6ICcjIyAjIyMgIyMjJywgZGlnaXRDb3VudDogOCB9LFxuICBwYXJhZ3VheTogeyBjb3VudHJ5Q29kZTogJys1OTUnLCBtYXNrOiAnIyMjICMjIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgYm9saXZpYTogeyBjb3VudHJ5Q29kZTogJys1OTEnLCBtYXNrOiAnIyMjIyMjIyMnLCBkaWdpdENvdW50OiA4IH0sXG4gIC8vIE1ham9yIEFmcmljYW4gY291bnRyaWVzXG4gIHNvdXRoYWZyaWNhOiB7IGNvdW50cnlDb2RlOiAnKzI3JywgbWFzazogJyMjICMjIyAjIyMjJywgZGlnaXRDb3VudDogOSB9LFxuICBuaWdlcmlhOiB7IGNvdW50cnlDb2RlOiAnKzIzNCcsIG1hc2s6ICcjIyMgIyMjICMjIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICBlZ3lwdDogeyBjb3VudHJ5Q29kZTogJysyMCcsIG1hc2s6ICcjIyMgIyMjICMjIyMnLCBkaWdpdENvdW50OiAxMCB9LFxuICBtb3JvY2NvOiB7IGNvdW50cnlDb2RlOiAnKzIxMicsIG1hc2s6ICcjIyMtIyMjIyMjJywgZGlnaXRDb3VudDogOSB9LFxuICBhbGdlcmlhOiB7IGNvdW50cnlDb2RlOiAnKzIxMycsIG1hc2s6ICcjIyMgIyMgIyMgIyMnLCBkaWdpdENvdW50OiA5IH0sXG4gIC8vIE1ham9yIE9jZWFuaWEgY291bnRyaWVzXG4gIGF1c3RyYWxpYTogeyBjb3VudHJ5Q29kZTogJys2MScsIG1hc2s6ICcjIyMgIyMjICMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgbmV3emVhbGFuZDogeyBjb3VudHJ5Q29kZTogJys2NCcsIG1hc2s6ICcjIy0jIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgLy8gTWlkZGxlIEVhc3RcbiAgaXNyYWVsOiB7IGNvdW50cnlDb2RlOiAnKzk3MicsIG1hc2s6ICcjIy0jIyMtIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgdWFlOiB7IGNvdW50cnlDb2RlOiAnKzk3MScsIG1hc2s6ICcjIy0jIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgdW5pdGVkYXJhYmVtaXJhdGVzOiB7IGNvdW50cnlDb2RlOiAnKzk3MScsIG1hc2s6ICcjIy0jIyMgIyMjIycsIGRpZ2l0Q291bnQ6IDkgfSxcbiAgc2F1ZGlhcmFiaWE6IHsgY291bnRyeUNvZGU6ICcrOTY2JywgbWFzazogJyMjLSMjIy0jIyMjJywgZGlnaXRDb3VudDogOSB9LFxuICB0dXJrZXk6IHsgY291bnRyeUNvZGU6ICcrOTAnLCBtYXNrOiAnIyMjICMjIyAjIyAjIycsIGRpZ2l0Q291bnQ6IDEwIH1cbn07XG5cbi8vIENvdW50cnkgY29kZSB0byBjb3VudHJ5IG1hcHBpbmcgZm9yIHByZWRpY3Rpb25cbmNvbnN0IENPVU5UUllfQ09ERV9NQVA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcxJzogJ3VzJywgICAgICAvLyBVUy9DYW5hZGEgKHdlJ2xsIGRlZmF1bHQgdG8gVVMpXG4gICc3JzogJ3J1c3NpYScsICAvLyBSdXNzaWEvS2F6YWtoc3RhblxuICAnMjAnOiAnZWd5cHQnLFxuICAnMjcnOiAnc291dGhhZnJpY2EnLFxuICAnMzEnOiAnbmV0aGVybGFuZHMnLFxuICAnMzInOiAnYmVsZ2l1bScsXG4gICczMyc6ICdmcmFuY2UnLFxuICAnMzQnOiAnc3BhaW4nLFxuICAnMzknOiAnaXRhbHknLFxuICAnNDEnOiAnc3dpdHplcmxhbmQnLFxuICAnNDMnOiAnYXVzdHJpYScsXG4gICc0NCc6ICd1aycsXG4gICc0NSc6ICdkZW5tYXJrJyxcbiAgJzQ2JzogJ3N3ZWRlbicsXG4gICc0Nyc6ICdub3J3YXknLFxuICAnNDgnOiAncG9sYW5kJyxcbiAgJzQ5JzogJ2dlcm1hbnknLFxuICAnNTEnOiAncGVydScsXG4gICc1Mic6ICdtZXhpY28nLFxuICAnNTQnOiAnYXJnZW50aW5hJyxcbiAgJzU1JzogJ2JyYXppbCcsXG4gICc1Nic6ICdjaGlsZScsXG4gICc1Nyc6ICdjb2xvbWJpYScsXG4gICc1OCc6ICd2ZW5lenVlbGEnLFxuICAnNjAnOiAnbWFsYXlzaWEnLFxuICAnNjEnOiAnYXVzdHJhbGlhJyxcbiAgJzYyJzogJ2luZG9uZXNpYScsXG4gICc2Myc6ICdwaGlsaXBwaW5lcycsXG4gICc2NCc6ICduZXd6ZWFsYW5kJyxcbiAgJzY1JzogJ3NpbmdhcG9yZScsXG4gICc2Nic6ICd0aGFpbGFuZCcsXG4gICc4MSc6ICdqYXBhbicsXG4gICc4Mic6ICdzb3V0aGtvcmVhJyxcbiAgJzg0JzogJ3ZpZXRuYW0nLFxuICAnODYnOiAnY2hpbmEnLFxuICAnOTAnOiAndHVya2V5JyxcbiAgJzkxJzogJ2luZGlhJyxcbiAgJzIxMic6ICdtb3JvY2NvJyxcbiAgJzIxMyc6ICdhbGdlcmlhJyxcbiAgJzIzNCc6ICduaWdlcmlhJyxcbiAgJzM1MSc6ICdwb3J0dWdhbCcsXG4gICczNTgnOiAnZmlubGFuZCcsXG4gICc1OTEnOiAnYm9saXZpYScsXG4gICc1OTMnOiAnZWN1YWRvcicsXG4gICc1OTUnOiAncGFyYWd1YXknLFxuICAnNTk4JzogJ3VydWd1YXknLFxuICAnOTY2JzogJ3NhdWRpYXJhYmlhJyxcbiAgJzk3MSc6ICd1YWUnLFxuICAnOTcyJzogJ2lzcmFlbCdcbn07XG5cbi8qKlxuICogUHJlZGljdHMgdGhlIGNvdW50cnkgYmFzZWQgb24gdGhlIHBob25lIG51bWJlcidzIGNvdW50cnkgY29kZVxuICogQHBhcmFtIHBob25lTnVtYmVyIC0gVGhlIHBob25lIG51bWJlciB0byBhbmFseXplXG4gKiBAcmV0dXJucyBUaGUgcHJlZGljdGVkIGNvdW50cnkgbmFtZSBvciBudWxsIGlmIG5vdCBmb3VuZFxuICovXG5jb25zdCBwcmVkaWN0Q291bnRyeUZyb21QaG9uZU51bWJlciA9IChwaG9uZU51bWJlcjogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCA9PiB7XG4gIGlmICghcGhvbmVOdW1iZXIpIHJldHVybiBudWxsO1xuICBcbiAgLy8gUmVtb3ZlIGFsbCBub24tbnVtZXJpYyBjaGFyYWN0ZXJzXG4gIGNvbnN0IGNsZWFuTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvXFxEL2csICcnKTtcbiAgXG4gIC8vIE11c3QgaGF2ZSBhdCBsZWFzdCAxMCBkaWdpdHMgKG1pbmltdW0gaW50ZXJuYXRpb25hbCBudW1iZXIgbGVuZ3RoIHdpdGggY291bnRyeSBjb2RlKVxuICBpZiAoY2xlYW5OdW1iZXIubGVuZ3RoIDwgMTApIHJldHVybiBudWxsO1xuICBcbiAgLy8gQ2hlY2sgZm9yIGNvdW50cnkgY29kZXMgc3RhcnRpbmcgZnJvbSBsb25nZXN0IHRvIHNob3J0ZXN0XG4gIGNvbnN0IHNvcnRlZENvdW50cnlDb2RlcyA9IE9iamVjdC5rZXlzKENPVU5UUllfQ09ERV9NQVApLnNvcnQoKGEsIGIpID0+IGIubGVuZ3RoIC0gYS5sZW5ndGgpO1xuICBcbiAgZm9yIChjb25zdCBjb3VudHJ5Q29kZSBvZiBzb3J0ZWRDb3VudHJ5Q29kZXMpIHtcbiAgICBpZiAoY2xlYW5OdW1iZXIuc3RhcnRzV2l0aChjb3VudHJ5Q29kZSkpIHtcbiAgICAgIC8vIEFkZGl0aW9uYWwgdmFsaWRhdGlvbjogY2hlY2sgaWYgdGhlIG51bWJlciBhZnRlciByZW1vdmluZyBjb3VudHJ5IGNvZGVcbiAgICAgIC8vIGhhcyBhIHJlYXNvbmFibGUgbGVuZ3RoIGZvciB0aGF0IGNvdW50cnlcbiAgICAgIGNvbnN0IHJlbWFpbmluZ0RpZ2l0cyA9IGNsZWFuTnVtYmVyLnNsaWNlKGNvdW50cnlDb2RlLmxlbmd0aCk7XG4gICAgICBjb25zdCBjb3VudHJ5TmFtZSA9IENPVU5UUllfQ09ERV9NQVBbY291bnRyeUNvZGVdO1xuICAgICAgY29uc3QgY29uZmlnID0gUEhPTkVfRk9STUFUU1tjb3VudHJ5TmFtZV07XG4gICAgICBcbiAgICAgIGlmIChjb25maWcpIHtcbiAgICAgICAgY29uc3QgZXhwZWN0ZWRDb3VudHMgPSBBcnJheS5pc0FycmF5KGNvbmZpZy5kaWdpdENvdW50KSA/IGNvbmZpZy5kaWdpdENvdW50IDogW2NvbmZpZy5kaWdpdENvdW50XTtcbiAgICAgICAgaWYgKGV4cGVjdGVkQ291bnRzLmluY2x1ZGVzKHJlbWFpbmluZ0RpZ2l0cy5sZW5ndGgpKSB7XG4gICAgICAgICAgLy8gRm9yIHNpbmdsZS1kaWdpdCBjb3VudHJ5IGNvZGVzIGxpa2UgXCIxXCIgb3IgXCI3XCIsIGJlIG1vcmUgc3RyaWN0XG4gICAgICAgICAgLy8gT25seSBhY2NlcHQgaWYgdGhlIHRvdGFsIGxlbmd0aCBpcyByZWFzb25hYmxlIGZvciBpbnRlcm5hdGlvbmFsIGZvcm1hdFxuICAgICAgICAgIGlmIChjb3VudHJ5Q29kZS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIC8vIEZvciBVUy9DYW5hZGEgKCsxKSwgdG90YWwgc2hvdWxkIGJlIDExIGRpZ2l0cyBtaW5pbXVtICgxICsgMTApXG4gICAgICAgICAgICAvLyBGb3IgUnVzc2lhICgrNyksIHRvdGFsIHNob3VsZCBiZSAxMSBkaWdpdHMgbWluaW11bSAoNyArIDEwKVxuICAgICAgICAgICAgY29uc3QgdG90YWxMZW5ndGggPSBjbGVhbk51bWJlci5sZW5ndGg7XG4gICAgICAgICAgICBpZiAoY291bnRyeUNvZGUgPT09ICcxJyAmJiB0b3RhbExlbmd0aCA9PT0gMTEgJiYgcmVtYWluaW5nRGlnaXRzLmxlbmd0aCA9PT0gMTApIHtcbiAgICAgICAgICAgICAgLy8gQWRkaXRpb25hbCBjaGVjayBmb3IgVVMvQ2FuYWRhOiBhcmVhIGNvZGUgc2hvdWxkbid0IHN0YXJ0IHdpdGggMCBvciAxXG4gICAgICAgICAgICAgIGNvbnN0IGFyZWFDb2RlID0gcmVtYWluaW5nRGlnaXRzLnN1YnN0cmluZygwLCAzKTtcbiAgICAgICAgICAgICAgaWYgKGFyZWFDb2RlWzBdICE9PSAnMCcgJiYgYXJlYUNvZGVbMF0gIT09ICcxJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb3VudHJ5TmFtZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjb3VudHJ5Q29kZSA9PT0gJzcnICYmIHRvdGFsTGVuZ3RoID09PSAxMSAmJiByZW1haW5pbmdEaWdpdHMubGVuZ3RoID09PSAxMCkge1xuICAgICAgICAgICAgICByZXR1cm4gY291bnRyeU5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZvciBtdWx0aS1kaWdpdCBjb3VudHJ5IGNvZGVzLCB1c2Ugbm9ybWFsIHZhbGlkYXRpb25cbiAgICAgICAgICAgIHJldHVybiBjb3VudHJ5TmFtZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBGb3JtYXRzIGEgcGhvbmUgbnVtYmVyIHdpdGggY291bnRyeSBjb2RlIGJhc2VkIG9uIHRoZSBzcGVjaWZpZWQgY291bnRyeVxuICogQHBhcmFtIHBob25lTnVtYmVyIC0gVGhlIHBob25lIG51bWJlciB0byBmb3JtYXQgKGRpZ2l0cyBvbmx5KVxuICogQHBhcmFtIGNvdW50cnkgLSBUaGUgY291bnRyeSBjb2RlIChlLmcuLCAnYnJhemlsJywgJ3VzJywgJ3NwYWluJykgLSBvcHRpb25hbCwgd2lsbCBiZSBwcmVkaWN0ZWQgaWYgbm90IHByb3ZpZGVkXG4gKiBAcGFyYW0gdGhyb3dzRXJyb3JPblZhbGlkYXRpb24gLSBXaGV0aGVyIHRvIHRocm93IGVycm9ycyBvbiB2YWxpZGF0aW9uIGZhaWx1cmVzIChkZWZhdWx0OiBmYWxzZSlcbiAqIEByZXR1cm5zIEZvcm1hdHRlZCBwaG9uZSBudW1iZXIgd2l0aCBjb3VudHJ5IGNvZGVcbiAqL1xuZXhwb3J0IGNvbnN0IGZvcm1hdFBob25lV2l0aENvdW50cnlDb2RlID0gKHBob25lTnVtYmVyOiBzdHJpbmcsIGNvdW50cnk/OiBzdHJpbmcsIHRocm93c0Vycm9yT25WYWxpZGF0aW9uOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcgPT4ge1xuICBpZiAoIXBob25lTnVtYmVyKSB7XG4gICAgaWYgKHRocm93c0Vycm9yT25WYWxpZGF0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Bob25lIG51bWJlciBpcyByZXF1aXJlZCcpO1xuICAgIH1cbiAgICByZXR1cm4gbWFza2VyKHBob25lTnVtYmVyLCBERUZBVUxUX1BIT05FX01BU0tfV0lUSF9EREksIHRydWUpO1xuICB9XG5cbiAgLy8gSWYgbm8gY291bnRyeSBpcyBwcm92aWRlZCwgdHJ5IHRvIHByZWRpY3QgaXQgZnJvbSB0aGUgcGhvbmUgbnVtYmVyXG4gIGxldCBmaW5hbENvdW50cnkgPSBjb3VudHJ5O1xuICBpZiAoIWZpbmFsQ291bnRyeSkge1xuICAgIGNvbnN0IHByZWRpY3RlZENvdW50cnkgPSBwcmVkaWN0Q291bnRyeUZyb21QaG9uZU51bWJlcihwaG9uZU51bWJlcik7XG4gICAgaWYgKHByZWRpY3RlZENvdW50cnkpIHtcbiAgICAgIGZpbmFsQ291bnRyeSA9IHByZWRpY3RlZENvdW50cnk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aHJvd3NFcnJvck9uVmFsaWRhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBwcmVkaWN0IGNvdW50cnkgZnJvbSBwaG9uZSBudW1iZXIgYW5kIG5vIGNvdW50cnkgd2FzIHByb3ZpZGVkJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFza2VyKHBob25lTnVtYmVyLCBERUZBVUxUX1BIT05FX01BU0tfV0lUSF9EREksIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGNvdW50cnlLZXkgPSBmaW5hbENvdW50cnkudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgY29uZmlnID0gUEhPTkVfRk9STUFUU1tjb3VudHJ5S2V5XTtcbiAgXG4gIGlmICghY29uZmlnKSB7XG4gICAgaWYgKHRocm93c0Vycm9yT25WYWxpZGF0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdW50cnkgJyR7ZmluYWxDb3VudHJ5fScgaXMgbm90IHN1cHBvcnRlZC4gU3VwcG9ydGVkIGNvdW50cmllczogJHtPYmplY3Qua2V5cyhQSE9ORV9GT1JNQVRTKS5qb2luKCcsICcpfWApO1xuICAgIH1cbiAgICByZXR1cm4gbWFza2VyKHBob25lTnVtYmVyLCBERUZBVUxUX1BIT05FX01BU0tfV0lUSF9EREksIHRydWUpO1xuICB9XG5cbiAgLy8gUmVtb3ZlIGFsbCBub24tbnVtZXJpYyBjaGFyYWN0ZXJzXG4gIGxldCBjbGVhbk51bWJlciA9IHBob25lTnVtYmVyLnJlcGxhY2UoL1xcRC9nLCAnJyk7XG4gIFxuICAvLyBIYW5kbGUgY2FzZXMgd2hlcmUgY291bnRyeSBjb2RlIGlzIGFscmVhZHkgaW5jbHVkZWQgaW4gdGhlIGlucHV0XG4gIGNvbnN0IGNvdW50cnlDb2RlRGlnaXRzID0gY29uZmlnLmNvdW50cnlDb2RlLnJlcGxhY2UoL1xcRC9nLCAnJyk7XG4gIGlmIChjbGVhbk51bWJlci5zdGFydHNXaXRoKGNvdW50cnlDb2RlRGlnaXRzKSkge1xuICAgIGNsZWFuTnVtYmVyID0gY2xlYW5OdW1iZXIuc2xpY2UoY291bnRyeUNvZGVEaWdpdHMubGVuZ3RoKTtcbiAgfVxuICBcbiAgLy8gSGFuZGxlIG11bHRpcGxlIGZvcm1hdHMgKGxpa2UgQnJhemlsIHdpdGggYm90aCBtb2JpbGUgYW5kIGxhbmRsaW5lKVxuICBpZiAoQXJyYXkuaXNBcnJheShjb25maWcuZGlnaXRDb3VudCkpIHtcbiAgICBjb25zdCB2YWxpZEluZGV4ID0gY29uZmlnLmRpZ2l0Q291bnQuZmluZEluZGV4KChjb3VudDogbnVtYmVyKSA9PiBjbGVhbk51bWJlci5sZW5ndGggPT09IGNvdW50KTtcbiAgICBcbiAgICBpZiAodmFsaWRJbmRleCA9PT0gLTEpIHtcbiAgICAgIGlmICh0aHJvd3NFcnJvck9uVmFsaWRhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBob25lIG51bWJlciBmb3IgJHtmaW5hbENvdW50cnl9IHNob3VsZCBoYXZlICR7Y29uZmlnLmRpZ2l0Q291bnQuam9pbignIG9yICcpfSBkaWdpdHMsIGJ1dCBnb3QgJHtjbGVhbk51bWJlci5sZW5ndGh9YCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFza2VyKHBob25lTnVtYmVyLCBERUZBVUxUX1BIT05FX01BU0tfV0lUSF9EREksIHRydWUpO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCBzZWxlY3RlZE1hc2sgPSBBcnJheS5pc0FycmF5KGNvbmZpZy5tYXNrKSA/IGNvbmZpZy5tYXNrW3ZhbGlkSW5kZXhdIDogY29uZmlnLm1hc2s7XG4gICAgY29uc3QgbWFza2VkTnVtYmVyID0gbWFza2VyKGNsZWFuTnVtYmVyLCBzZWxlY3RlZE1hc2ssIHRydWUpO1xuICAgIHJldHVybiBgJHtjb25maWcuY291bnRyeUNvZGV9ICR7bWFza2VkTnVtYmVyfWA7XG4gIH0gZWxzZSB7XG4gICAgLy8gSGFuZGxlIHNpbmdsZSBmb3JtYXQgY291bnRyaWVzXG4gICAgaWYgKGNsZWFuTnVtYmVyLmxlbmd0aCAhPT0gY29uZmlnLmRpZ2l0Q291bnQpIHtcbiAgICAgIGlmICh0aHJvd3NFcnJvck9uVmFsaWRhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBob25lIG51bWJlciBmb3IgJHtmaW5hbENvdW50cnl9IHNob3VsZCBoYXZlICR7Y29uZmlnLmRpZ2l0Q291bnR9IGRpZ2l0cywgYnV0IGdvdCAke2NsZWFuTnVtYmVyLmxlbmd0aH1gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXNrZXIocGhvbmVOdW1iZXIsIERFRkFVTFRfUEhPTkVfTUFTS19XSVRIX0RESSwgdHJ1ZSk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHNlbGVjdGVkTWFzayA9IEFycmF5LmlzQXJyYXkoY29uZmlnLm1hc2spID8gY29uZmlnLm1hc2tbMF0gOiBjb25maWcubWFzaztcbiAgICBjb25zdCBtYXNrZWROdW1iZXIgPSBtYXNrZXIoY2xlYW5OdW1iZXIsIHNlbGVjdGVkTWFzaywgdHJ1ZSk7XG4gICAgcmV0dXJuIGAke2NvbmZpZy5jb3VudHJ5Q29kZX0gJHttYXNrZWROdW1iZXJ9YDtcbiAgfVxufTtcblxuLyoqXG4gKiBHZXRzIHRoZSBjb3VudHJ5IGNvZGUgZm9yIGEgc3BlY2lmaWMgY291bnRyeVxuICogQHBhcmFtIGNvdW50cnkgLSBUaGUgY291bnRyeSBuYW1lXG4gKiBAcmV0dXJucyBUaGUgY291bnRyeSBjb2RlIChlLmcuLCAnKzU1JyBmb3IgQnJhemlsKVxuICovXG5leHBvcnQgY29uc3QgZ2V0Q291bnRyeUNvZGUgPSAoY291bnRyeTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgY29uc3QgY291bnRyeUtleSA9IGNvdW50cnkudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgY29uZmlnID0gUEhPTkVfRk9STUFUU1tjb3VudHJ5S2V5XTtcbiAgXG4gIGlmICghY29uZmlnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDb3VudHJ5ICcke2NvdW50cnl9JyBpcyBub3Qgc3VwcG9ydGVkLiBTdXBwb3J0ZWQgY291bnRyaWVzOiAke09iamVjdC5rZXlzKFBIT05FX0ZPUk1BVFMpLmpvaW4oJywgJyl9YCk7XG4gIH1cbiAgXG4gIHJldHVybiBjb25maWcuY291bnRyeUNvZGU7XG59O1xuXG4vKipcbiAqIEdldHMgYWxsIHN1cHBvcnRlZCBjb3VudHJpZXMgZm9yIHBob25lIGZvcm1hdHRpbmdcbiAqIEByZXR1cm5zIEFycmF5IG9mIHN1cHBvcnRlZCBjb3VudHJ5IG5hbWVzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTdXBwb3J0ZWRDb3VudHJpZXMgPSAoKTogc3RyaW5nW10gPT4ge1xuICByZXR1cm4gT2JqZWN0LmtleXMoUEhPTkVfRk9STUFUUyk7XG59O1xuXG4vKipcbiAqIFZhbGlkYXRlcyBpZiBhIHBob25lIG51bWJlciBpcyB2YWxpZCBmb3IgYSBzcGVjaWZpYyBjb3VudHJ5XG4gKiBAcGFyYW0gcGhvbmVOdW1iZXIgLSBUaGUgcGhvbmUgbnVtYmVyIHRvIHZhbGlkYXRlXG4gKiBAcGFyYW0gY291bnRyeSAtIFRoZSBjb3VudHJ5IGNvZGUgKG9wdGlvbmFsLCB3aWxsIGJlIHByZWRpY3RlZCBpZiBub3QgcHJvdmlkZWQpXG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGNvbnN0IGlzVmFsaWRQaG9uZU51bWJlciA9IChwaG9uZU51bWJlcjogc3RyaW5nLCBjb3VudHJ5Pzogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gIHRyeSB7XG4gICAgZm9ybWF0UGhvbmVXaXRoQ291bnRyeUNvZGUocGhvbmVOdW1iZXIsIGNvdW50cnksIHRydWUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbi8qKlxuICogUHJlZGljdHMgdGhlIGNvdW50cnkgYmFzZWQgb24gdGhlIHBob25lIG51bWJlcidzIGNvdW50cnkgY29kZVxuICogQHBhcmFtIHBob25lTnVtYmVyIC0gVGhlIHBob25lIG51bWJlciB0byBhbmFseXplXG4gKiBAcmV0dXJucyBUaGUgcHJlZGljdGVkIGNvdW50cnkgbmFtZSBvciBudWxsIGlmIG5vdCBmb3VuZFxuICovXG5leHBvcnQgY29uc3QgcHJlZGljdENvdW50cnlGcm9tUGhvbmUgPSAocGhvbmVOdW1iZXI6IHN0cmluZyk6IHN0cmluZyB8IG51bGwgPT4ge1xuICByZXR1cm4gcHJlZGljdENvdW50cnlGcm9tUGhvbmVOdW1iZXIocGhvbmVOdW1iZXIpO1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSB2YWxpZCBkaWdpdCBjb3VudHMgZm9yIGEgc3BlY2lmaWMgY291bnRyeVxuICogQHBhcmFtIGNvdW50cnkgLSBUaGUgY291bnRyeSBuYW1lXG4gKiBAcmV0dXJucyBBcnJheSBvZiB2YWxpZCBkaWdpdCBjb3VudHNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFZhbGlkRGlnaXRDb3VudHMgPSAoY291bnRyeTogc3RyaW5nKTogbnVtYmVyW10gPT4ge1xuICBjb25zdCBjb3VudHJ5S2V5ID0gY291bnRyeS50b0xvd2VyQ2FzZSgpO1xuICBjb25zdCBjb25maWcgPSBQSE9ORV9GT1JNQVRTW2NvdW50cnlLZXldO1xuICBcbiAgaWYgKCFjb25maWcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvdW50cnkgJyR7Y291bnRyeX0nIGlzIG5vdCBzdXBwb3J0ZWQuIFN1cHBvcnRlZCBjb3VudHJpZXM6ICR7T2JqZWN0LmtleXMoUEhPTkVfRk9STUFUUykuam9pbignLCAnKX1gKTtcbiAgfVxuICBcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoY29uZmlnLmRpZ2l0Q291bnQpID8gY29uZmlnLmRpZ2l0Q291bnQgOiBbY29uZmlnLmRpZ2l0Q291bnRdO1xufTtcblxuLyoqXG4gKiBFeHRyYWN0cyB0aGUgY291bnRyeSBjb2RlIGFuZCBwaG9uZSBudW1iZXIgZnJvbSBhIGZvcm1hdHRlZCBwaG9uZSBudW1iZXJcbiAqIEBwYXJhbSBwaG9uZU51bWJlciAtIFRoZSBwaG9uZSBudW1iZXIgdG8gZXh0cmFjdCBmcm9tIChjYW4gYmUgZm9ybWF0dGVkIG9yIHVuZm9ybWF0dGVkKVxuICogQHJldHVybnMgT2JqZWN0IGNvbnRhaW5pbmcgY291bnRyeUNvZGUsIHBob25lTnVtYmVyIChpZiBjb21wbGV0ZSksIGNvdW50cnksIGFuZCBtYXNrLCBvciBvbmx5IGNvdW50cnlDb2RlIGFuZCBjb3VudHJ5IChpZiBpbmNvbXBsZXRlKSwgb3IgbnVsbCBpZiBleHRyYWN0aW9uIGZhaWxzXG4gKi9cbmV4cG9ydCBjb25zdCBleHRyYWN0Q291bnRyeUNvZGVBbmRQaG9uZSA9IChwaG9uZU51bWJlcjogc3RyaW5nKTogeyBjb3VudHJ5Q29kZTogc3RyaW5nOyBwaG9uZU51bWJlcj86IHN0cmluZzsgY291bnRyeT86IHN0cmluZzsgbWFzaz86IHN0cmluZyB8IHN0cmluZ1tdIH0gfCBudWxsID0+IHtcbiAgaWYgKCFwaG9uZU51bWJlcikgcmV0dXJuIG51bGw7XG4gIFxuICAvLyBDaGVjayBpZiB0aGUgb3JpZ2luYWwgaW5wdXQgY29udGFpbnMgbGV0dGVycyBtaXhlZCB3aXRoIG51bWJlcnMgKGludmFsaWQgcGhvbmUgbnVtYmVyKVxuICBjb25zdCBoYXNMZXR0ZXJzID0gL1thLXpBLVpdLy50ZXN0KHBob25lTnVtYmVyKTtcbiAgY29uc3QgaGFzTnVtYmVycyA9IC9cXGQvLnRlc3QocGhvbmVOdW1iZXIpO1xuICBcbiAgLy8gSWYgdGhlcmUgYXJlIGJvdGggbGV0dGVycyBhbmQgbnVtYmVycywgaXQncyBhbiBpbnZhbGlkIHBob25lIG51bWJlclxuICBpZiAoaGFzTGV0dGVycyAmJiBoYXNOdW1iZXJzKSB7XG4gICAgLy8gQWxsb3cgc3BlY2lmaWMgY2FzZXMgbGlrZSBXaGF0c0FwcCBKSURzXG4gICAgY29uc3QgaXNXaGF0c0FwcEppZCA9IC9AKHNcXC53aGF0c2FwcFxcLm5ldHxnXFwudXN8Y1xcLnVzKSQvaS50ZXN0KHBob25lTnVtYmVyKTtcbiAgICBpZiAoIWlzV2hhdHNBcHBKaWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBcbiAgLy8gUmVtb3ZlIGFsbCBub24tbnVtZXJpYyBjaGFyYWN0ZXJzIGV4Y2VwdCB0aGUgcGx1cyBzaWduXG4gIGNvbnN0IGNsZWFuTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvW15cXGQrXS9nLCAnJyk7XG4gIFxuICAvLyBJZiB0aGUgbnVtYmVyIHN0YXJ0cyB3aXRoICssIGV4dHJhY3QgY291bnRyeSBjb2RlIGZyb20gaXRcbiAgaWYgKGNsZWFuTnVtYmVyLnN0YXJ0c1dpdGgoJysnKSkge1xuICAgIGNvbnN0IG51bWJlcldpdGhvdXRQbHVzID0gY2xlYW5OdW1iZXIuc2xpY2UoMSk7XG4gICAgXG4gICAgLy8gVHJ5IHRvIGZpbmQgbWF0Y2hpbmcgY291bnRyeSBjb2RlXG4gICAgY29uc3Qgc29ydGVkQ291bnRyeUNvZGVzID0gT2JqZWN0LmtleXMoQ09VTlRSWV9DT0RFX01BUCkuc29ydCgoYSwgYikgPT4gYi5sZW5ndGggLSBhLmxlbmd0aCk7XG4gICAgXG4gICAgZm9yIChjb25zdCBjb3VudHJ5Q29kZSBvZiBzb3J0ZWRDb3VudHJ5Q29kZXMpIHtcbiAgICAgIGlmIChudW1iZXJXaXRob3V0UGx1cy5zdGFydHNXaXRoKGNvdW50cnlDb2RlKSkge1xuICAgICAgICBjb25zdCByZW1haW5pbmdOdW1iZXIgPSBudW1iZXJXaXRob3V0UGx1cy5zbGljZShjb3VudHJ5Q29kZS5sZW5ndGgpO1xuICAgICAgICBjb25zdCBjb3VudHJ5TmFtZSA9IENPVU5UUllfQ09ERV9NQVBbY291bnRyeUNvZGVdO1xuICAgICAgICBjb25zdCBjb25maWcgPSBQSE9ORV9GT1JNQVRTW2NvdW50cnlOYW1lXTtcbiAgICAgICAgXG4gICAgICAgIGlmIChjb25maWcpIHtcbiAgICAgICAgICBjb25zdCBleHBlY3RlZENvdW50cyA9IEFycmF5LmlzQXJyYXkoY29uZmlnLmRpZ2l0Q291bnQpID8gY29uZmlnLmRpZ2l0Q291bnQgOiBbY29uZmlnLmRpZ2l0Q291bnRdO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIElmIHRoZSByZW1haW5pbmcgbnVtYmVyIGhhcyB0aGUgY29ycmVjdCBsZW5ndGgsIHJldHVybiBjb21wbGV0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgIGlmIChleHBlY3RlZENvdW50cy5pbmNsdWRlcyhyZW1haW5pbmdOdW1iZXIubGVuZ3RoKSkge1xuICAgICAgICAgICAgLy8gQWRkaXRpb25hbCB2YWxpZGF0aW9uIGZvciBzaW5nbGUtZGlnaXQgY291bnRyeSBjb2Rlc1xuICAgICAgICAgICAgaWYgKGNvdW50cnlDb2RlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICBpZiAoY291bnRyeUNvZGUgPT09ICcxJyAmJiByZW1haW5pbmdOdW1iZXIubGVuZ3RoID09PSAxMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyZWFDb2RlID0gcmVtYWluaW5nTnVtYmVyLnN1YnN0cmluZygwLCAzKTtcbiAgICAgICAgICAgICAgICBpZiAoYXJlYUNvZGVbMF0gIT09ICcwJyAmJiBhcmVhQ29kZVswXSAhPT0gJzEnKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZTogY29uZmlnLmNvdW50cnlDb2RlLFxuICAgICAgICAgICAgICAgICAgICBwaG9uZU51bWJlcjogcmVtYWluaW5nTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBjb3VudHJ5OiBjb3VudHJ5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbWFzazogY29uZmlnLm1hc2tcbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvdW50cnlDb2RlID09PSAnNycgJiYgcmVtYWluaW5nTnVtYmVyLmxlbmd0aCA9PT0gMTApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgY291bnRyeUNvZGU6IGNvbmZpZy5jb3VudHJ5Q29kZSxcbiAgICAgICAgICAgICAgICAgIHBob25lTnVtYmVyOiByZW1haW5pbmdOdW1iZXIsXG4gICAgICAgICAgICAgICAgICBjb3VudHJ5OiBjb3VudHJ5TmFtZSxcbiAgICAgICAgICAgICAgICAgIG1hc2s6IGNvbmZpZy5tYXNrXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZTogY29uZmlnLmNvdW50cnlDb2RlLFxuICAgICAgICAgICAgICAgIHBob25lTnVtYmVyOiByZW1haW5pbmdOdW1iZXIsXG4gICAgICAgICAgICAgICAgY291bnRyeTogY291bnRyeU5hbWUsXG4gICAgICAgICAgICAgICAgbWFzazogY29uZmlnLm1hc2tcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHJlbWFpbmluZyBudW1iZXIgaXMgc2hvcnRlciB0aGFuIGV4cGVjdGVkLCByZXR1cm4gb25seSBjb3VudHJ5IGNvZGVcbiAgICAgICAgICAgIGNvbnN0IG1pbkV4cGVjdGVkQ291bnQgPSBNYXRoLm1pbiguLi5leHBlY3RlZENvdW50cyk7XG4gICAgICAgICAgICBpZiAocmVtYWluaW5nTnVtYmVyLmxlbmd0aCA+IDAgJiYgcmVtYWluaW5nTnVtYmVyLmxlbmd0aCA8IG1pbkV4cGVjdGVkQ291bnQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZTogY29uZmlnLmNvdW50cnlDb2RlLFxuICAgICAgICAgICAgICAgIGNvdW50cnk6IGNvdW50cnlOYW1lLFxuICAgICAgICAgICAgICAgIG1hc2s6IGNvbmZpZy5tYXNrXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIElmIG5vICsgc2lnbiwgdHJ5IHRvIHByZWRpY3QgY291bnRyeSBmcm9tIHRoZSBudW1iZXJcbiAgICBjb25zdCBwcmVkaWN0ZWRDb3VudHJ5ID0gcHJlZGljdENvdW50cnlGcm9tUGhvbmVOdW1iZXIoY2xlYW5OdW1iZXIpO1xuICAgIFxuICAgIGlmIChwcmVkaWN0ZWRDb3VudHJ5KSB7XG4gICAgICBjb25zdCBjb25maWcgPSBQSE9ORV9GT1JNQVRTW3ByZWRpY3RlZENvdW50cnldO1xuICAgICAgY29uc3QgY291bnRyeUNvZGVEaWdpdHMgPSBjb25maWcuY291bnRyeUNvZGUucmVwbGFjZSgvXFxEL2csICcnKTtcbiAgICAgIFxuICAgICAgaWYgKGNsZWFuTnVtYmVyLnN0YXJ0c1dpdGgoY291bnRyeUNvZGVEaWdpdHMpKSB7XG4gICAgICAgIGNvbnN0IHBob25lV2l0aG91dENvdW50cnlDb2RlID0gY2xlYW5OdW1iZXIuc2xpY2UoY291bnRyeUNvZGVEaWdpdHMubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgZXhwZWN0ZWRDb3VudHMgPSBBcnJheS5pc0FycmF5KGNvbmZpZy5kaWdpdENvdW50KSA/IGNvbmZpZy5kaWdpdENvdW50IDogW2NvbmZpZy5kaWdpdENvdW50XTtcbiAgICAgICAgXG4gICAgICAgIGlmIChleHBlY3RlZENvdW50cy5pbmNsdWRlcyhwaG9uZVdpdGhvdXRDb3VudHJ5Q29kZS5sZW5ndGgpKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvdW50cnlDb2RlOiBjb25maWcuY291bnRyeUNvZGUsXG4gICAgICAgICAgICBwaG9uZU51bWJlcjogcGhvbmVXaXRob3V0Q291bnRyeUNvZGUsXG4gICAgICAgICAgICBjb3VudHJ5OiBwcmVkaWN0ZWRDb3VudHJ5LFxuICAgICAgICAgICAgbWFzazogY29uZmlnLm1hc2tcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIHBob25lIG51bWJlciBpcyBpbmNvbXBsZXRlLCByZXR1cm4gb25seSBjb3VudHJ5IGNvZGVcbiAgICAgICAgICBjb25zdCBtaW5FeHBlY3RlZENvdW50ID0gTWF0aC5taW4oLi4uZXhwZWN0ZWRDb3VudHMpO1xuICAgICAgICAgIGlmIChwaG9uZVdpdGhvdXRDb3VudHJ5Q29kZS5sZW5ndGggPiAwICYmIHBob25lV2l0aG91dENvdW50cnlDb2RlLmxlbmd0aCA8IG1pbkV4cGVjdGVkQ291bnQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvdW50cnlDb2RlOiBjb25maWcuY291bnRyeUNvZGUsXG4gICAgICAgICAgICAgIGNvdW50cnk6IHByZWRpY3RlZENvdW50cnksXG4gICAgICAgICAgICAgIG1hc2s6IGNvbmZpZy5tYXNrXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTnVtYmVyIHdpdGhvdXQgY291bnRyeSBjb2RlXG4gICAgICAgIGNvbnN0IGV4cGVjdGVkQ291bnRzID0gQXJyYXkuaXNBcnJheShjb25maWcuZGlnaXRDb3VudCkgPyBjb25maWcuZGlnaXRDb3VudCA6IFtjb25maWcuZGlnaXRDb3VudF07XG4gICAgICAgIGlmIChleHBlY3RlZENvdW50cy5pbmNsdWRlcyhjbGVhbk51bWJlci5sZW5ndGgpKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvdW50cnlDb2RlOiBjb25maWcuY291bnRyeUNvZGUsXG4gICAgICAgICAgICBwaG9uZU51bWJlcjogY2xlYW5OdW1iZXIsXG4gICAgICAgICAgICBjb3VudHJ5OiBwcmVkaWN0ZWRDb3VudHJ5LFxuICAgICAgICAgICAgbWFzazogY29uZmlnLm1hc2tcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIENoZWNrIGlmIGl0J3MgYSBwYXJ0aWFsIG51bWJlciB0aGF0IGNvdWxkIG1hdGNoIGEgY291bnRyeSBjb2RlXG4gICAgY29uc3Qgc29ydGVkQ291bnRyeUNvZGVzID0gT2JqZWN0LmtleXMoQ09VTlRSWV9DT0RFX01BUCkuc29ydCgoYSwgYikgPT4gYi5sZW5ndGggLSBhLmxlbmd0aCk7XG4gICAgXG4gICAgZm9yIChjb25zdCBjb3VudHJ5Q29kZSBvZiBzb3J0ZWRDb3VudHJ5Q29kZXMpIHtcbiAgICAgIGlmIChjbGVhbk51bWJlci5zdGFydHNXaXRoKGNvdW50cnlDb2RlKSkge1xuICAgICAgICBjb25zdCByZW1haW5pbmdOdW1iZXIgPSBjbGVhbk51bWJlci5zbGljZShjb3VudHJ5Q29kZS5sZW5ndGgpO1xuICAgICAgICBjb25zdCBjb3VudHJ5TmFtZSA9IENPVU5UUllfQ09ERV9NQVBbY291bnRyeUNvZGVdO1xuICAgICAgICBjb25zdCBjb25maWcgPSBQSE9ORV9GT1JNQVRTW2NvdW50cnlOYW1lXTtcbiAgICAgICAgXG4gICAgICAgIGlmIChjb25maWcpIHtcbiAgICAgICAgICBjb25zdCBleHBlY3RlZENvdW50cyA9IEFycmF5LmlzQXJyYXkoY29uZmlnLmRpZ2l0Q291bnQpID8gY29uZmlnLmRpZ2l0Q291bnQgOiBbY29uZmlnLmRpZ2l0Q291bnRdO1xuICAgICAgICAgIGNvbnN0IG1pbkV4cGVjdGVkQ291bnQgPSBNYXRoLm1pbiguLi5leHBlY3RlZENvdW50cyk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZSBzb21lIGRpZ2l0cyBidXQgbm90IGVub3VnaCBmb3IgYSBjb21wbGV0ZSBudW1iZXJcbiAgICAgICAgICBpZiAocmVtYWluaW5nTnVtYmVyLmxlbmd0aCA+IDAgJiYgcmVtYWluaW5nTnVtYmVyLmxlbmd0aCA8IG1pbkV4cGVjdGVkQ291bnQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvdW50cnlDb2RlOiBjb25maWcuY291bnRyeUNvZGUsXG4gICAgICAgICAgICAgIGNvdW50cnk6IGNvdW50cnlOYW1lLFxuICAgICAgICAgICAgICBtYXNrOiBjb25maWcubWFza1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBudWxsO1xufTtcblxuZXhwb3J0IGNvbnN0IG1hc2sgPSAodmFsdWU6IGFueSwgbWFzazogYW55KSA9PiB7XG4gIHJldHVybiBtYXNrZXIodmFsdWUsIG1hc2ssIHRydWUpXG59XG5cbmV4cG9ydCBjb25zdCB1bm1hc2sgPSAodmFsdWU6IGFueSwgbWFzazogYW55KSA9PiB7XG4gIHJldHVybiBtYXNrZXIodmFsdWUsIG1hc2ssIGZhbHNlKVxufVxuXG5leHBvcnQgY29uc3QgTWFza2VyID0ge1xuICBtYXNrLFxuICB1bm1hc2ssXG4gIERFRkFVTFRfUEhPTkVfRERJLFxuICBERUZBVUxUX1BIT05FX01BU0ssXG4gIERFRkFVTFRfUEhPTkVfTUFTS19XSVRIX0RESSxcbiAgZm9ybWF0UGhvbmVXaXRoQ291bnRyeUNvZGUsXG4gIGdldENvdW50cnlDb2RlLFxuICBnZXRTdXBwb3J0ZWRDb3VudHJpZXMsXG4gIGlzVmFsaWRQaG9uZU51bWJlcixcbiAgZ2V0VmFsaWREaWdpdENvdW50cyxcbiAgcHJlZGljdENvdW50cnlGcm9tUGhvbmUsXG4gIGV4dHJhY3RDb3VudHJ5Q29kZUFuZFBob25lXG59IiwiZXhwb3J0IGNvbnN0IG1hcEFycmF5VG9HcmFwaFFMID0gKGFycmF5OiBhbnlbXSwga2V5OiBzdHJpbmcgfCBudWxsID0gbnVsbCkgPT4ge1xuICBjb25zdCBpdGVtcyA9IGFycmF5Lm1hcCgoaXRlbSkgPT4gYFwiJHsga2V5ID8gaXRlbVtrZXldIDogaXRlbSB9XCJgKS5qb2luKCcsJylcbiAgcmV0dXJuIGBbJHsgaXRlbXMgfV1gXG59XG5cblxuZXhwb3J0IGNvbnN0IEdyYXBoUUxIZWxwZXJzID0ge1xuICBtYXBBcnJheVRvR3JhcGhRTFxufSIsIlxuZXhwb3J0IGNvbnN0IGZvcm1hdEZpbGVTaXplID0gKGJ5dGVzOiBudW1iZXIgfCBzdHJpbmcpID0+IHtcbiAgICBpZiAoYnl0ZXMgPT09IG51bGwgfHwgYnl0ZXMgPT09IHVuZGVmaW5lZCB8fCBieXRlcyA9PT0gJycpIHJldHVybiAnMCBCeXRlcydcbiAgICBcbiAgICBieXRlcyA9IE51bWJlcihieXRlcylcbiAgICBcbiAgICBpZiAoaXNOYU4oYnl0ZXMpIHx8IGJ5dGVzIDwgMCB8fCBieXRlcyA9PT0gMCkgcmV0dXJuICcwIEJ5dGVzJ1xuICAgIFxuICAgIGNvbnN0IGsgPSAxMDI0XG4gICAgY29uc3Qgc2l6ZXMgPSBbJ0J5dGVzJywgJ0tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJ11cbiAgICBjb25zdCBpID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlcykgLyBNYXRoLmxvZyhrKSksIHNpemVzLmxlbmd0aCAtIDEpKVxuICAgIFxuICAgIHJldHVybiBwYXJzZUZsb2F0KChieXRlcyAvIE1hdGgucG93KGssIGkpKS50b0ZpeGVkKDIpKSArICcgJyArIHNpemVzW2ldXG4gIH1cblxuZXhwb3J0IGNvbnN0IGZvcm1hdEZpbGVFeHRlbnNpb24gPSAoZmlsZTogc3RyaW5nKSA9PiB7XG4gIHJldHVybiAnLicgKyBmaWxlLnNwbGl0KCcuJykucG9wKClcbn1cblxuZXhwb3J0IGNvbnN0IGZvcm1hdEZpbGVOYW1lID0gKGZpbGU6IHN0cmluZykgPT4ge1xuICByZXR1cm4gZmlsZS5zcGxpdCgnLycpLnBvcCgpXG59XG5cbmV4cG9ydCBjb25zdCBmb3JtYXRGaWxlQ29sb3IgPSAocGF0aDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGV4dGVuc2lvbiA9IGZvcm1hdEZpbGVFeHRlbnNpb24ocGF0aCkgYXMgc3RyaW5nXG4gIGlmIChbJy5wZGYnXS5pbmNsdWRlcyhleHRlbnNpb24pKSB7XG4gICAgcmV0dXJuICcjZWY0NDQ0J1xuICB9IGVsc2UgaWYgKFsnLmRvYycsICcuZG9jeCddLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcbiAgICByZXR1cm4gJyMzYjgyZjYnXG4gIH0gZWxzZSBpZiAoWycueGxzJywgJy54bHN4J10uaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xuICAgIHJldHVybiAnIzIyYzU1ZSdcbiAgfSBlbHNlIGlmIChbJy5wbmcnLCAnLmpwZycsICcuanBlZycsICcuZ2lmJywgJy5tcDQnLCAnLm1wZWcnLCAnLndlYm0nLCAnLndlYnAnLCAnLnN2ZyddLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcbiAgICByZXR1cm4gJyNlYWIzMDgnXG4gIH1cbiAgcmV0dXJuICcjNmI3MjgwJ1xufVxuXG5leHBvcnQgY29uc3QgZ2V0RmlsZUljb24gPSAocGF0aDogc3RyaW5nLCBwcm92aWRlcjogc3RyaW5nID0gJ3NvbGFyJykgPT4ge1xuICBjb25zdCBleHRlbnNpb24gPSBmb3JtYXRGaWxlRXh0ZW5zaW9uKHBhdGgpIGFzIHN0cmluZ1xuICBpZiAoWycucGRmJywgJy5kb2MnLCAnLmRvY3gnXS5pbmNsdWRlcyhleHRlbnNpb24pKSB7XG4gICAgaWYocHJvdmlkZXIgPT09ICdzb2xhcicpIHtcbiAgICAgIHJldHVybiAnc29sYXI6ZG9jdW1lbnQtdGV4dC1saW5lLWR1b3RvbmUnXG4gICAgfVxuXG4gIH0gZWxzZSBpZiAoWycueGxzJywgJy54bHN4J10uaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xuICAgIGlmKHByb3ZpZGVyID09PSAnc29sYXInKSB7XG4gICAgICByZXR1cm4gJ3NvbGFyOmNsaXBib2FyZC1saXN0LWxpbmUtZHVvdG9uZSdcbiAgICB9XG4gIH0gZWxzZSBpZiAoWycucG5nJywgJy5qcGcnLCAnLmpwZWcnLCAnLmdpZicsICcud2VicCcsICcuc3ZnJ10uaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xuICAgIGlmKHByb3ZpZGVyID09PSAnc29sYXInKSB7XG4gICAgICByZXR1cm4gJ3NvbGFyOmdhbGxlcnktYm9sZC1kdW90b25lJ1xuICAgIH1cbiAgfSBlbHNlIGlmKFsnLnppcCcsICcucmFyJywgJy43eicsICcudGFyJywgJy5neiddLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcbiAgICBpZihwcm92aWRlciA9PT0gJ3NvbGFyJykge1xuICAgICAgcmV0dXJuICdzb2xhcjphcmNoaXZlLWxpbmUtZHVvdG9uZSdcbiAgICB9XG4gIH0gZWxzZSBpZihbJy5tcDMnLCAnLndhdicsICcuZmxhYycsICcuYWFjJywgJy5vZ2cnXS5pbmNsdWRlcyhleHRlbnNpb24pKSB7XG4gICAgaWYocHJvdmlkZXIgPT09ICdzb2xhcicpIHtcbiAgICAgIHJldHVybiAnc29sYXI6bWljcm9waG9uZS0yLWxpbmUtZHVvdG9uZSdcbiAgICB9XG4gIH0gZWxzZSBpZihbJy5tcDQnLCAnLndlYm0nLCAnLm1vdicsICcuYXZpJywgJy5tcGVnJywgJy5tcGcnXS5pbmNsdWRlcyhleHRlbnNpb24pKSB7XG4gICAgaWYocHJvdmlkZXIgPT09ICdzb2xhcicpIHtcbiAgICAgIHJldHVybiAnc29sYXI6Y2hhdC1yb3VuZC12aWRlby1saW5lLWR1b3RvbmUnXG4gICAgfVxuICB9XG4gIHJldHVybiAnc29sYXI6ZmlsZS1saW5lLWR1b3RvbmUnXG59IiwiXG5leHBvcnQgY29uc3QgZ2V0V2hhdHNhcHBKaWRBbmROdW1iZXJWYWxpZGF0ZWQgPSAocGhvbmU6IHN0cmluZyApOiB7IGppZDogc3RyaW5nLCBudW1iZXI6IHN0cmluZyB9ID0+IHtcbiAgbGV0IGppZCA9IGZvcm1hdFBob25lTnVtYmVyVG9XaGF0c2FwcFJlbW90ZUppZChwaG9uZSlcbiAgaWYodHlwZW9mIGppZCA9PT0gJ3N0cmluZycpIHtcbiAgICBqaWQgPSBqaWQucmVwbGFjZSgvOlxcZCsoPz1AKS8sICcnKVxuICB9XG4gIHZhbGlkYXRlUmVtb3RlSmlkKGppZCwgcGhvbmUpXG4gIGNvbnN0IG51bWJlciA9IGppZC5yZXBsYWNlKC9cXEQvZywgJycpXG4gIHJldHVybiB7XG4gICAgamlkLFxuICAgIG51bWJlclxuICB9XG59XG5cbmNvbnN0IGZvcm1hdFBob25lTnVtYmVyVG9XaGF0c2FwcFJlbW90ZUppZCA9IChudW1iZXI6IHN0cmluZykgPT4ge1xuICBudW1iZXIgPSBTdHJpbmcobnVtYmVyKVxuICBpZiAobnVtYmVyLmluY2x1ZGVzKCdAZy51cycpIHx8IG51bWJlci5pbmNsdWRlcygnQHMud2hhdHNhcHAubmV0JykgfHwgbnVtYmVyLmluY2x1ZGVzKCdAbGlkJykpIHtcbiAgICByZXR1cm4gbnVtYmVyXG4gIH1cblxuICBpZiAobnVtYmVyLmluY2x1ZGVzKCdAYnJvYWRjYXN0JykpIHtcbiAgICByZXR1cm4gbnVtYmVyXG4gIH1cblxuICBudW1iZXIgPSBudW1iZXJcbiAgICA/LnJlcGxhY2UoL1xccy9nLCAnJylcbiAgICAucmVwbGFjZSgvXFwrL2csICcnKVxuICAgIC5yZXBsYWNlKC9cXCgvZywgJycpXG4gICAgLnJlcGxhY2UoL1xcKS9nLCAnJylcbiAgICAuc3BsaXQoJzonKVswXVxuICAgIC5zcGxpdCgnQCcpWzBdXG5cbiAgaWYgKG51bWJlci5pbmNsdWRlcygnLScpICYmIG51bWJlci5sZW5ndGggPj0gMjQpIHtcbiAgICBudW1iZXIgPSBudW1iZXIucmVwbGFjZSgvW15cXGQtXS9nLCAnJylcbiAgICByZXR1cm4gYCR7bnVtYmVyfUBnLnVzYFxuICB9XG5cbiAgbnVtYmVyID0gbnVtYmVyLnJlcGxhY2UoL1xcRC9nLCAnJylcblxuICBpZiAobnVtYmVyLmxlbmd0aCA+PSAxOCkge1xuICAgIG51bWJlciA9IG51bWJlci5yZXBsYWNlKC9bXlxcZC1dL2csICcnKVxuICAgIHJldHVybiBgJHtudW1iZXJ9QGcudXNgXG4gIH1cblxuICBudW1iZXIgPSBmb3JtYXRNWE9yQVJOdW1iZXIobnVtYmVyKVxuXG4gIG51bWJlciA9IGZvcm1hdEJSTnVtYmVyKG51bWJlcilcblxuICByZXR1cm4gYCR7bnVtYmVyfUBzLndoYXRzYXBwLm5ldGBcbn1cblxuY29uc3QgZm9ybWF0TVhPckFSTnVtYmVyID0gKGppZDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgY29uc3QgY291bnRyeUNvZGUgPSBqaWQuc3Vic3RyaW5nKDAsIDIpXG5cbiAgaWYgKE51bWJlcihjb3VudHJ5Q29kZSkgPT09IDUyIHx8IE51bWJlcihjb3VudHJ5Q29kZSkgPT09IDU0KSB7XG4gICAgaWYgKGppZC5sZW5ndGggPT09IDEzKSB7XG4gICAgICBjb25zdCBudW1iZXIgPSBjb3VudHJ5Q29kZSArIGppZC5zdWJzdHJpbmcoMylcbiAgICAgIHJldHVybiBudW1iZXJcbiAgICB9XG5cbiAgICByZXR1cm4gamlkXG4gIH1cbiAgcmV0dXJuIGppZFxufVxuXG4vLyBDaGVjayBpZiB0aGUgbnVtYmVyIGlzIGJyXG5jb25zdCBmb3JtYXRCUk51bWJlciA9IChqaWQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHJlZ2V4cCA9IG5ldyBSZWdFeHAoL14oXFxkezJ9KShcXGR7Mn0pXFxkezF9KFxcZHs4fSkkLylcbiAgaWYgKHJlZ2V4cC50ZXN0KGppZCkpIHtcbiAgICBjb25zdCBtYXRjaCA9IHJlZ2V4cC5leGVjKGppZClcbiAgICBpZiAobWF0Y2ggJiYgbWF0Y2hbMV0gPT09ICc1NScpIHtcbiAgICAgIGNvbnN0IGpva2VyID0gTnVtYmVyLnBhcnNlSW50KG1hdGNoWzNdWzBdKVxuICAgICAgY29uc3QgZGRkID0gTnVtYmVyLnBhcnNlSW50KG1hdGNoWzJdKVxuICAgICAgaWYgKGpva2VyIDwgNyB8fCBkZGQgPCAzMSkge1xuICAgICAgICByZXR1cm4gbWF0Y2hbMF1cbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaFsxXSArIG1hdGNoWzJdICsgbWF0Y2hbM11cbiAgICB9XG4gICAgcmV0dXJuIGppZFxuICB9IGVsc2Uge1xuICAgIHJldHVybiBqaWRcbiAgfVxufVxuXG5jb25zdCB2YWxpZGF0ZVJlbW90ZUppZCA9IChyZW1vdGVfamlkOiBzdHJpbmcsIHBob25lPzogc3RyaW5nIHwgbnVtYmVyKSA9PiB7XG4gIGNvbnN0IGludmFsaWRzID0gW251bGwsICcnLCAnQHMud2hhdHNhcHAubmV0J11cbiAgY29uc3QgaXNJbnZhbGlkUmVtb3RlSmlkID0gaW52YWxpZHMuc29tZShpbnZhbGlkID0+IHJlbW90ZV9qaWQgPT09IGludmFsaWQpXG4gIGlmKGlzSW52YWxpZFJlbW90ZUppZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCByZW1vdGVfamlkICR7IHJlbW90ZV9qaWQgfSB8IHBob25lOiAkeyBwaG9uZSA/PyAnJyB9YClcbiAgfVxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFPLE1BQU0sNkJBQTZCLEdBQUcsQ0FBQyxHQUFhLEdBQUEsRUFBRSxLQUFJO0lBQy9ELElBQUEsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQzdELENBQUMsQ0FBQTtJQUdNLE1BQU0sNkJBQTZCLEdBQUcsQ0FBQyxJQUFTLEtBQUk7SUFDekQsSUFBQSxJQUFHLFFBQU8sSUFBSSxDQUFDLEtBQUssUUFBUTtJQUFFLFFBQUEsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDdkQsSUFBQSxJQUFHLFFB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LFNBQUE7WUFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQ3hDLFFBQUEsSUFBRyxDQUFDLE1BQU07SUFBRSxZQUFBLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDbkMsS0FBQTtJQUNELElBQUEsT0FBTyxXQUFXLENBQUE7SUFDcEIsRUFBQztBQUVZLFVBQUEsYUFBYSxHQUFHLENBQUMsR0FBVSxFQUFFLFNBQUEsR0FBb0IsR0FBRyxLQUFZO0lBQzNFLElBQUEsSUFBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksUUFBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxRQUFRO0lBQUUsUUFBQSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUEsMkNBQUEsQ0FBNkMsQ0FBQyxDQUFBO1FBQ3BILE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3BILEVBQUM7VUFFWSxhQUFhLEdBQUcsQ0FBQyxHQUFVLEVBQUUsR0FBUSxLQUFXO1FBQzNELE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDbEMsSUFBQSxJQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRTtJQUNkLFFBQUEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDdEIsS0FBQTtJ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
