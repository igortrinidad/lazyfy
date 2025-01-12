"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexHelpers = exports.extractUuidsV4 = exports.extractMatchs = void 0;
const extractMatchs = (text, regex) => {
    const matches = text.match(regex) || [];
    return [...new Set(matches)];
};
exports.extractMatchs = extractMatchs;
const extractUuidsV4 = (text) => {
    const regex = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/g;
    return (0, exports.extractMatchs)(text, regex);
};
exports.extractUuidsV4 = extractUuidsV4;
exports.RegexHelpers = {
    extractMatchs: exports.extractMatchs,
    extractUuidsV4: exports.extractUuidsV4
};
