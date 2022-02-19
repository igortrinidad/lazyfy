const ArrayHelpers = require('../src/ArrayHelpers')
const { fruits, books } = require('./helpers/example_arrays')

test('Returns array with unique items based on key query', () => {
  const duplicated = [ ...books, ...books ]
  expect(ArrayHelpers.uniqueByKey(duplicated, 'id')).toEqual(books)
})

test('Returns array with unique items based on query using the object key id', () => {
  const duplicated = [ ...books, ...books ]
  expect(ArrayHelpers.uniqueByKey(duplicated, { id: 1 })).toEqual([books[0]])
  expect(ArrayHelpers.uniqueByKey(duplicated, { id: 1 }).length).toEqual(1)
})

test('Returns array with unique item based on query using the object key id', () => {
  const duplicated = [ ...fruits, ...fruits ]
  expect(ArrayHelpers.uniqueByKey(duplicated, 'strawberry')).toEqual([fruits[0]])
})


