import { remapArrayToLowerCaseIfString, lowerCaseAndStringifyIfNumber } from './Util'

export const filterObjectKeys = (allowed: any[], object: any): any => {
  return allowed.reduce((acc, allowedAttribute) => {
    if (object && Object.prototype.hasOwnProperty.call(object, allowedAttribute)) { acc[allowedAttribute] = object[allowedAttribute] }
    return acc
  }, {})
}

export const checkObjMatch = (item: any, query: any, ignoreEmptyArray: boolean = false): any => {
  const diffKeys = Object.keys(query).filter((key) => {
    let attrQuery = lowerCaseAndStringifyIfNumber(item[key])
    if(Array.isArray(query[key])) {
      if(!query[key].length) return ignoreEmptyArray
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

export const getNestedObjectByKey = (obj: any = {}, key: string = ''): any => {
  return key.split('.').reduce((acc, k) => {
    if (acc === undefined || acc === null) return undefined

    const arrayMatch = k.match(/^([^\[]+)\[(\d+)\]$/)
    if (arrayMatch) {
      const arrayKey = arrayMatch[1]
      const arrayIndex = parseInt(arrayMatch[2], 10)

      if (!Array.isArray(acc[arrayKey]) || acc[arrayKey][arrayIndex] === undefined) {
        return undefined
      }
      return acc[arrayKey][arrayIndex]
    }

    return acc[k]
  }, obj)
}

export const setNestedObjectByKey = (obj: any = {}, key: string, value: any, allowNonExistingArrayIndex: boolean = false): any => {
  obj = Object.assign({}, obj)
  key.split('.').reduce((acc, k, index, keys) => {
    const arrayMatch = k.match(/^([^\[]+)\[(\d+)\]$/)

    if (arrayMatch) {
      const arrayKey = arrayMatch[1]
      const arrayIndex = parseInt(arrayMatch[2], 10)

      if (!Array.isArray(acc[arrayKey])) {
        if (acc[arrayKey] !== undefined && (typeof acc[arrayKey] !== 'object')) {
          throw new TypeError(`Cannot set property '${arrayKey}[${arrayIndex}]' on non-object type (${typeof acc[arrayKey]}) at path '${keys.slice(0, index + 1).join('.')}'`)
        }
        acc[arrayKey] = []
      }

      // Check if the array has the specified index
      if (!allowNonExistingArrayIndex && arrayIndex >= acc[arrayKey].length) {
        throw new RangeError(`Array '${arrayKey}' does not have index ${arrayIndex} at path '${keys.slice(0, index + 1).join('.')}'`)
      }

      // Set the current accumulator to the specified index in the array
      acc = acc[arrayKey]
      // @ts-ignore
      k = arrayIndex
    }

    if (index === keys.length - 1) {
      acc[k] = value
    } else {
      // Throw an error if the current level is not an object
      if (acc[k] !== undefined && (typeof acc[k] !== 'object')) {
        throw new TypeError(`Cannot set property '${k}' on non-object type (${typeof acc[k]}) at path '${keys.slice(0, index + 1).join('.')}'`)
      }
      acc[k] = acc[k] || {}
    }

    return acc[k]
  }, obj)

  return obj
}

export const deleteNestedObjectByKey = (obj: any, key: string, ignoreNonExisting: boolean = true): any => {
  const keys = key.split('.')

  keys.reduce((acc: any, k, index) => {
    const arrayMatch = k.match(/^([^\[]+)\[(\d+)\]$/)

    if (arrayMatch) {
      const arrayKey = arrayMatch[1]
      const arrayIndex = parseInt(arrayMatch[2], 10)

      if (!Array.isArray(acc[arrayKey]) && !ignoreNonExisting) {
        throw new TypeError(`Cannot delete property '${arrayKey}[${arrayIndex}]' on non-array type at path '${keys.slice(0, index + 1).join('.')}'`)
      }

      if (index === keys.length - 1) {
        // Last element in path: delete array item
        if (arrayIndex >= acc[arrayKey].length && !ignoreNonExisting) {
          throw new RangeError(`Array '${arrayKey}' does not have index ${arrayIndex} at path '${keys.slice(0, index + 1).join('.')}'`)
        }
        acc[arrayKey].splice(arrayIndex, 1)
      } else {
        acc = acc[arrayKey][arrayIndex]
      }
    } else {
      if (index === keys.length - 1) {
        // Last element in path: delete object key
        if (acc && acc.hasOwnProperty(k)) {
          delete acc[k]
        } else if(!ignoreNonExisting) {
          throw new Error(`Cannot delete non-existent property '${k}' at path '${keys.slice(0, index + 1).join('.')}'`)
        }
      } else {
        // Traverse the object, ensuring we don't try to access a non-object
        if(ignoreNonExisting) {
          if (!acc[k] || typeof acc[k] !== 'object') {
            return acc
          }
        }
        if (!ignoreNonExisting && (!acc[k] || typeof acc[k] !== 'object')) {
          throw new TypeError(`Cannot delete property '${k}' on non-object type at path '${keys.slice(0, index + 1).join('.')}'`)
        }
        acc = acc[k]
      }
    }

    return acc
  }, obj)

  return obj
}

type AnyObject = Record<string, any>

export const deepSearchKey = (
  obj: AnyObject,
  targetKey: string,
  returnAll: boolean = false
): any[] | any => {
  const results: any[] = []
  let firstResult: any = null

  const search = (currentObj: AnyObject) => {
    if (!returnAll && firstResult !== null) return
    if (typeof currentObj !== 'object' || currentObj === null) return

    for (const key in currentObj) {
      if (key === targetKey) {
        if (returnAll) {
          results.push(currentObj[key])
        } else {
          firstResult = currentObj[key]
          return
        }
      }
      search(currentObj[key])
    }
  }

  search(obj)
  return returnAll ? results : firstResult
}

export const checkSameStructure = (
  baseObj: AnyObject,
  compareObj: AnyObject
): boolean => {
  if (typeof baseObj !== 'object' || baseObj === null) {
    return typeof baseObj === typeof compareObj
  }
  if (typeof compareObj !== 'object' || compareObj === null) {
    return false
  }
  for (const key in baseObj) {
    if (!(key in compareObj)) return false
    if (!checkSameStructure(baseObj[key], compareObj[key])) return false
  }
  return true
}

export const ObjectHelpers = {
  filterObjectKeys,
  checkObjMatch,
  checkIsEqual,
  initClassData,
  defineProperty,
  isObject,
  deepMergeObject,
  setNestedObjectByKey,
  deleteNestedObjectByKey,
  deepSearchKey
}