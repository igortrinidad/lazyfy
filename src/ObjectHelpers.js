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
  if(typeof(query) === 'string' && typeof(value) === 'string') return value.toLowerCase() == query.toLowerCase()
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

const defineProperty = (object, key, value) => {
  Object.defineProperty(object, key, {
    value: value,
    writable: true,
    enumerable: true,
    configurable: true
  })
  return object
}

const isObject = (item) => {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

const deepMergeObject = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, {
          [key]: {}
        });
        deepMergeObject(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key]
        });
      }
    }
  }

  return deepMergeObject(target, ...sources);
}

module.exports = {
  filterObjectKeys,
  checkIsEqual,
  checkObjMatch,
  initClassData,
  deepMergeObject,
  defineProperty
}
