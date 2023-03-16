
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

export const removeAllCookies = (): void => {
  if(document) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      const path = '/';
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=' + path;
    }
  }
}


export const clearBrowserCache = (hotKey: string = 'KeyX', removeCookies: boolean = true, cb: Function | null = null): void => {
  if(document) {
    document.addEventListener("keydown", function(event) {
      if (event.altKey && event.code === hotKey) {
        event.preventDefault()
        localStorage.clear()
        sessionStorage.clear()

        if(removeCookies) {
          removeAllCookies()
        }

        if(cb) {
          cb()
        } else {
          window.location.reload()
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