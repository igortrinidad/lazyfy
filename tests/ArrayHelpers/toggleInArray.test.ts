import { ArrayHelpers } from '../../src'
import { BookInterface, books, fruits } from '../helpers/example_arrays'

const beforeBooksLength = books.length
const beforeFruitsLength = fruits.length

test('Toggle obj in array twice', () => {
  const toggleArr: BookInterface[] = []
  const item = books[0]
  expect(ArrayHelpers.toggleInArray(toggleArr, item).length).toBe(1)
  expect(ArrayHelpers.toggleInArray(toggleArr, item).length).toBe(0)
})

test('Toggle string in array some times', () => {
  const toggleArr = [ ...fruits ]
  const item = fruits[0]
  expect(ArrayHelpers.toggleInArray(toggleArr, 'lemon').length).toBe(beforeFruitsLength+1)
  expect(ArrayHelpers.toggleInArray(toggleArr, 'lemon').length).toBe(beforeFruitsLength)
  expect(ArrayHelpers.toggleInArray(toggleArr, 'watermelon').length).toBe(beforeFruitsLength-1)
})

test('Toggle obj in array adding one more item to the final array cause it didnt exist at first', () => {
  const toggleArr = [ ...books ]
  const item = { ...books[0], id: 'asdasdasd' }
  expect(ArrayHelpers.toggleInArray(toggleArr, item).length).toBe(beforeBooksLength+1)
  expect(ArrayHelpers.toggleInArray(toggleArr, item).length).toBe(beforeBooksLength)
})