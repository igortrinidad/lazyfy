import { mapArrayToGraphQL } from '../../src'

test('returns empty output for empty array', () => {
  const result = mapArrayToGraphQL([])
  expect(result).toBe('[]')
})

test('generates correct string for single field', () => {
  const result = mapArrayToGraphQL(['id'])
  expect(result).toBe('["id"]')
})

test('generates correct string for multiple fields', () => {
  const result = mapArrayToGraphQL(['id', 'name', 'email'])
  expect(result).toBe('["id","name","email"]')
})

test('generates correct string for multiple fields', () => {
  const result = mapArrayToGraphQL(['id', 'name', 'email'])
  expect(result).toBe('["id","name","email"]')
})

test('generates correct string for multiple fields', () => {

  const items = [
    { id: 1, name: 'John', email: 'john@doe.com' },
    { id: 2, name: 'Jane', email: 'jane@doe.com' }
  ]
  const result = mapArrayToGraphQL(items, 'id')
  expect(result).toBe('["1","2"]')
})


