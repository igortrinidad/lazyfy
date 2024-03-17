/*
 * igortrinidad/vue-number-format
 *
 * (c) Igor Trindade <igortrindade.me@gmail.com>
 * 
 * Mostly of this file content was extracted from the https://github.com/maico910/vue-number-format/blob/vite-typescript-refactor/src/utils.ts
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import defaultOptions, { type NumberFormatOptions } from './types/NumberFormatOptions'

export const formatNumber = (input: string | number | null = '0', opt: Partial<NumberFormatOptions> = {}) => {
  const mergedOptions = {...defaultOptions, ...opt};

  let inputInString;

  if (!!input) {
    if (typeof input === 'number' && !mergedOptions.isInteger) {
      inputInString = input.toFixed(fixed(mergedOptions.precision))
    } else {
      inputInString = input.toString()
    }
  } else {
    inputInString = ''
  }


  const minusSymbol = isNegative(inputInString, mergedOptions.acceptNegative)  ? '-' : ''
  const numbers = inputOnlyNumbers(inputInString.toString())
  const currencyInString = numbersToCurrency(numbers, mergedOptions.precision)

  const currencyParts = currencyInString.split('.')
  const decimal = currencyParts[1]
  const integer = addThousandSeparator(currencyParts[0], mergedOptions.thousand)

  return minusSymbol + mergedOptions.prefix + joinIntegerAndDecimal(integer, decimal, mergedOptions.decimal) + mergedOptions.suffix
}

export const unformatNumber = (input: string | number | null = 0, opt: Partial<NumberFormatOptions> = {}) => {
  const mergedOptions = Object.assign({}, defaultOptions, opt);

  const userInput = input || 0;

  const numbers = inputOnlyNumbers(userInput)

  if(mergedOptions.isInteger) {
    return parseInt(`${isNegative(userInput, mergedOptions.acceptNegative) ? '-' : ''}${numbers.toString()}`)
  }

  const makeNumberNegative = (isNegative(userInput, mergedOptions.acceptNegative))
  const currency = numbersToCurrency(numbers, mergedOptions.precision)
  return makeNumberNegative ? parseFloat(currency) * - 1 : parseFloat(currency)
}

function inputOnlyNumbers (input: string | number = 0) {
  return input ? input.toString().replace(/\D+/g, '') : '0'
}

// 123 RangeError: toFixed() digits argument must be between 0 and 20 at Number.toFixed
function fixed(precision: number) {
  return Math.max(0, Math.min(precision, 20))
}

function numbersToCurrency (numbers: string, precision: number) {
  const exp = Math.pow(10, precision)
  const float = parseFloat(numbers) / exp
  return float.toFixed(fixed(precision))
}

function addThousandSeparator (integer: string, separator: string) {
  return integer.replace(/(\d)(?=(?:\d{3})+\b)/gm, `$1${separator}`)
}

function joinIntegerAndDecimal (integer: string, decimal: string, separator: string) {
  if (decimal) {
    return integer + separator + decimal;
  }

  return integer;
}

function isNegative(string: number | string, acceptNegative = true) {
  if(!acceptNegative) return false

  const value = string.toString();
  const isNegative = (value.startsWith('-') || value.endsWith('-'))
  const forcePositive = value.indexOf('+') > 0

  return isNegative && !forcePositive
}

export const NumberFormat = {
  formatNumber,
  unformatNumber,
}