const ArrayHelpers = require('../src/ArrayHelpers')
const { fruits, books } = require('./helpers/example_arrays')

test('Find all items that match based obj query', () => {
  expect(ArrayHelpers.findAll(books, { category: 'programming' }).length).toBe(2)
})

test('Find all items that match based obj query', () => {
  expect(ArrayHelpers.findAll(books, { category: 'food and Drinks' }).length).toBe(0)
})

test('Find all items that match based obj query', () => {
  expect(ArrayHelpers.findAll(books, { category: ['programming', 'Self help'] }).length).toBe(3)
})

test('Find all items that match based obj query', () => {
  expect(ArrayHelpers.findAll(books, { category: ['programming', 'Self help'] }).length).toBe(3)
})

test('Find all items that match based obj query returning just one ocurrency', () => {
  expect(ArrayHelpers.findAll(books, { id: 1, category: ['programming', 'Self help'] }).length).toBe(1)
})

test('Find one item that matches the query', () => {
  expect(ArrayHelpers.findAll(fruits, 'watermelon').length).toBe(1)
})

test('Find two item that matches the query', () => {
  expect(ArrayHelpers.findAll(fruits, ['watermelon', 'pineapple']).length).toBe(2)
})

test('Find one item that matches the query', () => {
  expect(ArrayHelpers.findAll(fruits, ['watermelon']).length).toBe(1)
})

test('Find zero item that matches the query', () => {
  expect(ArrayHelpers.findAll(fruits, ['lemon']).length).toBe(0)
})