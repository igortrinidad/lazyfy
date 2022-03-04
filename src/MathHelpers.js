
/**
 * 
 * get amount of a given % of a value
 */
const getAmountOfPercentage = (amount, percentage) => {
  return amount / 100 * percentage
}
module.exports.getAmountOfPercentage = getAmountOfPercentage

/**
 * 
 * get the % of a given amount and value
 */
const getPercentageOfAmount = (amount, value, percentageSign = false) => {
  const result = 100 / amount * value
  if(!percentageSign) return result
  return Number(result/100).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2})
}
module.exports.getPercentageOfAmount = getPercentageOfAmount

/**
 * add a raw percentage value to a number
 */
const addPercentage = (value, percentage) => {
  return value * (1 + (parseFloat(percentage) / 100))
}
module.exports.addPercentage = addPercentage

/**
 * 
 * returns a min value using a percentage as references
 */
const getValueOrMinPercentage = (amount, value, percentage = 10) => {
  if((amount / 100 * percentage) > value) return getAmountOfPercentage(amount, percentage)
  return value
}
module.exports.getValueOrMinPercentage = getValueOrMinPercentage

module.exports = {
  getAmountOfPercentage,
  getPercentageOfAmount,
  addPercentage,
  getValueOrMinPercentage
}