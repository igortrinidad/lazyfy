export const remapArrayToLowerCaseIfString = (arr: any[] = []) => {
  return arr.map(item => {
    if(typeof(item) === 'string') return item.toLowerCase()
    return item
  })
}