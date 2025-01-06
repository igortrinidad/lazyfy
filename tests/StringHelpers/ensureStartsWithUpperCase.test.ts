import { StringHelpers } from '../../src'

describe('StringHelpers.ensureStartsWithUpperCase', () => {
  test('Should capitalize the first letter of a lowercase string', () => {
    expect(StringHelpers.ensureStartsWithUpperCase('hello')).toBe('Hello')
  })

  test('Should not change a string that already starts with an uppercase letter', () => {
    expect(StringHelpers.ensureStartsWithUpperCase('Hello')).toBe('Hello')
  })

  test('Should handle strings starting with non-alphabetic characters', () => {
    expect(StringHelpers.ensureStartsWithUpperCase('123abc')).toBe('123abc')
  })

  test('Should handle empty strings gracefully', () => {
    expect(StringHelpers.ensureStartsWithUpperCase('')).toBe('')
  })

  test('Should capitalize the first letter of a single-character string', () => {
    expect(StringHelpers.ensureStartsWithUpperCase('h')).toBe('H')
  })

  test('Should not modify a string that starts with a space followed by an uppercase letter', () => {
    expect(StringHelpers.ensureStartsWithUpperCase(' Hello')).toBe(' Hello')
  })

  test('Should capitalize the first letter in a string with leading whitespace', () => {
    expect(StringHelpers.ensureStartsWithUpperCase('   hello')).toBe('   Hello')
  })
})
