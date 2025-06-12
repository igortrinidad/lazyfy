import { getObjectMapped } from '../../src'

describe('getObjectMapped', () => {
  test('Maps simple object with string values to array with key property', () => {
    const obj = {
      name: 'John',
      email: 'john@example.com',
      role: 'admin'
    }
    const result = getObjectMapped(obj)
    expect(result).toEqual([
      { key: 'name', 0: 'J', 1: 'o', 2: 'h', 3: 'n' },
      { key: 'email', 0: 'j', 1: 'o', 2: 'h', 3: 'n', 4: '@', 5: 'e', 6: 'x', 7: 'a', 8: 'm', 9: 'p', 10: 'l', 11: 'e', 12: '.', 13: 'c', 14: 'o', 15: 'm' },
      { key: 'role', 0: 'a', 1: 'd', 2: 'm', 3: 'i', 4: 'n' }
    ])
  })

  test('Maps object with nested objects to array preserving nested structure', () => {
    const obj = {
      user1: { name: 'Alice', age: 25 },
      user2: { name: 'Bob', age: 30 },
      user3: { name: 'Charlie', age: 35 }
    }
    const result = getObjectMapped(obj)
    expect(result).toEqual([
      { name: 'Alice', age: 25, key: 'user1' },
      { name: 'Bob', age: 30, key: 'user2' },
      { name: 'Charlie', age: 35, key: 'user3' }
    ])
  })

  test('Maps object with mixed value types', () => {
    const obj = {
      number: 42,
      string: 'hello',
      boolean: true,
      array: [1, 2, 3],
      object: { nested: 'value' }
    }
    const result = getObjectMapped(obj)
    expect(result).toEqual([
      { key: 'number' },
      { key: 'string', 0: 'h', 1: 'e', 2: 'l', 3: 'l', 4: 'o' },
      { key: 'boolean' },
      { key: 'array', 0: 1, 1: 2, 2: 3 },
      { key: 'object', nested: 'value' }
    ])
  })

  test('Maps empty object to empty array', () => {
    const obj = {}
    const result = getObjectMapped(obj)
    expect(result).toEqual([])
  })

  test('Maps object with null and undefined values', () => {
    const obj = {
      nullValue: null,
      undefinedValue: undefined,
      emptyString: '',
      zero: 0
    } as any
    const result = getObjectMapped(obj)
    expect(result).toEqual([
      { key: 'nullValue' },
      { key: 'undefinedValue' },
      { key: 'emptyString' },
      { key: 'zero' }
    ])
  })

  test('Maps object with array values', () => {
    const obj = {
      fruits: ['apple', 'banana', 'orange'],
      numbers: [1, 2, 3, 4, 5],
      mixed: ['text', 42, true, null]
    }
    const result = getObjectMapped(obj)
    expect(result).toEqual([
      { key: 'fruits', 0: 'apple', 1: 'banana', 2: 'orange' },
      { key: 'numbers', 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 },
      { key: 'mixed', 0: 'text', 1: 42, 2: true, 3: null }
    ])
  })

  test('Maps object with deeply nested structure', () => {
    const obj = {
      config: {
        database: {
          host: 'localhost',
          port: 5432
        },
        cache: {
          enabled: true,
          ttl: 3600
        }
      },
      metadata: {
        version: '1.0.0',
        author: 'John Doe'
      }
    }
    const result = getObjectMapped(obj)
    expect(result).toEqual([
      {
        key: 'config',
        database: {
          host: 'localhost',
          port: 5432
        },
        cache: {
          enabled: true,
          ttl: 3600
        }
      },
      {
        key: 'metadata',
        version: '1.0.0',
        author: 'John Doe'
      }
    ])
  })

  test('Handles object with numeric keys', () => {
    const obj = {
      1: { value: 'first' },
      2: { value: 'second' },
      10: { value: 'tenth' }
    }
    const result = getObjectMapped(obj)
    expect(result).toEqual([
      { value: 'first', key: '1' },
      { value: 'second', key: '2' },
      { value: 'tenth', key: '10' }
    ])
  })

  test('Handles object where key property would be overwritten', () => {
    const obj = {
      item1: { key: 'original', name: 'Alice' },
      item2: { key: 'existing', name: 'Bob' }
    }
    const result = getObjectMapped(obj)
    expect(result).toEqual([
      { key: 'item1', name: 'Alice' },
      { key: 'item2', name: 'Bob' }
    ])
  })

  test('Works with default empty object parameter', () => {
    const result = getObjectMapped()
    expect(result).toEqual([])
  })

  test('Works with undefined input', () => {
    const result = getObjectMapped(undefined)
    expect(result).toEqual([])
  })


  test('Maps object with special characters in keys', () => {
    const obj = {
      'special-key': { value: 1 },
      'key_with_underscore': { value: 2 },
      'key with spaces': { value: 3 },
      'key.with.dots': { value: 4 }
    }
    const result = getObjectMapped(obj)
    expect(result).toEqual([
      { value: 1, key: 'special-key' },
      { value: 2, key: 'key_with_underscore' },
      { value: 3, key: 'key with spaces' },
      { value: 4, key: 'key.with.dots' }
    ])
  })

  test('Preserves order of keys in original object', () => {
    const obj = {
      z: { order: 1 },
      a: { order: 2 },
      m: { order: 3 }
    }
    const result = getObjectMapped(obj)
    expect(result).toEqual([
      { order: 1, key: 'z' },
      { order: 2, key: 'a' },
      { order: 3, key: 'm' }
    ])
    expect(result.map(item => item.key)).toEqual(['z', 'a', 'm'])
  })

  test('Maps object with function values', () => {
    const fn1 = () => 'hello'
    const fn2 = function() { return 'world' }
    const obj = {
      func1: fn1,
      func2: fn2
    }
    const result = getObjectMapped(obj)
    expect(result).toEqual([
      { key: 'func1' },
      { key: 'func2' }
    ])
  })

  test('Maps object with Date values', () => {
    const date1 = new Date('2023-01-01')
    const date2 = new Date('2024-01-01')
    const obj = {
      startDate: date1,
      endDate: date2
    }
    const result = getObjectMapped(obj)
    expect(result).toEqual([
      { key: 'startDate' },
      { key: 'endDate' }
    ])
  })
})
