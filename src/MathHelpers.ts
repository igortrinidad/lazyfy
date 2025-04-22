
/**
 * 
 * get amount of a given % of a value
 */
export const getAmountOfPercentage = (amount: number, percentage: number | string) => {
  const pct = getParsedValue(percentage)
  const amt = getParsedValue(amount)
  return Number(amt / 100 * pct)
}

/**
 * 
 * get the % of a given amount and value
 */
export const getPercentageOfAmount = (amount: number, value: number, percentageSign: boolean = false, digits:number = 2, returnWhenAmountIsZero: null | string | number = '--'): number | string => {
  const amt = getParsedValue(amount)
  if(amt === 0 && typeof returnWhenAmountIsZero !== 'undefined') {
    return returnWhenAmountIsZero
  }
  const result = Number(100 / amt * value)
  if(!percentageSign) return result
  if(isNaN(Number( result / 100 ))) return Number(result/100)
  return Number( result / 100 ).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: digits })
}

export const round = (value: number, decimals: number = 2) => {
  const vl = getParsedValue(value)
  var p = Math.pow(10, decimals)
  return Math.round(vl * p) / p
}

export const randomInt = (max: number, min: number = 0) => {
  return min + Math.floor((max - min) * Math.random());
}

/**
 * add a raw percentage value to a number
 */
export const addPercentage = (value: number, percentage: string | number) => {
  const pct = getParsedValue(percentage)
  const vl = getParsedValue(value)
  return vl * (1 + (pct / 100))
}

/**
 * 
 * returns a min value using a percentage as references
 */
export const getValueOrMinPercentage = (amount: number, value: number, percentage: number = 10) => {
  const amt = getParsedValue(amount)
  const vl = getParsedValue(value)
  const pct = getParsedValue(percentage)
  if((amt / 100 * pct) > vl) return getAmountOfPercentage(amt, pct)
  return vl
}

const getParsedValue = (value: number | string): number => {
  return typeof(value) === 'number' ? value : parseFloat(value)
}

export const MathHelpers = {
  getAmountOfPercentage,
  getPercentageOfAmount,
  round,
  randomInt,
  addPercentage,
  getValueOrMinPercentage
}