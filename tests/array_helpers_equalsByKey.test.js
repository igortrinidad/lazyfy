const ArrayHelpers = require('../src/ArrayHelpers')
const { books, fruits } = require('./helpers/example_arrays')

test('Returns false in different array length', () => {
  const duplicated = [ ...books, ...books ]
  expect(ArrayHelpers.compareArray(duplicated, books, 'id')).toBe(false)
})

test('Returns false if the array has a different value on the key attribute', () => {
  const arrToCompare = JSON.parse(JSON.stringify(books))
  arrToCompare[0]['id'] = 'changed value to get false'
  expect(ArrayHelpers.compareArray(books, arrToCompare, 'id')).toBe(false)
})

test('Returns true if the array has a different value on the key attribute', () => {
  const arrToCompare = JSON.parse(JSON.stringify(books))
  expect(ArrayHelpers.compareArray(books, arrToCompare, 'id')).toBe(true)
})

test('Returns false if the array has a different value on the key attribute', () => {
  const arrToCompare = JSON.parse(JSON.stringify(fruits))
  arrToCompare[0] = 'lemon'
  expect(ArrayHelpers.compareArray(fruits, arrToCompare)).toBe(false)
})

test('Returns true if the array has a different value on the key attribute', () => {
  const arrToCompare = JSON.parse(JSON.stringify(fruits))
  expect(ArrayHelpers.compareArray(fruits, arrToCompare)).toBe(true)
})

