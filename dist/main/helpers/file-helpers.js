"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFileColor = exports.formatFileName = exports.formatFileExtension = exports.formatFileSize = void 0;
const formatFileSize = (size = 0) => {
    const bytes = size;
    if (bytes === 0)
        return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10);
    if (i === 0)
        return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
const formatFileExtension = (file) => {
    return '.' + file.split('.').pop();
};
exports.formatFileExtension = formatFileExtension;
const formatFileName = (file) => {
    return file.split('/').pop();
};
exports.formatFileName = formatFileName;
const formatFileColor = (path) => {
    const extension = (0, exports.formatFileExtension)(path);
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
exports.formatFileColor = formatFileColor;
