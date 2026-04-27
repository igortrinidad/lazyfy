
export const extractMatchs = (text: string, regex: RegExp): Array<string> => {
  const matches = text.match(regex) || []
  return [...new Set(matches)]
}

export const extractUuidsV4 = (text: string): Array<string> => {
  const regex = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/g
  return extractMatchs(text, regex)
}

export const extractUuidsV7 = (text: string): Array<string> => {
  const regex = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-7[a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}/g
  return extractMatchs(text, regex)
}

export const RegexHelpers = {
  extractMatchs,
  extractUuidsV4,
  extractUuidsV7
}