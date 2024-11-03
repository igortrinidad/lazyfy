import { ArrayHelpers } from '../../src'
import { books, fruits } from '../helpers/example_arrays'

test('Find array objs based obj query', () => {
  expect(ArrayHelpers.findIndex(books, { title: 'clean archtecture' })).toBe(1)
})

test('Find index of simple array based on string', () => {
  expect(ArrayHelpers.findIndex(fruits, 'watermelon')).toBe(1)
})

test('Returns -1 finding undefined index of array objs based obj query', () => {
  expect(ArrayHelpers.findIndex(books, { title: 'zero to one' })).toBe(-1)
})