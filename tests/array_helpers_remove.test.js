const ArrayHelpers = require('../src/ArrayHelpers')
const { fruits, books } = require('./helpers/example_arrays')

test('Remove an item from array and return the array without the item', () => {
  expect(ArrayHelpers.remove(books, { title: 'Clean Code' }).length).toBe(2)
  expect(books.length).toBe(2)
  expect(books[0].title).toBe('Clean Archtecture')
})

