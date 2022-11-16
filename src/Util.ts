export const remapArrayToLowerCaseIfString = (arr: any[] = []) => {
  return arr.map(item => lowerCaseAndStringifyIfNumber(item))
}


export const lowerCaseAndStringifyIfNumber = (item: any) => {
  if(typeof(item) === 'string') return item.toLowerCase()
  if(typeof(item) === 'number') return item.toString()
  return item
}