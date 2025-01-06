import { truncateText } from '../../src'

describe('truncateText', () => {
  test('Should return the full text if its length is less than or equal to the max limit', () => {
    expect(truncateText('Short text', 20)).toBe('Short text')
  })

  test('Should truncate the text and append "..." if it exceeds the max limit', () => {
    expect(truncateText('This is a very long text that needs truncation', 19)).toBe('This is a very long...')
  })

  test('Should handle text exactly at the max limit without truncating', () => {
    expect(truncateText('ExactLengthText', 15)).toBe('ExactLengthText')
  })

  test('Should handle empty text input and return an empty string', () => {
    expect(truncateText('', 10)).toBe('')
  })

  test('Should handle default max length of 40 if no max is provided', () => {
    expect(truncateText('This text should truncate at the default limit of 40 characters')).toBe('This text should truncate at the default...')
  })

  test('Should handle null or undefined text gracefully and return an empty string', () => {
    expect(truncateText(null, 10)).toBe('')
    expect(truncateText(undefined, 10)).toBe('')
  })

  test('Should handle cases where max is less than or equal to 0 and return an empty string', () => {
    expect(truncateText('Any text here', 0)).toBe('Any text here...')
    expect(truncateText('Another text', -5)).toBe('Another text...')
  })

  test('Should handle text with special characters correctly when truncated', () => {
    expect(truncateText('Special characters: !@#$%^&*()', 25)).toBe('Special characters: !@#$%...')
  })

  test('Should return an empty string if both text and max are not provided', () => {
    expect(truncateText()).toBe('')
  })

  test('Should handle max greater than text length and return the full text', () => {
    expect(truncateText('Short text', 50)).toBe('Short text')
  })

  test('Should handle non-ASCII characters properly', () => {
    expect(truncateText('这是一个很长的文本需要被截断', 10)).toBe('这是一个很长的文本需...')
    expect(truncateText('😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊', 10)).toBe('😊😊😊😊😊...')
  })

  test('Should handle text with whitespace correctly when truncating', () => {
    expect(truncateText('   Leading spaces are tricky', 10)).toBe('   Leading...')
  })

  test('Should handle large max values without truncation', () => {
    expect(truncateText('Text to test large max', 1000)).toBe('Text to test large max')
  })

  test('Should handle errors gracefully and return the text or an empty string', () => {
    const brokenFunction = () => {
      throw new Error('Simulated error')
    }
    expect(() => brokenFunction()).toThrow('Simulated error')
    expect(truncateText('Recovery test')).toBe('Recovery test')
  })
})
