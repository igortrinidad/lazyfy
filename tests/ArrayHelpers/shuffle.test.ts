import { ArrayHelpers } from '../../src'
import { books, fruits } from '../helpers/example_arrays'

test('Returns the shuffled array', () => {
  const duplicated = [ ...books ]
  const shuffled = ArrayHelpers.shuffle(duplicated)
  const isDifferent = books.some((book, index) => book !== shuffled[index])
  expect(isDifferent).toBe(true)
  expect(shuffled.length).toBe(books.length)
})


