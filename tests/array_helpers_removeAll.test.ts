import { ArrayHelpers } from '../src'
import { books, fruits } from './helpers/example_arrays'

test('Remove all items that match based obj query', () => {
  expect(ArrayHelpers.removeAll(books, { category: 'programming' }).length).toBe(1)
  expect(books.length).toBe(3)
})

test('Remove all items that match based obj query', () => {
  expect(ArrayHelpers.removeAll(books, { category: ['programming', 'self help'] }).length).toBe(0)
  expect(books.length).toBe(3)
})

test('Remove all items that match based obj query', () => {
  expect(ArrayHelpers.removeAll(books, { category: ['self help'] }).length).toBe(2)
  expect(books.length).toBe(3)
})

test('Remove all items that match based string query', () => {
  expect(ArrayHelpers.removeAll(fruits, 'watermelon').length).toBe(2)
  expect(fruits.length).toBe(3)
})

test('Remove all items that match based array string query', () => {
  expect(ArrayHelpers.removeAll(fruits, ['watermelon', 'pineapple']).length).toBe(1)
  expect(fruits.length).toBe(3)
})

test('Remove all items that match based array string query', () => {
  expect(ArrayHelpers.removeAll(fruits, ['lemon']).length).toBe(3)
  expect(fruits.length).toBe(3)
})