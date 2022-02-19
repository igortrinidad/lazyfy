const { checkObjMatch, checkIsNotEqual } = require('./ObjectHelpers')
const { remapArrayToLowerCaseIfString } = require('./Util')

const findByObj = (arr, obj) => {
  for(const item of arr) {
    if(!checkObjMatch(item, obj)) continue
    return item
  }
  return false
}

const findByString = (arr, item, asBoolean = false) => {
  for(const arrItem of arr) {
    if(arrItem.toLowerCase() === item.toLowerCase()) {
      return asBoolean ? true : arrItem
    }
  }
  return false
}

const find = (arr, query) => {
  if(typeof(query) === 'object') return findByObj(arr, query)
  return findByString(arr, query)
}

const findIndex = (arr, query) => {
  if(typeof(query) === 'object') {
    const findedByObj = findByObj(arr, query)
    return findedByObj != false ? arr.indexOf(findedByObj) : -1 
  }
  const findedByString = findByString(arr, query)
  return findedByString !== false ? arr.indexOf(findedByString) : -1  
}

const findAll = (arr, query) => {
  if (!query) return arr
  return arr.filter((item) => {
    const itemToMatch = typeof(item) === 'string' ? item.toLowerCase() : item
    if(typeof(query) == 'string') return !checkIsNotEqual(item, query)
    if(Array.isArray(query)) return remapArrayToLowerCaseIfString(query).includes(itemToMatch) ? true : false
    return checkObjMatch(item, query) ? true : false
  })
}

const removeAll = (arr, query) => {
  if (!query) return arr
  return arr.filter((item) => {
    const itemToMatch = typeof(item) === 'string' ? item.toLowerCase() : item
    if(typeof(query) === 'string') return checkIsNotEqual(item, query)
    if(Array.isArray(query)) return remapArrayToLowerCaseIfString(query).includes(itemToMatch) ? false : true
    return checkObjMatch(item, query) ? false : true
  })
}

module.exports = {
  findByObj,
  findByString,
  find,
  findIndex,
  findAll,
  removeAll,
  remapArrayToLowerCaseIfString
}
