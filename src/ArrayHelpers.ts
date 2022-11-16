import { checkObjMatch, checkIsEqual } from './ObjectHelpers'
import { remapArrayToLowerCaseIfString } from './Util'

export const findByObj = (arr: any[], obj: any, asBoolean: boolean = false): any => {
  for(const item of arr) {
    if(!checkObjMatch(item, obj)) continue
    return asBoolean ? true : item
  }
  return false
}

export const findByString = (arr: any[], item: any, asBoolean: boolean = false): any => {
  for(const arrItem of arr) {
    if(typeof(arrItem) === 'string' && typeof(item) === 'string') {
      if(arrItem.toLowerCase() == item.toLowerCase()) return asBoolean ? true : arrItem
    } 

    if(arrItem == item) {
      return asBoolean ? true : arrItem
    }
  }
  return false
}

export const find = (arr: any[], query: any, asBoolean: boolean = false): any => {
  if(Array.isArray(query) ) return false
  if(typeof(query) === 'object') return findByObj(arr, query, asBoolean)
  return findByString(arr, query, asBoolean)
}

export const findIndex = (arr: any[], query: any): number => {
  if(typeof(query) === 'object') {
    const findedByObj = findByObj(arr, query)
    return findedByObj != false ? arr.indexOf(findedByObj) : -1 
  }
  const findedByString = findByString(arr, query)
  return findedByString !== false ? arr.indexOf(findedByString) : -1  
}

export const findAll = (arr: any[], query: any): any[] => {
  if (!query) return arr
  return arr.filter((item) => {
    const itemToMatch = typeof(item) === 'string' ? item.toLowerCase() : item
    if(typeof(query) == 'string') return checkIsEqual(item, query)
    if(Array.isArray(query)) return remapArrayToLowerCaseIfString(query).includes(itemToMatch) ? true : false
    return checkObjMatch(item, query) ? true : false
  })
}

export const removeAll = (arr: any[], query: any): any[] => {
  if (!query) return arr
  return arr.filter((item) => {
    const itemToMatch = typeof(item) === 'string' ? item.toLowerCase() : item
    if(typeof(query) === 'string') return !checkIsEqual(item, query)
    if(Array.isArray(query)) return remapArrayToLowerCaseIfString(query).includes(itemToMatch) ? false : true
    return checkObjMatch(item, query) ? false : true
  })
}

export const remove = (arr: any[], query: any = null): any => {
  if (!query) return arr
  const index = findIndex(arr, query)
  if(index > -1) arr.splice(index, 1)
  return arr
}

export const uniqueByKey = (arr: any[], query: any = null): any[] => {
  const uniqueItems = []
  for(const item of arr) {
    let search
    if(!query) {
      search = item
    } else if(typeof(query) === 'string') {
      search = { [query]: item[query] }
    } else {
      search = query
    }
    const finded = find(uniqueItems, search)
    if(!finded) uniqueItems.push(item)
  }
  return uniqueItems
}

export const objArrayToCsv = (arr: any[], delimiter: string = ','): string => {
  if(!Array.isArray(arr) || typeof(arr[0]) != 'object') throw new Error(`First parameter must be an array of objects`)
  const header = Object.keys(arr[0])
	return [header.join(delimiter) , arr.map(row => header.map(key => row[key]).join(delimiter)).join("\n")].join("\n")
}

export const toggleInArray = (arr: any[], obj: any): any[] => {
  const finded = findIndex(arr, obj)
  if(finded > -1) {
    arr.splice(finded, 1)
  } else {
    arr.push(obj)
  }
  return arr
}

export const compareArray = (arrFrom: any[], arrToCompare: any[], key: string = null): boolean => {
  if(arrFrom.length !== arrToCompare.length) return false
  for(const item of arrFrom) {
    let search
    if(typeof(item) === 'string') {
      search = item
    } else {
      if(typeof(key) !== 'string') throw new Error('Third parameter must be a string')
      search ={ [key]: item[key] }
    }
    const finded = find(arrToCompare, search)
    if(!finded) return false
  }
  return true
}

export default {
  findByObj,
  findByString,
  find,
  findIndex,
  findAll,
  removeAll,
  remove,
  uniqueByKey,
  objArrayToCsv,
  toggleInArray,
  compareArray
}

