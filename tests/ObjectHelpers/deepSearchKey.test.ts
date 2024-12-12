import { deepSearchKey } from '../../src'

describe('deepSearchKey', () => {
  test('Finds a key in a simple object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = deepSearchKey(obj, 'b')
    expect(result).toBe(2)
  })

  test('Finds a key deeply nested in an object', () => {
    const obj = {
      level1: {
        level2: {
          level3: {
            targetKey: 'found'
          }
        }
      }
    }
    const result = deepSearchKey(obj, 'targetKey')
    expect(result).toBe('found')
  })

  test('Finds multiple values of the same key in nested objects when returnAll is true', () => {
    const obj = {
      a: {
        b: 'value1',
        c: {
          b: 'value2',
          d: {
            b: 'value3'
          }
        }
      }
    }
    const result = deepSearchKey(obj, 'b', true)
    expect(result).toEqual(['value1', 'value2', 'value3'])
  })

  test('Returns only the first value when returnAll is false', () => {
    const obj = {
      a: {
        b: 'value1',
        c: {
          b: 'value2',
          d: {
            b: 'value3'
          }
        }
      }
    }
    const result = deepSearchKey(obj, 'b', false)
    expect(result).toBe('value1')
  })

  test('Returns an empty array if the key is not found and returnAll is true', () => {
    const obj = { a: 1, b: 2 }
    const result = deepSearchKey(obj, 'nonExistentKey', true)
    expect(result).toEqual([])
  })

  test('Returns null if the key is not found and returnAll is false', () => {
    const obj = { a: 1, b: 2 }
    const result = deepSearchKey(obj, 'nonExistentKey', false)
    expect(result).toBeNull()
  })

  test('Finds a key in an array of objects', () => {
    const obj = {
      array: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
      ]
    }
    const result = deepSearchKey(obj, 'name', true)
    expect(result).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  test('Handles deeply nested arrays', () => {
    const obj = {
      deep: {
        superDeepArray: [
          { title: 'Item 0' },
          { title: 'Item 1' },
          { title: 'Item 2' }
        ]
      }
    }
    const result = deepSearchKey(obj, 'title', true)
    expect(result).toEqual(['Item 0', 'Item 1', 'Item 2'])
  })

  test('Returns the first matching value from a deeply nested array', () => {
    const obj = {
      deep: {
        superDeepArray: [
          { title: 'Item 0' },
          { title: 'Item 1' },
          { title: 'Item 2' }
        ]
      }
    }
    const result = deepSearchKey(obj, 'title', false)
    expect(result).toBe('Item 0')
  })

  test('Handles empty objects', () => {
    const obj = {}
    const result = deepSearchKey(obj, 'anyKey')
    expect(result).toBeNull()
  })

  test('Handles null or undefined objects', () => {
    const resultNull = deepSearchKey(null, 'anyKey')
    expect(resultNull).toBeNull()

    const resultUndefined = deepSearchKey(undefined, 'anyKey')
    expect(resultUndefined).toBeNull()
  })
})
