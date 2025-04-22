import { MathHelpers } from '../../src'

test('get 25 as percentage of 100', () => {
  expect(MathHelpers.getPercentageOfAmount(100, 25)).toBe(25);
})

test('get 34.50% as percentage of 100', () => {
  expect(MathHelpers.getPercentageOfAmount(100, 34.5, true)).toBe('34.50%');
})

test('get 12.3456% as percentage of 100 passing 4 digits as parameter', () => {
  expect(MathHelpers.getPercentageOfAmount(100, 12.3456, true, 4)).toBe('12.3456%');
})

test('Return Return zero when getting percentage of zero', () => {
  expect(MathHelpers.getPercentageOfAmount(0, 123, true, 0, 'Return zero')).toBe('Return zero');
  expect(MathHelpers.getPercentageOfAmount(0, 123, true, 0, '--')).toBe('--');
  expect(MathHelpers.getPercentageOfAmount(0, 0, true, 0, '0%')).toBe('0%');
  expect(MathHelpers.getPercentageOfAmount(0, 0, true, 0, 0)).toBe(0);
})

test('get value of a amount percentage', () => {
  expect(MathHelpers.getAmountOfPercentage(1250, 10)).toBe(125);
  expect(MathHelpers.getAmountOfPercentage(1250, 12.45)).toBe(155.625);
  expect(MathHelpers.getAmountOfPercentage(10924, 0.0127)).toBe(1.3873479999999998);
  expect(MathHelpers.getAmountOfPercentage(0, 0)).toBe(0);
  // @ts-ignore
  expect(MathHelpers.getAmountOfPercentage(null, null)).toBe(NaN);
})

test('add proportional percetange value for a given amount', () => {
  expect(MathHelpers.addPercentage(2450, 10)).toBe(2695);
})

test('get value or min percetange of a given amount', () => {
  expect(MathHelpers.getValueOrMinPercentage(100, 20, 10)).toBe(20);
  expect(MathHelpers.getValueOrMinPercentage(2000, 5, 10)).toBe(200);
})

test('get percentage of given amount', () => {
  expect(MathHelpers.getPercentageOfAmount(100, 12.3456)).toBe(12.3456)
  expect(MathHelpers.getPercentageOfAmount(200, 25)).toBe(12.5)
})