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

module.exports = {
  downloadRawData
}