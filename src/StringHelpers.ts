export const titleCaseString = (str: string): string => {
  return str.toString().split(' ').map((str) => str.toUpperCase().charAt(0) + str.substring(1).toLowerCase()).join(' ')
}

export const randomString = (length: number): string => {
  var result           = ''
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const joinCommaPlusAnd = (a: Array<any>, unifierString = ' and ') => {
  return [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(a.length < 2 ? '' : unifierString)
}

export const StringHelpers = {
  titleCaseString,
  randomString,
  joinCommaPlusAnd
}