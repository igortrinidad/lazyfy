const remapArrayToLowerCaseIfString = (arr) => {
  return arr.map(item => {
    if(typeof(item) === 'string') return item.toLowerCase()
    return item
  })
}
module.exports.remapArrayToLowerCaseIfString = remapArrayToLowerCaseIfString