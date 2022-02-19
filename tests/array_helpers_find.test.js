const ArrayHelpers = require('../src/ArrayHelpers')
const { fruits, books } = require('./helpers/example_arrays')

test('Find array objs based obj query', () => {
  expect(ArrayHelpers.find(books, { id: 1 })).toBe(books[0])
  expect(ArrayHelpers.find(books, { title: 'Clean Code' })).toBe(books[0])
})

test('Find simple array based string', () => {
  expect(ArrayHelpers.find(fruits, 'pineapple')).toBe(fruits[2])
})

test('Return false finding undefined item on array', () => {
  expect(ArrayHelpers.find(fruits, 'lemon')).toBe(false)
})

