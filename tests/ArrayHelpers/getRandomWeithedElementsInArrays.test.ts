import { ArrayHelpers } from '../../src'
import { books, fruits } from '../helpers/example_arrays'

describe('getRandomWeithedElementsInArrays', () => {
  const { getRandomWeithedElementsInArrays } = ArrayHelpers

  test('should return correct number of elements from weighted arrays with strings', () => {
    const lists = [
      ['apple', 'banana'],
      fruits,
      ['red', 'blue', 'green']
    ]
    const weights = [0.5, 0.3, 0.2]
    const count = 5

    const result = getRandomWeithedElementsInArrays(lists, weights, count)
    
    expect(result).toHaveLength(count)
    expect(result.every(item => typeof item === 'string')).toBe(true)
    
    // Verificar se todos os elementos vieram das listas fornecidas
    const allPossibleElements = lists.flat()
    result.forEach(item => {
      expect(allPossibleElements).toContain(item)
    })
  })

  test('should return correct number of elements from weighted arrays with objects', () => {
    const programmingBooks = books.filter(book => book.category === 'Programming')
    const selfHelpBooks = books.filter(book => book.category === 'Self help')
    
    const lists = [
      programmingBooks,
      selfHelpBooks,
      [{ id: 'test', title: 'Test Book', category: 'Test' }]
    ]
    const weights = [0.7, 0.2, 0.1]
    const count = 3

    const result = getRandomWeithedElementsInArrays(lists, weights, count)
    
    expect(result).toHaveLength(count)
    expect(result.every(item => typeof item === 'object' && item.id && item.title)).toBe(true)
  })

  test('should handle case when requested count exceeds available items', () => {
    const lists = [
      ['apple'],
      ['banana', 'orange'],
      ['grape']
    ]
    const weights = [0.33, 0.33, 0.34]
    const count = 10 // Mais que os 4 itens disponíveis

    const result = getRandomWeithedElementsInArrays(lists, weights, count)
    
    expect(result.length).toBeLessThanOrEqual(4)
    expect(result.length).toBeGreaterThan(0)
  })

  test('should not repeat elements', () => {
    const lists = [
      ['apple', 'banana'],
      ['orange', 'grape'],
      ['kiwi', 'mango']
    ]
    const weights = [0.33, 0.33, 0.34]
    const count = 6 // Todos os elementos disponíveis

    const result = getRandomWeithedElementsInArrays(lists, weights, count)
    
    // Verificar que não há duplicatas
    const uniqueResult = [...new Set(result)]
    expect(result.length).toBe(uniqueResult.length)
  })

  test('should handle empty arrays gracefully', () => {
    const lists = [
      [],
      ['apple', 'banana'],
      []
    ]
    const weights = [0.33, 0.33, 0.34]
    const count = 2

    const result = getRandomWeithedElementsInArrays(lists, weights, count)
    
    expect(result.length).toBeLessThanOrEqual(2)
    expect(result.every(item => ['apple', 'banana'].includes(item))).toBe(true)
  })

  test('should return empty array when all input arrays are empty', () => {
    const lists: any[][] = [[], [], []]
    const weights = [0.33, 0.33, 0.34]
    const count = 5

    const result = getRandomWeithedElementsInArrays(lists, weights, count)
    
    expect(result).toHaveLength(0)
  })

  test('should return empty array when count is 0 or negative', () => {
    const lists = [['apple'], ['banana']]
    const weights = [0.5, 0.5]

    expect(getRandomWeithedElementsInArrays(lists, weights, 0)).toHaveLength(0)
    expect(getRandomWeithedElementsInArrays(lists, weights, -1)).toHaveLength(0)
  })

  test('should throw error when lists and weights have different lengths', () => {
    const lists = [['apple'], ['banana']]
    const weights = [0.5] // Apenas 1 peso para 2 listas

    expect(() => {
      getRandomWeithedElementsInArrays(lists, weights, 1)
    }).toThrow('Lists and weights arrays must have the same length')
  })

  test('should return empty array when no lists or weights provided', () => {
    const emptyLists: any[][] = []
    const emptyWeights: number[] = []
    expect(getRandomWeithedElementsInArrays(emptyLists, emptyWeights, 5)).toHaveLength(0)
  })

  test('should handle single list correctly', () => {
    const lists = [fruits]
    const weights = [1.0]
    const count = 2

    const result = getRandomWeithedElementsInArrays(lists, weights, count)
    
    expect(result.length).toBeLessThanOrEqual(Math.min(count, fruits.length))
    expect(result.every(item => fruits.includes(item))).toBe(true)
  })

  test('should distribute elements according to weights over multiple runs', () => {
    const lists = [
      ['list1'],
      ['list2']
    ]
    const weights = [0.8, 0.2] // 80% vs 20%
    const iterations = 1000
    
    let list1Count = 0
    let list2Count = 0

    // Executar múltiplas vezes para testar distribuição
    for (let i = 0; i < iterations; i++) {
      const result = getRandomWeithedElementsInArrays(lists, weights, 1)
      if (result[0] === 'list1') list1Count++
      if (result[0] === 'list2') list2Count++
    }

    // Com 80% vs 20%, esperamos que list1 apareça mais frequentemente
    // Usando uma margem de tolerância para aleatoriedade
    const list1Percentage = list1Count / iterations
    expect(list1Percentage).toBeGreaterThan(0.7) // Pelo menos 70%
    expect(list1Percentage).toBeLessThan(0.9)    // No máximo 90%
  })
})
