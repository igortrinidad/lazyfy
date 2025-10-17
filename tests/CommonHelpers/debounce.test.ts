import { debounce } from '../../src/CommonHelpers'

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should delay function execution', () => {
    const mockCallback = jest.fn()
    const debouncedFn = debounce(mockCallback, 300)

    debouncedFn()
    expect(mockCallback).not.toHaveBeenCalled()

    jest.advanceTimersByTime(300)
    expect(mockCallback).toHaveBeenCalledTimes(1)
  })

  it('should cancel previous calls when called multiple times', () => {
    const mockCallback = jest.fn()
    const debouncedFn = debounce(mockCallback, 300)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    jest.advanceTimersByTime(300)
    expect(mockCallback).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments correctly', () => {
    const mockCallback = jest.fn()
    const debouncedFn = debounce(mockCallback, 300)

    debouncedFn('arg1', 'arg2', 123)

    jest.advanceTimersByTime(300)
    expect(mockCallback).toHaveBeenCalledWith('arg1', 'arg2', 123)
  })

  it('should work with different timeout values', () => {
    const mockCallback = jest.fn()
    const debouncedFn = debounce(mockCallback, 500)

    debouncedFn()

    jest.advanceTimersByTime(400)
    expect(mockCallback).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(mockCallback).toHaveBeenCalledTimes(1)
  })

  it('should use default timeout of 300ms when not specified', () => {
    const mockCallback = jest.fn()
    const debouncedFn = debounce(mockCallback)

    debouncedFn()

    jest.advanceTimersByTime(299)
    expect(mockCallback).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1)
    expect(mockCallback).toHaveBeenCalledTimes(1)
  })

  it('should handle functions with return values', () => {
    const mockCallback = jest.fn().mockReturnValue('result')
    const debouncedFn = debounce(mockCallback, 300)

    debouncedFn()
    jest.advanceTimersByTime(300)

    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveReturnedWith('result')
  })

  it('should handle rapid consecutive calls', () => {
    const mockCallback = jest.fn()
    const debouncedFn = debounce(mockCallback, 300)

    // Simulate rapid typing/clicking
    for (let i = 0; i < 10; i++) {
      debouncedFn(`call-${i}`)
      jest.advanceTimersByTime(50)
    }

    // Only the last call should be pending
    jest.advanceTimersByTime(300)
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith('call-9')
  })
})