import { NumberFormat } from '../src'

test('Format a given number as default options', () => {
  expect(NumberFormat.formatNumber(123.45)).toEqual('US$ 123.45')
  expect(NumberFormat.formatNumber(100123.45)).toEqual('US$ 100,123.45')
  expect(NumberFormat.formatNumber(100.45)).toEqual('US$ 100.45')
  expect(NumberFormat.formatNumber(-100.45, { acceptNegative: true })).toEqual('-US$ 100.45')
})

test('Format a given number as default options', () => {
  expect(NumberFormat.unformatNumber('US$ 100,123.45')).toEqual(100123.45)
  expect(NumberFormat.unformatNumber('1.230,66')).toEqual(1230.66)
  expect(NumberFormat.unformatNumber('1.985,00')).toEqual(1985)
  expect(NumberFormat.unformatNumber('1.985,00')).toEqual(1985.00)
  expect(NumberFormat.unformatNumber('$200,00')).toEqual(200)
  expect(NumberFormat.unformatNumber('$200,00', { precision: 0 })).toEqual(20000)
})

test('Format a given number as default options', () => {
  expect(NumberFormat.formatNumber(123.45, { prefix: '', suffix: ' kg', precision: 3 })).toEqual('123.450 kg')
  expect(NumberFormat.formatNumber(123.45, { prefix: '', suffix: '', precision: 0 })).toEqual('123')
  expect(NumberFormat.formatNumber(123.55, { prefix: '', suffix: '', precision: 0 })).toEqual('124')
})

test('Test rouding', () => {
  expect(NumberFormat.formatNumber(123.49, { prefix: '', suffix: ' GB', precision: 0 })).toEqual('123 GB')
  expect(NumberFormat.formatNumber(123.59, { prefix: '', suffix: ' GB', precision: 0 })).toEqual('124 GB')
})

test('Test NaN fix', () => {
  expect(NumberFormat.formatNumber('asdasd', { prefix: '', suffix: '', precision: 0, isInteger: true, acceptNegative: false, thousand: '', decimal: '' })).toEqual('NaN')
})


