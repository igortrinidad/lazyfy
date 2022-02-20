const ArrayHelpers = require('../src/ArrayHelpers')
const { books } = require('./helpers/example_arrays')
const fs = require('fs')
const path = require('path')

test('Returns csv from object array and test if it matches with snapshot', () => {
  const csvSnapshot = fs.readFileSync(path.join(process.cwd(), 'tests/helpers/csv_comma_snapshot.csv'), { encoding:'utf8' })
  expect(ArrayHelpers.objArrayToCsv(books)).toBe(csvSnapshot)
})


test('Returns csv from object array and test if it matches with snapshot', () => {
  const csvSnapshot = fs.readFileSync(path.join(process.cwd(), 'tests/helpers/csv_semicolon_snapshot.csv'), { encoding:'utf8' })
  expect(ArrayHelpers.objArrayToCsv(books, ';')).toBe(csvSnapshot)
})
