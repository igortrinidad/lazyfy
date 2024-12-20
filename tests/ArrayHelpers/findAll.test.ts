import { ArrayHelpers } from '../../src'
import { books, fruits, building_stocks } from '../helpers/example_arrays'

const beforeBooksLength = books.length
const beforeFruitsLength = fruits.length

test('Find all items that match based obj query', () => {
  expect(ArrayHelpers.findAll(books, { category: 'programming' }).length).toBe(beforeBooksLength-1)
})

test('Find all items that match based obj query', () => {
  expect(ArrayHelpers.findAll(books, { category: 'food and Drinks' }).length).toBe(0)
})

test('Find all items that match based obj query', () => {
  expect(ArrayHelpers.findAll(books, { category: ['programming', 'Self help'] }).length).toBe(beforeBooksLength)
})

test('Find all items that match based obj query', () => {
  expect(ArrayHelpers.findAll(books, { category: ['programming', 'Self help'] }).length).toBe(beforeBooksLength)
})

test('Find all items that match based obj query returning just one ocurrency', () => {
  expect(ArrayHelpers.findAll(books, { id: 1, category: ['programming', 'Self help'] }).length).toBe(1)
})

test('Find one item that matches the query', () => {
  expect(ArrayHelpers.findAll(fruits, 'watermelon').length).toBe(1)
})

test('Find two item that matches the query', () => {
  expect(ArrayHelpers.findAll(fruits, ['watermelon', 'pineapple']).length).toBe(2)
})

test('Find one item that matches the query', () => {
  expect(ArrayHelpers.findAll(fruits, ['watermelon']).length).toBe(1)
})

test('Find zero item that matches the query', () => {
  expect(ArrayHelpers.findAll(fruits, ['lemon']).length).toBe(0)
})

test('Find all empty array', () => {
  expect(ArrayHelpers.findAll(books, { category: [] }).length).toBe(0)
})

test('Find building stocks', () => {
  const query = {
    climate_zone_prefix: [2, 3]
  }
  expect(ArrayHelpers.findAll(building_stocks, query).length).toBe(building_stocks.length)
})

test('Find building stocks', () => {
  const query = {
    climate_zone_prefix: ['2', 3]
  }
  expect(ArrayHelpers.findAll(building_stocks, query).length).toBe(building_stocks.length)
})

test('Ignore empty arrays true', () => {
  expect(ArrayHelpers.findAll(building_stocks, { climate_zone_prefix: [] }).length).toBe(0)
})

test('Ignore empty arrays true', () => {
  expect(ArrayHelpers.findAll(building_stocks, { climate_zone_prefix: [] }, false).length).toBe(0)
})

test('Dont ignore empty arrays true', () => {
  expect(ArrayHelpers.findAll(building_stocks, { climate_zone_prefix: [] }, true).length).toBe(4)
})

