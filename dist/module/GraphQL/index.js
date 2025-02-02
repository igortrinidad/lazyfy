"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLHelpers = exports.mapArrayToGraphQL = void 0;
const mapArrayToGraphQL = (array, key = null) => {
    const items = array.map((item) => `"${key ? item[key] : item}"`).join(',');
    return `[${items}]`;
};
exports.mapArrayToGraphQL = mapArrayToGraphQL;
exports.GraphQLHelpers = {
    mapArrayToGraphQL: exports.mapArrayToGraphQL
};
