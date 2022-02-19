

const filterObjectKeys = (allowed, object) => {
  return allowed.reduce((acc, allowedAttribute) => {
    if (object && Object.prototype.hasOwnProperty.call(object, allowedAttribute)) { acc[allowedAttribute] = object[allowedAttribute] }
    return acc
  }, {})
}
module.exports.filterObjectKeys = filterObjectKeys

const checkObjMatch = (item, obj) => {
  const diffKeys = Object.keys(obj).filter((key) => {
    if(Array.isArray(obj[key])) return !obj[key].includes(item[key])
    return obj[key] != item[key]
  })
  if(diffKeys.length) return false
  return item
}

export const findByObj = (arr, obj) => {
  for(const item of arr) {
    if(!checkObjMatch(item, obj)) continue
    return item
  }
  return false
}

export const findByString = (arr, item, asBoolean = false) => {
  for(const arrItem of arr) {
    if(arrItem == item) {
      return asBoolean ? true : arrItem
    }
  }
  return false
}

export const find = (arr, obj) => {
  if(typeof(obj) === 'object') return findByObj(arr, obj)
  return findByString(arr, obj)
}

export const findIndex = (arr, obj) => {
  if(typeof(obj) === 'object') {
    const findedByObj = findByObj(arr, obj)
    return findedByObj != false ? arr.indexOf(findedByObj) : -1 
  }
  const findedByString = findByString(arr, obj)
  return findedByString !== false ? arr.indexOf(findedByString) : -1  
}

export const findAll = (arr, obj) => {
  if (!obj) return arr
  return arr.filter((item) => {
    if(typeof(obj) == 'string') return item === obj
    return !checkObjMatch(item, obj) ? false : true
  })
}

export const removeAll = (arr, obj) => {
  return arr.filter((item) => {
    if(typeof(obj) == 'string') return item !== obj
    return !checkObjMatch(item, obj) ? true : false
  })
}

export const initClassData = (fillable, instance, obj = {}) => {  
  for(const attr of fillable) {
    if(typeof(obj[attr.key]) != 'undefined') {
      instance[attr.key] = obj[attr.key]
    } else {
      instance[attr.key] = attr.default
    }

    Object.defineProperty(instance, 'getFillableKeys', {
      get() { return fillable.map((item) => item.key) },
      configurable: true
    })
  }
}

export const deepMergeObject = (objToAdd = {}, objToMergeFrom = {}, clone = false) => {
  if(clone) objToMergeFrom = { ...objToMergeFrom }
  for (const [key, val] of Object.entries(objToAdd)) {
    if (val !== null && typeof val === `object`) {
      if (objToMergeFrom[key] === undefined) {
        objToMergeFrom[key] = new val.__proto__.constructor()
      }
      deepMergeObject(val, objToMergeFrom[key])
    } else {
      objToMergeFrom[key] = val
    }
  }
  return objToMergeFrom
}

export default {
  filterObjectKeys,
  checkObjMatch,
  findByObj,
  findByString,
  find,
  findIndex,
  findAll,
  removeAll,
  initClassData,
}
