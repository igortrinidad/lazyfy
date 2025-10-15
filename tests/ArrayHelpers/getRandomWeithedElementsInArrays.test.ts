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

  test('should handle weights that sum to more than 1.0 (100%)', () => {
    const lists = [
      ['apple', 'banana'],
      ['orange', 'grape'],
      ['kiwi', 'mango']
    ]
    const weights = [0.5, 0.8, 0.7] // Soma = 2.0 (200%)
    const count = 3

    // Deve funcionar normalmente, normalizando os pesos
    const result = getRandomWeithedElementsInArrays(lists, weights, count)
    
    expect(result).toHaveLength(count)
    
    // Verificar se todos os elementos vieram das listas fornecidas
    const allPossibleElements = lists.flat()
    result.forEach(item => {
      expect(allPossibleElements).toContain(item)
    })
  })

  test('should normalize weights correctly when sum exceeds 1.0', () => {
    const lists = [
      ['weight1'],
      ['weight2']
    ]
    const weights = [1.5, 0.5] // Soma = 2.0, então normalizado seria [0.75, 0.25]
    const iterations = 1000
    
    let weight1Count = 0
    let weight2Count = 0

    for (let i = 0; i < iterations; i++) {
      const result = getRandomWeithedElementsInArrays(lists, weights, 1)
      if (result[0] === 'weight1') weight1Count++
      if (result[0] === 'weight2') weight2Count++
    }

    // Com pesos [1.5, 0.5] normalizados para [0.75, 0.25]
    // Esperamos que weight1 apareça cerca de 75% das vezes
    const weight1Percentage = weight1Count / iterations
    expect(weight1Percentage).toBeGreaterThan(0.65) // Pelo menos 65%
    expect(weight1Percentage).toBeLessThan(0.85)    // No máximo 85%
  })

  test('should handle weights that sum to less than 1.0', () => {
    const lists = [
      ['low1'],
      ['low2']
    ]
    const weights = [0.1, 0.2] // Soma = 0.3 (30%)
    const iterations = 1000
    
    let low1Count = 0
    let low2Count = 0

    for (let i = 0; i < iterations; i++) {
      const result = getRandomWeithedElementsInArrays(lists, weights, 1)
      if (result[0] === 'low1') low1Count++
      if (result[0] === 'low2') low2Count++
    }

    // Com pesos [0.1, 0.2] normalizados para [0.33, 0.67]
    // Esperamos que low2 apareça cerca de 67% das vezes
    const low2Percentage = low2Count / iterations
    expect(low2Percentage).toBeGreaterThan(0.57) // Pelo menos 57%
    expect(low2Percentage).toBeLessThan(0.77)    // No máximo 77%
  })

  test('should return all available items when count exceeds total items', () => {
    const lists = [
      ['item1', 'item2'],
      ['item3'],
      ['item4', 'item5', 'item6']
    ]
    const weights = [0.4, 0.3, 0.3]
    const totalItems = 6
    const count = 20 // Muito mais que os 6 itens disponíveis

    const result = getRandomWeithedElementsInArrays(lists, weights, count)
    
    // Deve retornar exatamente todos os itens disponíveis
    expect(result).toHaveLength(totalItems)
    
    // Verificar que todos os itens estão presentes
    const allItems = lists.flat()
    expect(result.sort()).toEqual(allItems.sort())
    
    // Não deve haver duplicatas
    const uniqueResult = [...new Set(result)]
    expect(result.length).toBe(uniqueResult.length)
  })

  test('should respect weights distribution even when count exceeds available items', () => {
    const lists = [
      ['heavy1', 'heavy2', 'heavy3', 'heavy4'], // 4 itens com peso alto
      ['light1'] // 1 item com peso baixo
    ]
    const weights = [0.9, 0.1] // 90% vs 10%
    const count = 10 // Mais que os 5 itens disponíveis
    const iterations = 1000

    let heavyItemsCount = 0
    let lightItemsCount = 0

    for (let i = 0; i < iterations; i++) {
      const result = getRandomWeithedElementsInArrays(lists, weights, count)
      
      // Contar quantos itens vieram de cada lista
      result.forEach(item => {
        if (item.startsWith('heavy')) heavyItemsCount++
        if (item.startsWith('light')) lightItemsCount++
      })
    }

    // Mesmo pegando todos os itens, a distribuição deve favorecer os itens "heavy"
    // Como temos 4 itens heavy vs 1 light, e peso 90% vs 10%
    // Os itens heavy devem aparecer mais vezes nas primeiras seleções
    const totalSelections = heavyItemsCount + lightItemsCount
    const heavyPercentage = heavyItemsCount / totalSelections
    
    // Deve favorecer os itens com peso maior
    expect(heavyPercentage).toBeGreaterThan(0.75) // Pelo menos 75%
  })

  test('should handle edge case with single item and high count', () => {
    const lists = [
      ['only-item']
    ]
    const weights = [1.0]
    const count = 100

    const result = getRandomWeithedElementsInArrays(lists, weights, count)
    
    // Deve retornar apenas o único item disponível
    expect(result).toHaveLength(1)
    expect(result[0]).toBe('only-item')
  })

  test('should handle mixed empty and non-empty arrays when count exceeds items', () => {
    const lists = [
      [], // Array vazio
      ['available1', 'available2'], // 2 itens
      [], // Array vazio
      ['available3'] // 1 item
    ]
    const weights = [0.25, 0.25, 0.25, 0.25]
    const count = 10 // Mais que os 3 itens disponíveis

    const result = getRandomWeithedElementsInArrays(lists, weights, count)
    
    expect(result).toHaveLength(3) // Apenas os 3 itens disponíveis
    expect(result).toContain('available1')
    expect(result).toContain('available2') 
    expect(result).toContain('available3')
  })
})
