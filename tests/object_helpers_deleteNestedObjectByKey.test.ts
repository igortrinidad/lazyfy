import { deleteNestedObjectByKey } from '../src/ObjectHelpers'

test('Deletes an array element by index', () => {
  const obj = {
    deep: {
      superDeepArray: [
        { title: 'Item 0' },
        { title: 'Item 1' },
        { title: 'Item 2' }
      ]
    }
  }

  const result = deleteNestedObjectByKey(obj, 'deep.superDeepArray[1]')
  expect(result).toEqual({
    deep: {
      superDeepArray: [
        { title: 'Item 0' },
        { title: 'Item 2' }
      ]
    }
  })
})

test('Deletes an object key by path', () => {
  const obj = {
    deep: {
      superDeepObj: {
        nestedKey: 'Nested Value',
        anotherKey: 'Another Value'
      }
    }
  }

  const result = deleteNestedObjectByKey(obj, 'deep.superDeepObj.nestedKey')
  expect(result).toEqual({
    deep: {
      superDeepObj: {
        anotherKey: 'Another Value'
      }
    }
  })
})

test('Throws error when trying to delete a non-existent property', () => {
  const obj = {
    deep: {}
  }

  expect(() => {
    deleteNestedObjectByKey(obj, 'deep.nonExistentKey')
  }).toThrowError(/Cannot delete non-existent property 'nonExistentKey'/)
})

test('Throws error when trying to delete an array element with an out-of-bounds index', () => {
  const obj = {
    deep: {
      superDeepArray: [ { title: 'Item 0' } ]
    }
  }

  expect(() => {
    deleteNestedObjectByKey(obj, 'deep.superDeepArray[2]')
  }).toThrowError(/Array 'superDeepArray' does not have index 2/)
})
