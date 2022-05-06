const ArrayHelpers = require('../src/ArrayHelpers')
const { fruits, books } = require('./helpers/example_arrays')

test('Find array objs based obj query', () => {
  expect(ArrayHelpers.find(books, { id: 1 })).toEqual(books[0])
  expect(ArrayHelpers.find(books, { ...books[1] })).toEqual(books[1])
  expect(ArrayHelpers.find(books, { ...books[1] }, true)).toEqual(true)
})

test('Find array objs based obj query', () => {
  expect(ArrayHelpers.find(books, { id: 1 })).toEqual(books[0])
  expect(ArrayHelpers.find(books, { title: 'ClEaN Code' })).toEqual(books[0])
})

test('Find simple array based string', () => {
  expect(ArrayHelpers.find(fruits, 'pineApple')).toEqual(fruits[2])
})

test('Returns false if has array on query parameter', () => {
  expect(ArrayHelpers.find(fruits, ['error'])).toEqual(false)
})

test('Return false finding undefined item on array', () => {
  expect(ArrayHelpers.find(fruits, 'lemon')).toEqual(false)
})

test('Return false finding undefined item on array', () => {
  const arrToTestTypes = ['1', 2, 3]
  expect(ArrayHelpers.find(arrToTestTypes, 2)).toEqual(2)
  expect(ArrayHelpers.find(arrToTestTypes, '2')).toEqual(2)
  expect(ArrayHelpers.find(arrToTestTypes, 1)).toEqual('1')
  expect(ArrayHelpers.find(arrToTestTypes, '1', true)).toEqual(true)
})

