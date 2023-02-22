const StringHelpers = require('../src/StringHelpers')
import { fruits } from './helpers/example_arrays'

test('titleCaseString', () => {
  const firstName = 'Igor'
  const lastName = 'Trindade'

  expect(StringHelpers.titleCaseString(firstName + ' ' + lastName)).toBe('Igor Trindade')
})

test('randomString', () => {
  expect(StringHelpers.randomString(123).length).toBe(123)
})

test('joinCommaPlusAnd', () => {
  expect(StringHelpers.joinCommaPlusAnd(fruits)).toBe('strawberry, watermelon and pineapple')
  expect(StringHelpers.joinCommaPlusAnd(fruits, ' e ')).toBe('strawberry, watermelon e pineapple')
})