export const remapArrayToLowerCaseIfString = (arr: any[] = []) => {
  return arr.map(item => {
    if(typeof(item) === 'string') return item.toLowerCase()
    if(typeof(item) === 'number') return item.toString()
    return item
  })
}