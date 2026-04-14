"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayHelpers = exports.getRandomWeithedElementsInArrays = exports.chunkArray = exports.getRandomElement = exports.shuffle = exports.compareArray = exports.toggleInArray = exports.objArrayToCsv = exports.uniqueByKey = exports.remove = exports.removeAll = exports.findAll = exports.findIndex = exports.find = exports.findByString = exports.findByObj = void 0;
const ObjectHelpers_1 = require("./ObjectHelpers");
const Util_1 = require("./Util");
const findByObj = (arr, obj, asBoolean = false) => {
    for (const item of arr) {
        if (!(0, ObjectHelpers_1.checkObjMatch)(item, obj))
            continue;
        return asBoolean ? true : item;
    }
    return false;
};
exports.findByObj = findByObj;
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
exports.findByString = findByString;
const find = (arr, query, asBoolean = false) => {
    if (Array.isArray(query))
        return false;
    if (typeof (query) === 'object')
        return (0, exports.findByObj)(arr, query, asBoolean);
    return (0, exports.findByString)(arr, query, asBoolean);
};
exports.find = find;
const findIndex = (arr, query) => {
    if (typeof (query) === 'object') {
        const findedByObj = (0, exports.findByObj)(arr, query);
        return findedByObj != false ? arr.indexOf(findedByObj) : -1;
    }
    const findedByString = (0, exports.findByString)(arr, query);
    return findedByString !== false ? arr.indexOf(findedByString) : -1;
};
exports.findIndex = findIndex;
const findAll = (arr, query, ignoreEmptyArray = false) => {
    if (!query)
        return arr;
    return arr.filter((item) => {
        const itemToMatch = typeof (item) === 'string' ? item.toLowerCase() : item;
        if (typeof (query) == 'string')
            return (0, ObjectHelpers_1.checkIsEqual)(item, query);
        if (Array.isArray(query))
            return (0, Util_1.remapArrayToLowerCaseIfString)(query).includes(itemToMatch) ? true : false;
        return (0, ObjectHelpers_1.checkObjMatch)(item, query, !ignoreEmptyArray) ? true : false;
    });
};
exports.findAll = findAll;
const removeAll = (arr, query, ignoreEmptyArray = true) => {
    if (!query)
        return arr;
    return arr.filter((item) => {
        const itemToMatch = typeof (item) === 'string' ? item.toLowerCase() : item;
        if (typeof (query) === 'string')
            return !(0, ObjectHelpers_1.checkIsEqual)(item, query);
        if (Array.isArray(query))
            return (0, Util_1.remapArrayToLowerCaseIfString)(query).includes(itemToMatch) ? false : true;
        return (0, ObjectHelpers_1.checkObjMatch)(item, query, ignoreEmptyArray) ? false : true;
    });
};
exports.removeAll = removeAll;
const remove = (arr, query = null) => {
    if (!query)
        return arr;
    const index = (0, exports.findIndex)(arr, query);
    if (index > -1)
        arr.splice(index, 1);
    return arr;
};
exports.remove = remove;
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
        const finded = (0, exports.find)(uniqueItems, search);
        if (!finded)
            uniqueItems.push(item);
    }
    return uniqueItems;
};
exports.uniqueByKey = uniqueByKey;
const objArrayToCsv = (arr, delimiter = ',') => {
    if (!Array.isArray(arr) || typeof (arr[0]) != 'object')
        throw new Error(`First parameter must be an array of objects`);
    const header = Object.keys(arr[0]);
    return [header.join(delimiter), arr.map(row => header.map(key => row[key]).join(delimiter)).join("\n")].join("\n");
};
exports.objArrayToCsv = objArrayToCsv;
const toggleInArray = (arr, obj) => {
    const finded = (0, exports.findIndex)(arr, obj);
    if (finded > -1) {
        arr.splice(finded, 1);
    }
    else {
        arr.push(obj);
    }
    return arr;
};
exports.toggleInArray = toggleInArray;
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
        const finded = (0, exports.find)(arrToCompare, search);
        if (!finded)
            return false;
    }
    return true;
};
exports.compareArray = compareArray;
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
exports.shuffle = shuffle;
const getRandomElement = (list) => list[Math.floor(Math.random() * list.length)];
exports.getRandomElement = getRandomElement;
const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};
exports.chunkArray = chunkArray;
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
            const element = (0, exports.getRandomElement)(selectedList);
            result.push(element);
            // Remover o elemento selecionado da lista para evitar repetição
            const elementIndex = selectedList.indexOf(element);
            selectedList.splice(elementIndex, 1);
        }
    }
    return result;
};
exports.getRandomWeithedElementsInArrays = getRandomWeithedElementsInArrays;
exports.ArrayHelpers = {
    findByObj: exports.findByObj,
    findByString: exports.findByString,
    find: exports.find,
    findIndex: exports.findIndex,
    findAll: exports.findAll,
    removeAll: exports.removeAll,
    remove: exports.remove,
    uniqueByKey: exports.uniqueByKey,
    objArrayToCsv: exports.objArrayToCsv,
    toggleInArray: exports.toggleInArray,
    compareArray: exports.compareArray,
    shuffle: exports.shuffle,
    getRandomElement: exports.getRandomElement,
    chunkArray: exports.chunkArray,
    getRandomWeithedElementsInArrays: exports.getRandomWeithedElementsInArrays
};
