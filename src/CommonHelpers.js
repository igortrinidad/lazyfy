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

module.exports = {
  downloadRawData,
	copyToClipboard
}