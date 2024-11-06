import { ObjectHelpers } from '../../src'

const objFrom: any = {
  title: 'Some title',
  action: () => {
    console.log('Some action')
  },
  deep: {
    deepTitle: 'Some deep title',
    deepAction: () => {
      console.log('Some deep action')
    },
    superDeep: {
      superDeepTitle: 'Some super deep title',
      superDeepAction: () => {
        console.log('Some super deep action')
      }
    }
  },
  arr: [{
    arrTitle: 'Some arr title'
  }]
}

test('Returns a merged object with same attributes', () => {
  const deepTitle = 'New deep title'
  const mergedObj = ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.deepTitle', deepTitle)
  expect(mergedObj.deep.deepTitle).toBe(deepTitle)
})

test('Throws error updating non existing keys', () => {
  const superDeepTitle = 'New deep title'
  expect(() => {
    ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.deepTitle.superDeepTitle', superDeepTitle)
  }).toThrow("Cannot set property 'deepTitle' on non-object type (string) at path 'deep.deepTitle'")
})

test('Returns a merged object with same attributes', () => {
  const superDeepTitle = 'New super deep title'
  const mergedObj = ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.superDeep.superDeepTitle', superDeepTitle)
  expect(mergedObj.deep.superDeep.superDeepTitle).toBe(superDeepTitle)
})

test('Returns a merged object with created attributes', () => {
  const objFrom: any = {
    title: 'Some title',
  }
  const extremeNewObjectTitle = 'New extreme deep title'
  const expected = {
    ...objFrom,
    deep: {
      superDeep: {
        extremeDeep: {
          extremeDeepTitle: extremeNewObjectTitle
        }
      }
    }
  }
  const mergedObj = ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.superDeep.extremeDeep.extremeDeepTitle', extremeNewObjectTitle)
  expect(mergedObj.deep.superDeep.extremeDeep.extremeDeepTitle).toBe(extremeNewObjectTitle)
  expect(mergedObj).toEqual(expected)
})

test('Throws an error if a non-object type is encountered in the path', () => {
  const objFrom = { deep: { superDeep: 'Not an object' } }
  const value = 'New Title'

  expect(() => {
    ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.superDeep.extremeDeep.title', value)
  }).toThrow("Cannot set property 'superDeep' on non-object type (string) at path 'deep.superDeep'")
})

test('Handles array indices in the path, creating and updating array elements', () => {
  const objFrom: any = {}
  const value = 'Array Item Title'
  const expected = {
    deep: {
      superDeepArray: [
        undefined,
        undefined,
        { title: 'Array Item Title' }
      ]
    }
  }

  const mergedObj = ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.superDeepArray[2].title', value, true)
  expect(mergedObj).toEqual(expected)
})

test('Updates an existing array index', () => {
  const objFrom: any = {
    deep: {
      superDeepArray: [
        { title: 'Old Title 0' },
        { title: 'Old Title 1' },
        { title: 'Old Title 2' }
      ]
    }
  }
  const newValue = 'Updated Title 1'
  const expected = {
    deep: {
      superDeepArray: [
        { title: 'Old Title 0' },
        { title: 'Updated Title 1' },  // Updated value
        { title: 'Old Title 2' }
      ]
    }
  }

  const mergedObj = ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.superDeepArray[1].title', newValue)
  expect(mergedObj).toEqual(expected)
})

test('Adds to an empty array at a specific index', () => {
  const objFrom: any = {
    deep: {
      superDeepArray: []  // Start with an empty array
    }
  }
  const value = 'New Title at Index 3'
  const expected = {
    deep: {
      superDeepArray: [
        undefined,
        undefined,
        undefined,
        { title: 'New Title at Index 3' }  // Added at index 3
      ]
    }
  }

  const mergedObj = ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.superDeepArray[3].title', value, true)
  expect(mergedObj).toEqual(expected)
})

test('Updates multiple array indices, filling in gaps', () => {
  const objFrom: any = {
    deep: {
      superDeepArray: [
        { title: 'Existing Title 0' },
        undefined,
        { title: 'Existing Title 2' }  // Only index 0 and 2 are defined
      ]
    }
  }
  const value1 = 'Updated Title 1'
  const value2 = 'Updated Title 3'
  const expected = {
    deep: {
      superDeepArray: [
        { title: 'Existing Title 0' },
        { title: 'Updated Title 1' },  // New title added at index 1
        { title: 'Existing Title 2' },
        { title: 'Updated Title 3' }   // New title added at index 3
      ]
    }
  }

  // Update index 1
  ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.superDeepArray[1].title', value1, true)
  // Update index 3
  const mergedObj = ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.superDeepArray[3].title', value2, true)

  expect(mergedObj).toEqual(expected)
})

test('Throws an error if the specified array index does not exist', () => {
  const objFrom: any = {
    deep: {
      superDeepArray: [
        { title: 'Existing Title 0' },
        { title: 'Existing Title 1' }
      ]
    }
  }

  expect(() => {
    ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.superDeepArray[3].title', 'New Title at Index 3')
  }).toThrow("Array 'superDeepArray' does not have index 3 at path 'deep.superDeepArray[3]'")
})

test('Adds to an empty array at a specific index', () => {
  const arrayFrom = [] as any[]
  const title = 'Some title'
  const mergedObj = ObjectHelpers.setNestedObjectByKey(arrayFrom, '0', { title }, true)
  expect(mergedObj[0].title).toEqual(title)
})

test('Set object key on null key', () => {
  const objFrom: any = {
    deep: null
  }
  const objectToCompare = {
    deep: {
      title: 'New Title'
    }
  }
  expect(ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.title', 'New Title')).toEqual(objectToCompare)
})

test('Set object key on null key', () => {
  const objFrom: any = null
  const objectToCompare = {
    deep: {
      title: 'New Title'
    }
  }
  const result = ObjectHelpers.setNestedObjectByKey(objFrom, 'deep.title', 'New Title')
  expect(result).toEqual(objectToCompare)
})



