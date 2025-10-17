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

test('Check string similarity ignoring accents', () => {
  expect(StringHelpers.checkStringSimilarity('Jéssica', 'jessica')).toBe(1)
  expect(StringHelpers.checkStringSimilarity('josé', 'jose')).toBe(1)
  expect(StringHelpers.checkStringSimilarity('joão', 'joao')).toBe(1)
  expect(StringHelpers.checkStringSimilarity('andré', 'andre')).toBe(1)
  expect(StringHelpers.checkStringSimilarity('façanha', 'facanha')).toBe(1)
  expect(StringHelpers.checkStringSimilarity('coração', 'coracao')).toBe(1)
  expect(StringHelpers.checkStringSimilarity('ação', 'acao')).toBe(1)
})

test('Check string is similar ignoring accents', () => {
  expect(StringHelpers.checkStringIsSimilar('Jéssica', 'jessica')).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('josé', 'jose')).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('joão', 'joao')).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('andré', 'andre')).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('façanha', 'facanha')).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('coração', 'coracao')).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('ação', 'acao')).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('María', 'maria')).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('François', 'francois')).toBe(true)
})

test('Check string is similar ignoring accents with case sensitivity', () => {
  expect(StringHelpers.checkStringIsSimilar('Jéssica', 'JESSICA', 0.8, true)).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('Jéssica', 'JESSICA', 0.8, false)).toBe(false)
  expect(StringHelpers.checkStringIsSimilar('josé', 'JOSE', 0.8, true)).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('josé', 'JOSE', 0.8, false)).toBe(false)
})

test('Check string similarity with mixed accents and case variations', () => {
  expect(StringHelpers.checkStringIsSimilar('Jéssica', 'JESSICA')).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('José', 'jose')).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('JOÃO', 'joao')).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('André', 'ANDRE')).toBe(true)
})

test('Check string similarity with accents and threshold', () => {
  // Testa com threshold menor para permitir diferenças maiores
  expect(StringHelpers.checkStringIsSimilar('Jéssica Silva', 'jessica', 0.5)).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('José Antonio', 'jose', 0.3)).toBe(true)
  expect(StringHelpers.checkStringIsSimilar('joão pedro', 'joao', 0.4)).toBe(true)
})