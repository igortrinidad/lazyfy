import { ArrayHelpers } from '../../src'
import { books, fruits } from '../helpers/example_arrays'

test('Get random element from array string', () => {
  const rand = ArrayHelpers.getRandomElement(books)
  const check = ArrayHelpers.find(books, rand)
  expect(rand).toEqual(check)
})

test('Get random element from array object', () => {
  const rand = ArrayHelpers.getRandomElement(fruits)
  const check = ArrayHelpers.find(fruits, rand)
  expect(rand).toEqual(check)
})
