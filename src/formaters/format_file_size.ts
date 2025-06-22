

export const formatFileSize = (bytes: number | string) => {
    if (bytes === null || bytes === undefined || bytes === '') return '0 Bytes'
    
    bytes = Number(bytes)
    
    if (isNaN(bytes) || bytes < 0 || bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }