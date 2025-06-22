
export const formatFileSize = (bytes: number | string) => {
    if (bytes === null || bytes === undefined || bytes === '') return '0 Bytes'
    
    bytes = Number(bytes)
    
    if (isNaN(bytes) || bytes < 0 || bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

export const formatFileExtension = (file: string) => {
  return '.' + file.split('.').pop()
}

export const formatFileName = (file: string) => {
  return file.split('/').pop()
}

export const formatFileColor = (path: string) => {
  const extension = formatFileExtension(path) as string
  if (['.pdf'].includes(extension)) {
    return '#ef4444'
  } else if (['.doc', '.docx'].includes(extension)) {
    return '#3b82f6'
  } else if (['.xls', '.xlsx'].includes(extension)) {
    return '#22c55e'
  } else if (['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mpeg', '.webm', '.webp', '.svg'].includes(extension)) {
    return '#eab308'
  }
  return '#6b7280'
}

export const getFileIcon = (path: string, provider: string = 'solar') => {
  const extension = formatFileExtension(path) as string
  if (['.pdf', '.doc', '.docx'].includes(extension)) {
    if(provider === 'solar') {
      return 'solar:document-text-line-duotone'
    }

  } else if (['.xls', '.xlsx'].includes(extension)) {
    if(provider === 'solar') {
      return 'solar:clipboard-list-line-duotone'
    }
  } else if (['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mpeg', '.webm', '.webp', '.svg'].includes(extension)) {
    if(provider === 'solar') {
      return 'solar:gallery-bold-duotone'
    }
  }
  if(provider === 'solar') {
    return 'solar:file-line-duotone'
  }
}