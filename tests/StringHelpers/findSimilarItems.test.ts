import { findSimilarItems } from '../../src/StringHelpers'

describe('findSimilarItems', () => {
  describe('with array of strings', () => {
    const fruits = ['apple', 'banana', 'orange', 'pineapple']

    it('should find similar strings', () => {
      const result = findSimilarItems(fruits, 'aple')
      expect(result).toContain('apple')
    })

    it('should handle case insensitive search by default', () => {
      const result = findSimilarItems(fruits, 'APPLE')
      expect(result).toContain('apple')
    })

    it('should respect case sensitivity when specified', () => {
      const result = findSimilarItems(fruits, 'APPLE', { caseInsensitive: false })
      expect(result).not.toContain('apple')
    })

    it('should respect threshold parameter', () => {
      const result = findSimilarItems(fruits, 'apl', { threshold: 0.5 })
      expect(result).toContain('apple')
      
      const strictResult = findSimilarItems(fruits, 'apl', { threshold: 0.9 })
      expect(strictResult).toHaveLength(0)
    })
  })

  describe('faq queries', () => {
    const faqs = [
      { question: 'What is your return policy?', answer: 'You can return items within 30 days.' },
      { question: 'How do I track my order?', answer: 'You can track your order in your account.' },
      { question: 'Do you ship internationally?', answer: 'Yes, we ship worldwide.' }
    ]

    it('should search in specified object keys', () => {
      const result = findSimilarItems(faqs, '30', {
        searchKeys: ['answer'],
        splitWords: true
      })
      expect(result).toHaveLength(1)
      expect(result[0].answer).toBe('You can return items within 30 days.')
    })
  })

  describe('with array of objects', () => {
    const users = [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' },
      { name: 'Bob Wilson', email: 'bob@example.com' }
    ]

    it('should return empty array if no searchKeys provided', () => {
      const result = findSimilarItems(users, 'John')
      expect(result).toHaveLength(0)
    })

    it('should search in specified object keys', () => {
      const result = findSimilarItems(users, 'john', {
        searchKeys: ['name'],
        splitWords: true
      })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('John Doe')
    })

    it('should search in multiple keys', () => {
      const result = findSimilarItems(users, 'example', {
        searchKeys: ['name', 'email']
      })
      expect(result).toHaveLength(3)
    })

    it('should handle non-string property values', () => {
      const items = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ]
      const result = findSimilarItems(items, '30', {
        searchKeys: ['name', 'age']
      })
      expect(result).toHaveLength(0)
    })
  })

  describe('with split words feature', () => {
    const products = [
      { title: 'Red Running Shoes', category: 'Sports' },
      { title: 'Blue Tennis Shoes', category: 'Sports' },
      { title: 'Green Dress', category: 'Fashion' }
    ]

    it('should match individual words when splitWords is true', () => {
      const result = findSimilarItems(products, 'red shoes', {
        searchKeys: ['title'],
        splitWords: true
      })
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Red Running Shoes')
    })

    it('should match exact phrase when splitWords is false', () => {
      const result = findSimilarItems(products, 'red shoes', {
        searchKeys: ['title'],
        splitWords: false
      })
      expect(result).toHaveLength(0)
    })

    it('should ignore empty words when splitting', () => {
      const result = findSimilarItems(products, 'red    shoes', {
        searchKeys: ['title'],
        splitWords: true
      })
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Red Running Shoes')
    })
  })

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const result = findSimilarItems([], 'test')
      expect(result).toHaveLength(0)
    })

    it('should handle empty search string', () => {
      const items = ['apple', 'banana']
      const result = findSimilarItems(items, '')
      expect(result).toHaveLength(0)
    })

    it('should handle null values in array', () => {
      const items = [null, 'apple', undefined, 'banana']
      const result = findSimilarItems(items, 'apple')
      expect(result).toHaveLength(1)
      expect(result[0]).toBe('apple')
    })
  })
})