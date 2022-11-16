import { remapArrayToLowerCaseIfString } from './Util'

export const filterObjectKeys = (allowed: any[], object: any): any => {
  return allowed.reduce((acc, allowedAttribute) => {
    if (object && Object.prototype.hasOwnProperty.call(object, allowedAttribute)) { acc[allowedAttribute] = object[allowedAttribute] }
    return acc
  }, {})
}

export const checkObjMatch = (item: any, query: any): any => {
  const diffKeys = Object.keys(query).filter((key) => {
    const attrQuery = typeof(item[key]) === 'string' ? item[key].toLowerCase() : item[key]
    if(Array.isArray(query[key])) {
      if(!query[key].length) return false
      return !remapArrayToLowerCaseIfString(query[key]).includes(attrQuery)
    }
    return !checkIsEqual(attrQuery, query[key])
  })
  if(diffKeys.length) return false
  return item
}

export const checkIsEqual = (value: any, query: any): boolean => {
  if(typeof(query) === 'string' && typeof(value) === 'string') return value.toLowerCase() == query.toLowerCase()
  return value == query
}

export const initClassData = (fillable: any[], instance: any, obj: any = {}) => {  
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

export const defineProperty = (object: any, key: string, value: any) => {
  Object.defineProperty(object, key, {
    value: value,
    writable: true,
    enumerable: true,
    configurable: true
  })
  return object
}

export const isObject = (item: any): boolean => {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export const deepMergeObject = (target: any, ...sources: any): any => {
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
