const ObjectHelpers = require('../src/ObjectHelpers')

const objFrom = {
  title: 'Some title',
  action: () => {
    console.log('Some action')
  },
  deep: {
    deepTitle: 'Some deep title',
    deepAction: () => {
      console.log('Some deep action')
    }
  },
  arr: [{
    arrTitle: 'Some arr title'
  }]
}

test('Returns a merged object with same attributes', () => {
  const objToMerge = {
    title: 'New title'
  }
  const mergedObj = ObjectHelpers.deepMergeObject(objToMerge, objFrom)
  expect(mergedObj.title).toBe(objToMerge.title)
  expect(mergedObj.deep.title).toBe(objFrom.deep.title)
  expect(objFrom.title).toBe(objFrom.title)
})

test('Returns a merged object an changing the attributes of the main object', () => {
  const objToMerge = {
    title: 'New title',
    deep: {
      deepTitle: 'New deep title'
    }
  }
  const mergedObj = ObjectHelpers.deepMergeObject(objToMerge, objFrom, false)
  expect(objFrom.title).toBe(mergedObj.title)
  expect(objFrom.deep.title).toBe(mergedObj.deep.title)
})

test('it should test if the obj from keep the same array structure without changing after the merge', () => {
  const objToMerge = {
    title: 'New title',
    deep: {
      deepTitle: 'New deep title'
    },
    arr: [{
      arrTitle: 'Some new arr title'
    }]
  }
  const mergedObj = ObjectHelpers.deepMergeObject(objToMerge, objFrom)
  expect(objFrom.arr[0].title).toBe(objFrom.arr[0].title)
  expect(mergedObj.arr[0].title).toBe(objToMerge.arr[0].title)
})

