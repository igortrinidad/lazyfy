import { ArrayHelpers } from '../../src'
import { books, fruits } from '../helpers/example_arrays'

describe('ArrayHelpers.chunkArray', () => {
  test('Chunks array of objects into equal sized groups', () => {
    const chunks = ArrayHelpers.chunkArray(books, 3)
    expect(chunks.length).toBe(3)
    expect(chunks[0].length).toBe(3)
    expect(chunks[1].length).toBe(3)
    expect(chunks[2].length).toBe(2)
    expect(chunks[0]).toEqual([books[0], books[1], books[2]])
    expect(chunks[1]).toEqual([books[3], books[4], books[5]])
    expect(chunks[2]).toEqual([books[6], books[7]])
  })

  test('Chunks array of strings into equal sized groups', () => {
    const chunks = ArrayHelpers.chunkArray(fruits, 2)
    expect(chunks.length).toBe(2)
    expect(chunks[0].length).toBe(2)
    expect(chunks[1].length).toBe(1)
    expect(chunks[0]).toEqual(['strawberry', 'watermelon'])
    expect(chunks[1]).toEqual(['pineapple'])
  })

  test('Chunks array with size equal to array length', () => {
    const chunks = ArrayHelpers.chunkArray(fruits, 3)
    expect(chunks.length).toBe(1)
    expect(chunks[0].length).toBe(3)
    expect(chunks[0]).toEqual(fruits)
  })

  test('Chunks array with size larger than array length', () => {
    const chunks = ArrayHelpers.chunkArray(fruits, 5)
    expect(chunks.length).toBe(1)
    expect(chunks[0].length).toBe(3)
    expect(chunks[0]).toEqual(fruits)
  })

  test('Chunks array with size 1 creates individual elements', () => {
    const chunks = ArrayHelpers.chunkArray(fruits, 1)
    expect(chunks.length).toBe(3)
    expect(chunks[0]).toEqual(['strawberry'])
    expect(chunks[1]).toEqual(['watermelon'])
    expect(chunks[2]).toEqual(['pineapple'])
  })

  test('Returns empty array when input array is empty', () => {
    const chunks = ArrayHelpers.chunkArray([], 3)
    expect(chunks).toEqual([])
    expect(chunks.length).toBe(0)
  })

  test('Handles large arrays correctly', () => {
    const largeArray = Array.from({ length: 100 }, (_, i) => i + 1)
    const chunks = ArrayHelpers.chunkArray(largeArray, 7)
    expect(chunks.length).toBe(15)
    expect(chunks[0].length).toBe(7)
    expect(chunks[14].length).toBe(2)
    expect(chunks[0]).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(chunks[14]).toEqual([99, 100])
  })

  test('Preserves original array structure and data types', () => {
    const mixedArray = [1, 'string', { key: 'value' }, [1, 2, 3], null, undefined, true]
    const chunks = ArrayHelpers.chunkArray(mixedArray, 3)
    expect(chunks.length).toBe(3)
    expect(chunks[0]).toEqual([1, 'string', { key: 'value' }])
    expect(chunks[1]).toEqual([[1, 2, 3], null, undefined])
    expect(chunks[2]).toEqual([true])
  })

  test('Works with array of numbers', () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const chunks = ArrayHelpers.chunkArray(numbers, 4)
    expect(chunks.length).toBe(3)
    expect(chunks[0]).toEqual([1, 2, 3, 4])
    expect(chunks[1]).toEqual([5, 6, 7, 8])
    expect(chunks[2]).toEqual([9, 10])
  })

  test('Works with nested arrays', () => {
    const nestedArrays = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
    const chunks = ArrayHelpers.chunkArray(nestedArrays, 2)
    expect(chunks.length).toBe(3)
    expect(chunks[0]).toEqual([[1, 2], [3, 4]])
    expect(chunks[1]).toEqual([[5, 6], [7, 8]])
    expect(chunks[2]).toEqual([[9, 10]])
  })

  test('Handles single element array', () => {
    const singleElement = ['only-element']
    const chunks = ArrayHelpers.chunkArray(singleElement, 5)
    expect(chunks.length).toBe(1)
    expect(chunks[0]).toEqual(['only-element'])
  })

  test('Chunks array perfectly divisible by chunk size', () => {
    const perfectArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12]
    const chunks = ArrayHelpers.chunkArray(perfectArray, 5)
    expect(chunks.length).toBe(2)
    expect(chunks[0].length).toBe(5)
    expect(chunks[1].length).toBe(5)
    expect(chunks[0]).toEqual([1, 2, 3, 4, 5])
    expect(chunks[1]).toEqual([6, 7, 8, 9, 12])
  })

  test('Verifies all original elements are preserved in chunks', () => {
    const originalArray = books.slice()
    const chunks = ArrayHelpers.chunkArray(books, 3)
    const flattenedChunks = chunks.flat()
    
    expect(flattenedChunks.length).toBe(originalArray.length)
    expect(flattenedChunks).toEqual(originalArray)
  })

  test('Works with boolean array', () => {
    const booleans = [true, false, true, false, true]
    const chunks = ArrayHelpers.chunkArray(booleans, 2)
    expect(chunks.length).toBe(3)
    expect(chunks[0]).toEqual([true, false])
    expect(chunks[1]).toEqual([true, false])
    expect(chunks[2]).toEqual([true])
  })
})


