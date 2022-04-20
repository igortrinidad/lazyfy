const NumberHelpers = require('../src/NumberHelpers')

test('Format a given number as default options', () => {
  expect(NumberHelpers.formatNumber(123.45)).toEqual('US$ 123.45')
  expect(NumberHelpers.formatNumber(100123.45)).toEqual('US$ 100,123.45')
})

test('Format a given number as default options', () => {
  expect(NumberHelpers.unformatNumber('US$ 100,123.45')).toEqual(100123.45)
  expect(NumberHelpers.unformatNumber('1.230,66')).toEqual(1230.66)
})


