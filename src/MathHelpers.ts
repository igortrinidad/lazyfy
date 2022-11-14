
/**
 * 
 * get amount of a given % of a value
 */
export const getAmountOfPercentage = (amount: number | null, percentage: number | null) => {
  return Number(amount / 100 * percentage)
}

/**
 * 
 * get the % of a given amount and value
 */
export const getPercentageOfAmount = (amount: number, value: number, percentageSign: boolean = false, digits:number = 2): number | string => {
  const result = Number(100 / amount * value)
  if(!percentageSign) return result
  if(isNaN(Number( result / 100 ))) return Number(result/100)
  return Number( result / 100 ).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: digits })
}

export const round = (value: number, decimals: number = 2) => {
  var p = Math.pow(10, decimals)
  return Math.round(value * p) / p
}

export const randomInt = (max: number, min: number = 0) => {
	return min + Math.floor((max - min) * Math.random());
}

/**
 * add a raw percentage value to a number
 */
export const addPercentage = (value: number, percentage: string | number) => {
  const pct = typeof(percentage) === 'string' ? parseFloat(percentage) : percentage
  return value * (1 + (pct / 100))
}

/**
 * 
 * returns a min value using a percentage as references
 */
export const getValueOrMinPercentage = (amount: number, value: number, percentage: number = 10) => {
  if((amount / 100 * percentage) > value) return getAmountOfPercentage(amount, percentage)
  return value
}