const { checkObjMatch, checkIsEqual } = require('./ObjectHelpers')
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
  if(Array.isArray(query) ) return false
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
    if(typeof(query) == 'string') return checkIsEqual(item, query)
    if(Array.isArray(query)) return remapArrayToLowerCaseIfString(query).includes(itemToMatch) ? true : false
    return checkObjMatch(item, query) ? true : false
  })
}

const removeAll = (arr, query) => {
  if (!query) return arr
  return arr.filter((item) => {
    const itemToMatch = typeof(item) === 'string' ? item.toLowerCase() : item
    if(typeof(query) === 'string') return !checkIsEqual(item, query)
    if(Array.isArray(query)) return remapArrayToLowerCaseIfString(query).includes(itemToMatch) ? false : true
    return checkObjMatch(item, query) ? false : true
  })
}

const remove = (arr, query) => {
  if (!query) return arr
  const index = findIndex(arr, query)
  if(index > -1) arr.splice(index, 1)
  return arr
}

const uniqueByKey = (arr, query) => {
  const uniqueItems = []
  for(const item of arr) {
    let search
    if(typeof(query) === 'string') {
      search = { [query]: item[query] }
    } else {
      search = query
    }
    const finded = find(uniqueItems, search)
    if(!finded) uniqueItems.push(item)
  }
  return uniqueItems
}

const objArrayToCsv = (arr, delimiter = ',') => {
  if(!Array.isArray(arr) || typeof(arr[0]) != 'object') throw new Error(`First parameter must be an array of objects`)
  const header = Object.keys(arr[0])
	return [header.join(delimiter) , arr.map(row => header.map(key => row[key]).join(delimiter)).join("\n")].join("\n")
}

const toggleInArray = (arr, obj) => {
  const finded = findIndex(arr, obj)
  if(finded > -1) {
    arr.splice(finded, 1)
  } else {
    arr.push(obj)
  }
  return arr
}

module.exports = {
  findByObj,
  findByString,
  find,
  findIndex,
  findAll,
  removeAll,
  remove,
  uniqueByKey,
  objArrayToCsv,
  toggleInArray
}
