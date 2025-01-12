"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringHelpers = exports.truncateText = exports.ensureStartsWithUpperCase = exports.checkStringIsSimilar = exports.checkStringSimilarity = exports.joinCommaPlusAnd = exports.randomString = exports.titleCaseString = void 0;
const titleCaseString = (str) => {
    return str.toString().split(' ').map((str) => str.toUpperCase().charAt(0) + str.substring(1).toLowerCase()).join(' ');
};
exports.titleCaseString = titleCaseString;
const randomString = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
exports.randomString = randomString;
const joinCommaPlusAnd = (a, unifierString = ' and ') => {
    return [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(a.length < 2 ? '' : unifierString);
};
exports.joinCommaPlusAnd = joinCommaPlusAnd;
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
exports.checkStringSimilarity = checkStringSimilarity;
const checkStringIsSimilar = (base, stringToCompare, threshold = 0.8, caseInsensitive = true) => {
    return (0, exports.checkStringSimilarity)(base, stringToCompare, caseInsensitive) >= threshold;
};
exports.checkStringIsSimilar = checkStringIsSimilar;
const ensureStartsWithUpperCase = (str = '') => {
    if (!str)
        return '';
    const trimmedStart = str.trimStart();
    return str.slice(0, str.length - trimmedStart.length) + trimmedStart[0].toUpperCase() + trimmedStart.slice(1);
};
exports.ensureStartsWithUpperCase = ensureStartsWithUpperCase;
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
exports.truncateText = truncateText;
exports.StringHelpers = {
    titleCaseString: exports.titleCaseString,
    randomString: exports.randomString,
    joinCommaPlusAnd: exports.joinCommaPlusAnd,
    checkStringSimilarity: exports.checkStringSimilarity,
    checkStringIsSimilar: exports.checkStringIsSimilar,
    ensureStartsWithUpperCase: exports.ensureStartsWithUpperCase,
    truncateText: exports.truncateText,
};
