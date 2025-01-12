"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonHelpers = exports.clearBrowserCacheListener = exports.clearBrowserCache = exports.removeAllCookies = exports.getLetterByNumber = exports.copyToClipboard = exports.downloadRawData = void 0;
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
exports.downloadRawData = downloadRawData;
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
exports.copyToClipboard = copyToClipboard;
const getLetterByNumber = (number) => {
    const string = 'abcdefghijklmnopqrstuvwxyz';
    if (string.length - 1 < number)
        return '--';
    return string[number];
};
exports.getLetterByNumber = getLetterByNumber;
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
exports.removeAllCookies = removeAllCookies;
const clearBrowserCache = (removeCookies = true) => {
    localStorage.clear();
    sessionStorage.clear();
    if (removeCookies) {
        (0, exports.removeAllCookies)();
    }
};
exports.clearBrowserCache = clearBrowserCache;
const clearBrowserCacheListener = (hotKey = 'KeyX', removeCookies = true, cb = null) => {
    if (document) {
        document.addEventListener("keydown", function (event) {
            if (event.altKey && event.code === hotKey) {
                event.preventDefault();
                (0, exports.clearBrowserCache)(removeCookies);
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
exports.clearBrowserCacheListener = clearBrowserCacheListener;
exports.CommonHelpers = {
    downloadRawData: exports.downloadRawData,
    copyToClipboard: exports.copyToClipboard,
    getLetterByNumber: exports.getLetterByNumber,
    clearBrowserCache: exports.clearBrowserCache,
    clearBrowserCacheListener: exports.clearBrowserCacheListener,
    removeAllCookies: exports.removeAllCookies
};
