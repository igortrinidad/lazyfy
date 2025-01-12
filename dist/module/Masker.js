"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Masker = exports.unmask = exports.mask = void 0;
const masker_1 = require("./mask/masker");
const enums_1 = require("./mask/enums");
const mask = (value, mask) => {
    return (0, masker_1.masker)(value, mask, true);
};
exports.mask = mask;
const unmask = (value, mask) => {
    return (0, masker_1.masker)(value, mask, false);
};
exports.unmask = unmask;
exports.Masker = {
    mask: exports.mask,
    unmask: exports.unmask,
    DEFAULT_PHONE_DDI: enums_1.DEFAULT_PHONE_DDI,
    DEFAULT_PHONE_MASK: enums_1.DEFAULT_PHONE_MASK,
    DEFAULT_PHONE_MASK_WITH_DDI: enums_1.DEFAULT_PHONE_MASK_WITH_DDI
};
