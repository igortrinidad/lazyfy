const StringHelpers = require('../src/StringHelpers')

test('Returns similar strings using threshold', () => {
  const targetString = 'hello'
  const stringsArray = ['hello', 'helloo', 'hallo', 'world', 'helicopter']
  const similars = StringHelpers.findSimilarStrings(targetString, stringsArray, 0.8)
  expect(similars).toEqual(['hello', 'helloo', 'hallo'])
})