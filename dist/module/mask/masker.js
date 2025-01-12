"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.masker = void 0;
const maskit_1 = __importDefault(require("./maskit"));
const dynamic_mask_1 = __importDefault(require("./dynamic-mask"));
const tokens_1 = __importDefault(require("./tokens"));
const masker = function (value, mask, masked = true) {
    value = String(value);
    return Array.isArray(mask)
        ? (0, dynamic_mask_1.default)(maskit_1.default, mask, tokens_1.default)(value, mask, masked, tokens_1.default)
        : (0, maskit_1.default)(value, mask, masked, tokens_1.default);
};
exports.masker = masker;
