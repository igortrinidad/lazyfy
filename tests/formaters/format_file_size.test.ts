import { formatFileSize } from '../../src'

describe('formatFileSize', () => {
  test('should return "0 Bytes" for zero input', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
    expect(formatFileSize('0')).toBe('0 Bytes')
  })

  test('should return "0 Bytes" for null, undefined, or empty string', () => {
    // @ts-ignore - Testing runtime behavior with invalid types
    expect(formatFileSize(null)).toBe('0 Bytes')
    // @ts-ignore - Testing runtime behavior with invalid types
    expect(formatFileSize(undefined)).toBe('0 Bytes')
    expect(formatFileSize('')).toBe('0 Bytes')
  })

  test('should format bytes correctly', () => {
    expect(formatFileSize(1)).toBe('1 Bytes')
    expect(formatFileSize(512)).toBe('512 Bytes')
    expect(formatFileSize(1023)).toBe('1023 Bytes')
    expect(formatFileSize('512')).toBe('512 Bytes')
  })

  test('should format KB correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(formatFileSize(2048)).toBe('2 KB')
    expect(formatFileSize(1048575)).toBe('1024 KB')
  })

  test('should format MB correctly', () => {
    expect(formatFileSize(1048576)).toBe('1 MB')
    expect(formatFileSize(1572864)).toBe('1.5 MB')
    expect(formatFileSize(2097152)).toBe('2 MB')
    expect(formatFileSize(1073741823)).toBe('1024 MB')
  })

  test('should format GB correctly', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB')
    expect(formatFileSize(1610612736)).toBe('1.5 GB')
    expect(formatFileSize(2147483648)).toBe('2 GB')
  })

  test('should format TB correctly', () => {
    expect(formatFileSize(1099511627776)).toBe('1 TB')
    expect(formatFileSize(1649267441664)).toBe('1.5 TB')
  })

  test('should format PB correctly', () => {
    expect(formatFileSize(1125899906842624)).toBe('1 PB')
  })

  test('should handle string inputs', () => {
    expect(formatFileSize('1024')).toBe('1 KB')
    expect(formatFileSize('1048576')).toBe('1 MB')
    expect(formatFileSize('1073741824')).toBe('1 GB')
  })

  test('should handle negative numbers', () => {
    expect(formatFileSize(-1)).toBe('0 Bytes')
    expect(formatFileSize(-1024)).toBe('0 Bytes')
    expect(formatFileSize('-1048576')).toBe('0 Bytes')
  })

  test('should handle invalid string inputs', () => {
    expect(formatFileSize('invalid')).toBe('0 Bytes')
    expect(formatFileSize('abc')).toBe('0 Bytes')
    expect(formatFileSize('123abc')).toBe('0 Bytes')
  })

  test('should handle very large numbers correctly', () => {
    // Test extremely large number that would exceed array bounds
    const veryLargeNumber = Math.pow(1024, 10) // Much larger than PB
    const result = formatFileSize(veryLargeNumber)
    expect(result).toContain('PB') // Should cap at PB
  })

  test('should round to 2 decimal places', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(formatFileSize(1638.4)).toBe('1.6 KB')
    expect(formatFileSize(1638.123456)).toBe('1.6 KB')
  })

  test('should handle fractional inputs', () => {
    expect(formatFileSize(1024.5)).toBe('1 KB')
    expect(formatFileSize(1536.7)).toBe('1.5 KB')
    expect(formatFileSize(0.5)).toBe('0.5 Bytes')
  })

  test('should handle edge case boundary values', () => {
    expect(formatFileSize(1023)).toBe('1023 Bytes')
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1048575)).toBe('1024 KB')
    expect(formatFileSize(1048576)).toBe('1 MB')
    expect(formatFileSize(1073741823)).toBe('1024 MB')
    expect(formatFileSize(1073741824)).toBe('1 GB')
  })
})
