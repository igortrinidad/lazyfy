import { titleCaseToSnakeCase, StringHelpers } from '../../src'

describe('titleCaseToSnakeCase', () => {
  test('Should convert a simple TitleCase string to snake_case', () => {
    expect(titleCaseToSnakeCase('HelloWorld')).toBe('hello_world')
  })

  test('Should convert a multi-word TitleCase string to snake_case', () => {
    expect(titleCaseToSnakeCase('MyVariableName')).toBe('my_variable_name')
  })

  test('Should handle a single word TitleCase string', () => {
    expect(titleCaseToSnakeCase('Title')).toBe('title')
  })

  test('Should handle a single lowercase word without changes', () => {
    expect(titleCaseToSnakeCase('hello')).toBe('hello')
  })

  test('Should handle an already snake_case string without adding extra underscores', () => {
    expect(titleCaseToSnakeCase('hello_world')).toBe('hello_world')
  })

  test('Should be accessible via StringHelpers object', () => {
    expect(StringHelpers.titleCaseToSnakeCase('TitleCase')).toBe('title_case')
  })
})
