import { StringHelpers } from '../../src'

test('Check string similarity', () => {
  expect(StringHelpers.checkStringSimilarity('hello', 'hallo')).toBe(0.8)
})

test('Check string is similar', () => {
  expect(StringHelpers.checkStringIsSimilar('hello', 'hallo', 0.8)).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('hello', 'helllo', 0.8)).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('hello', 'hell', 0.8)).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('hello', 'Foo Bar', 0.8)).toBe(false)
})

test('Check string is similar considering case sensitive and insensitive', () => {
  expect(StringHelpers.checkStringIsSimilar('hello', 'HELLO', 0.8)).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('hello', 'HELLO', 0.8, false)).toBe(false)
  expect(StringHelpers.checkStringIsSimilar('hello', 'HALLO', 0.8)).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('hello', 'HALLO', 0.8, false)).toBe(false)
})

test('Returns similar strings using threshold', () => {
  const targetString = 'hello'
  const stringsArray = ['hello', 'helloo', 'hallo', 'world', 'helicopter']
  const similars = stringsArray.filter(str => StringHelpers.checkStringIsSimilar(targetString, str, 0.8))
  expect(similars).toEqual(['hello', 'helloo', 'hallo'])
})