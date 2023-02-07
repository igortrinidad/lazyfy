const RegexHelpers = require('../src/RegexHelpers')

test('Extract uuids from string', () => {
  const text = "Here's a UUID v4 tag: e77f4e76-5435-48e5-a49d-50d5429b3655 and fd9ed62f-87fb-4a45-b9aa-ef554a7e6cb7 and 54fce589-be4e-4aa8-95a4-d3df809a52e1"
  expect(RegexHelpers.extractUuidsV4(text).length).toBe(3)
})