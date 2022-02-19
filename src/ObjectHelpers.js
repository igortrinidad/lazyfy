const { remapArrayToLowerCaseIfString } = require('./Util')

const filterObjectKeys = (allowed, object) => {
  return allowed.reduce((acc, allowedAttribute) => {
    if (object && Object.prototype.hasOwnProperty.call(object, allowedAttribute)) { acc[allowedAttribute] = object[allowedAttribute] }
    return acc
  }, {})
}

const checkObjMatch = (item, query) => {
  const diffKeys = Object.keys(query).filter((key) => {
    const attrQuery = typeof(item[key]) === 'string' ? item[key].toLowerCase() : item[key]
    if(Array.isArray(query[key])) {
      return !remapArrayToLowerCaseIfString(query[key]).includes(attrQuery)
    }
    return !checkIsEqual(attrQuery, query[key])
  })
  if(diffKeys.length) return false
  return item
}

const checkIsEqual = (value, query) => {
  if(typeof(query) === 'string') return value.toLowerCase() == query.toLowerCase()
  return value == query
}

const initClassData = (fillable, instance, obj = {}) => {  
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

const deepMergeObject = (objToAdd = {}, objToMergeFrom = {}, clone = false) => {
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

module.exports = {
  filterObjectKeys,
  checkIsEqual,
  checkObjMatch,
  initClassData,
  deepMergeObject
}
