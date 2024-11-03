import { ArrayHelpers } from '../../src'
import { books } from '../helpers/example_arrays'

test('Remove an item from array and return the array without the item', () => {
  const beforeBooksLength = books.length
  expect(ArrayHelpers.remove(books, { title: 'Clean Code' }).length).toBe(beforeBooksLength-1)
  expect(books.length).toBe(beforeBooksLength-1)
  expect(books[0].title).toBe('Clean Archtecture')
})

