const downloadRawData = (data, fileName = 'file.txt') => {
  if(!window) throw new Error(`Method downloadRawData must run in "window" context.`)
  const blob = window.URL.createObjectURL(new Blob([data]))
	const link = document.createElement('a')
	link.setAttribute('href', blob)
	link.setAttribute('download', fileName)
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}
module.exports.downloadRawData = downloadRawData

const copyToClipboard = (string) => {
  const dummy = document.createElement("input")
  document.body.appendChild(dummy)
  dummy.value = string
  dummy.select()
  document.execCommand("copy")
  document.body.removeChild(dummy)
}

const getLetterByNumber = (number) => {
  const string = 'abcdefghijklmnopqrstuvwxyz'
  if(string.length-1 < number) return '--'
  return string[number]
}
module.exports.getLetterByNumber = getLetterByNumber


const clearBrowserCache = (hotKey = 'KeyX') => {
  if(document) {
    document.addEventListener("keydown", function(event) {
      if (event.altKey && event.code === hotKey) {
        event.preventDefault()
        localStorage.clear()
        sessionStorage.clear()
        window.location.reload()
        document.cookie.replace(/(?<=^|;).+?(?=\=|;|$)/g, name => location.hostname.split('.').reverse().reduce(domain => (domain=domain.replace(/^\.?[^.]+/, ''),document.cookie=`${name}=;max-age=0;path=/;domain=${domain}`,domain), location.hostname));
      }
    })
  }
}

module.exports = {
  downloadRawData,
	copyToClipboard,
  getLetterByNumber,
  clearBrowserCache
}