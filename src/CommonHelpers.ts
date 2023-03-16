
export const downloadRawData = (data: string, fileName:string = 'file.txt'): void => {
  if(!window) throw new Error(`Method downloadRawData must run in "window" context.`)
  const blob = window.URL.createObjectURL(new Blob([data]))
	const link = document.createElement('a')
	link.setAttribute('href', blob)
	link.setAttribute('download', fileName)
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}

export const copyToClipboard = (string: string): void => {
  if(navigator.clipboard) {
    navigator.clipboard.writeText(string)
  } else {
    const dummy = document.createElement("input")
    document.body.appendChild(dummy)
    dummy.value = string
    dummy.select()
    document.execCommand("copy")
    document.body.removeChild(dummy)
  }
}

export const getLetterByNumber = (number: number): string => {
  const string = 'abcdefghijklmnopqrstuvwxyz'
  if(string.length-1 < number) return '--'
  return string[number]
}


export const clearBrowserCache = (hotKey: string = 'KeyX', cb: Function = null): void => {
  if(document) {
    document.addEventListener("keydown", function(event) {
      if (event.altKey && event.code === hotKey) {
        event.preventDefault()
        localStorage.clear()
        sessionStorage.clear()
        window.location.reload()
        document.cookie.replace(/(?:\/)([^#]+)(?=#|$)/g, name => location.hostname.split('.').reverse().reduce(domain => (domain=domain.replace(/^\.?[^.]+/, ''),document.cookie=`${name}=;max-age=0;path=/;domain=${domain}`,domain), location.hostname));
        if(cb) {
          cb()
        }
      }
    })
  }
}

export const CommonHelpers = {
  downloadRawData,
  copyToClipboard,
  getLetterByNumber,
  clearBrowserCache

}