const StringHelpers = require('../src/StringHelpers')

test('titleCaseString', () => {
  const firstName = 'Igor'
  const lastName = 'Trindade'

  expect(StringHelpers.titleCaseString(firstName + ' ' + lastName)).toBe('Igor Trindade')
})

test('randomString', () => {
  expect(StringHelpers.randomString(123).length).toBe(123)
})