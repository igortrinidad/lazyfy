const StringHelpers = require('../src/StringHelpers')

test('StringHelpers', () => {
  const firstName = 'Igor'
  const lastName = 'Trindade'

  expect(StringHelpers.titleCaseString(firstName + ' ' + lastName)).toBe('Igor Trindade')
})