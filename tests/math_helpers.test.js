const MathHelpers = require('../src/MathHelpers')

test('get 25 as percentage of 100', () => {
  expect(MathHelpers.getPercentageOfAmount(100, 25)).toBe(25);
})

test('get 34.50% as percentage of 100', () => {
  expect(MathHelpers.getPercentageOfAmount(100, 34.5, true)).toBe('34.50%');
})

test('get value of a amount percentage', () => {
  expect(MathHelpers.getAmountOfPercentage(1250, 10)).toBe(125);
  expect(MathHelpers.getAmountOfPercentage(1250, 12.45)).toBe(155.625);
  expect(MathHelpers.getAmountOfPercentage(10924, 0.0127)).toBe(1.3873479999999998);
})

test('add proportional percetange value for a given amount', () => {
  expect(MathHelpers.addPercentage(2450, 10)).toBe(2695);
})

test('get value or min percetange of a given amount', () => {
  expect(MathHelpers.getValueOrMinPercentage(100, 20, 10)).toBe(20);
  expect(MathHelpers.getValueOrMinPercentage(2000, 5, 10)).toBe(200);
})