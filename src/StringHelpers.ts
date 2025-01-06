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

function levenshtein(a: string, b: string) {
  const matrix = []

  for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1]
          } else {
              matrix[i][j] = Math.min(
                  matrix[i - 1][j - 1] + 1,
                  Math.min(
                      matrix[i][j - 1] + 1,
                      matrix[i - 1][j] + 1
                  )
              )
          }
      }
  }

  return matrix[b.length][a.length]
}

export const checkStringSimilarity = (base: string, stringToCompare: string, caseInsensitive: boolean = true): number => {
  if(caseInsensitive) {
    base = base.toLowerCase()
    stringToCompare = stringToCompare.toLowerCase()
  }
  const distance = levenshtein(base, stringToCompare)
  const maxLen = Math.max(base.length, stringToCompare.length)
  const similarity = 1 - distance / maxLen
  return similarity
}

export const checkStringIsSimilar = (base: string, stringToCompare: string, threshold: number = 0.8, caseInsensitive: boolean = true): boolean => {
  return checkStringSimilarity(base, stringToCompare, caseInsensitive) >= threshold
}

export const ensureStartsWithUpperCase = (str = '') => {
  if (!str) return ''
  const trimmedStart = str.trimStart()
  return str.slice(0, str.length - trimmedStart.length) + trimmedStart[0].toUpperCase() + trimmedStart.slice(1)
}

export const truncateText = (text: string = '', max: number = 40) => {
  try {
    if(!text) return ''
    if(max <= 0) return text + '...'
    return text.length > max ? `${text.substring(0, max)}...` : text
  } catch (error) {
    return text || ''
  }
}

export const StringHelpers = {
  titleCaseString,
  randomString,
  joinCommaPlusAnd,
  checkStringSimilarity,
  checkStringIsSimilar,
  ensureStartsWithUpperCase,
  truncateText,
}