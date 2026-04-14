"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileIcon = exports.formatFileColor = exports.formatFileName = exports.formatFileExtension = exports.formatFileSize = void 0;
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
const getFileIcon = (path, provider = 'solar') => {
    const extension = (0, exports.formatFileExtension)(path);
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
exports.getFileIcon = getFileIcon;
