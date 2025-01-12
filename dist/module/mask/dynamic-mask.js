"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = dynamicMask;
