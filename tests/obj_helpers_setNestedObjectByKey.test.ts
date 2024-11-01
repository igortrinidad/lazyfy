import { ObjectHelpers } from '../src'

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



