import { checkObjMatch, checkIsEqual } from './ObjectHelpers'
import { remapArrayToLowerCaseIfString } from './Util'

export const findByObj = (arr: any[], obj: any, asBoolean: boolean = false): any => {
  for(const item of arr) {
    if(!checkObjMatch(item, obj)) continue
    return asBoolean ? true : item
  }
  return false
}

export const findByString = (arr: any[], item: any, asBoolean: boolean = false): any => {
  for(const arrItem of arr) {
    if(typeof(arrItem) === 'string' && typeof(item) === 'string') {
      if(arrItem.toLowerCase() == item.toLowerCase()) return asBoolean ? true : arrItem
    } 

    if(arrItem == item) {
      return asBoolean ? true : arrItem
    }
  }
  return false
}

export const find = (arr: any[], query: any, asBoolean: boolean = false): any => {
  if(Array.isArray(query) ) return false
  if(typeof(query) === 'object') return findByObj(arr, query, asBoolean)
  return findByString(arr, query, asBoolean)
}

export const findIndex = (arr: any[], query: any): number => {
  if(typeof(query) === 'object') {
    const findedByObj = findByObj(arr, query)
    return findedByObj != false ? arr.indexOf(findedByObj) : -1 
  }
  const findedByString = findByString(arr, query)
  return findedByString !== false ? arr.indexOf(findedByString) : -1  
}

export const findAll = (arr: any[], query: any, ignoreEmptyArray: boolean = false): any[] => {
  if (!query) return arr
  return arr.filter((item) => {
    const itemToMatch = typeof(item) === 'string' ? item.toLowerCase() : item
    if(typeof(query) == 'string') return checkIsEqual(item, query)
    if(Array.isArray(query)) return remapArrayToLowerCaseIfString(query).includes(itemToMatch) ? true : false
    return checkObjMatch(item, query, !ignoreEmptyArray) ? true : false
  })
}

export const removeAll = (arr: any[], query: any, ignoreEmptyArray: boolean = true): any[] => {
  if (!query) return arr
  return arr.filter((item) => {
    const itemToMatch = typeof(item) === 'string' ? item.toLowerCase() : item
    if(typeof(query) === 'string') return !checkIsEqual(item, query)
    if(Array.isArray(query)) return remapArrayToLowerCaseIfString(query).includes(itemToMatch) ? false : true
    return checkObjMatch(item, query, ignoreEmptyArray) ? false : true
  })
}

export const remove = (arr: any[], query: any = null): any => {
  if (!query) return arr
  const index = findIndex(arr, query)
  if(index > -1) arr.splice(index, 1)
  return arr
}

export const uniqueByKey = (arr: any[], query: any = null): any[] => {
  const uniqueItems = []
  for(const item of arr) {
    let search
    if(!query) {
      search = item
    } else if(typeof(query) === 'string') {
      search = { [query]: item[query] }
    } else {
      search = query
    }
    const finded = find(uniqueItems, search)
    if(!finded) uniqueItems.push(item)
  }
  return uniqueItems
}

export const objArrayToCsv = (arr: any[], delimiter: string = ','): string => {
  if(!Array.isArray(arr) || typeof(arr[0]) != 'object') throw new Error(`First parameter must be an array of objects`)
  const header = Object.keys(arr[0])
	return [header.join(delimiter) , arr.map(row => header.map(key => row[key]).join(delimiter)).join("\n")].join("\n")
}

export const toggleInArray = (arr: any[], obj: any): any[] => {
  const finded = findIndex(arr, obj)
  if(finded > -1) {
    arr.splice(finded, 1)
  } else {
    arr.push(obj)
  }
  return arr
}

export const compareArray = (arrFrom: any[], arrToCompare: any[], key: string = null): boolean => {
  if(arrFrom.length !== arrToCompare.length) return false
  for(const item of arrFrom) {
    let search
    if(typeof(item) === 'string') {
      search = item
    } else {
      if(typeof(key) !== 'string') throw new Error('Third parameter must be a string')
      search ={ [key]: item[key] }
    }
    const finded = find(arrToCompare, search)
    if(!finded) return false
  }
  return true
}

export const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)) as number
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export const getRandomElement = (list: any[]): any => list[Math.floor(Math.random() * list.length)]

export const chunkArray = (arr: any[], size: number): any[][] => {
  const chunks: any[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

export const getRandomWeithedElementsInArrays = (lists: any[][], weights: number[], count: number): any[] => {
  if (lists.length !== weights.length) {
    throw new Error('Lists and weights arrays must have the same length')
  }
  
  if (lists.length === 0 || weights.length === 0 || count <= 0) {
    return []
  }

  // Criar cópias das listas para não modificar as originais
  const availableLists = lists.map(list => [...list])
  const availableWeights = [...weights]

  // Normalizar os pesos para criar uma distribuição de probabilidade
  const normalizeWeights = (weights: number[]) => {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    if (totalWeight === 0) return weights.map(() => 0)
    return weights.map(weight => weight / totalWeight)
  }

  const result: any[] = []
  
  for (let i = 0; i < count; i++) {
    // Verificar se ainda existem listas com itens
    const listsWithItems = availableLists
      .map((list, index) => ({ list, index, weight: availableWeights[index] }))
      .filter(item => item.list.length > 0)
    
    if (listsWithItems.length === 0) {
      break // Não há mais itens disponíveis
    }

    // Recalcular pesos apenas para listas que ainda têm itens
    const activeWeights = listsWithItems.map(item => item.weight)
    const normalizedWeights = normalizeWeights(activeWeights)
    
    // Criar intervalos acumulativos para seleção por peso
    const cumulativeWeights = []
    let cumulative = 0
    for (const weight of normalizedWeights) {
      cumulative += weight
      cumulativeWeights.push(cumulative)
    }

    const random = Math.random()
    
    // Encontrar qual lista deve ser selecionada baseado no peso
    let selectedListIndex = 0
    for (let j = 0; j < cumulativeWeights.length; j++) {
      if (random <= cumulativeWeights[j]) {
        selectedListIndex = j
        break
      }
    }
    
    // Pegar o índice real da lista original
    const realListIndex = listsWithItems[selectedListIndex].index
    const selectedList = availableLists[realListIndex]
    
    if (selectedList.length > 0) {
      const element = getRandomElement(selectedList)
      result.push(element)
      
      // Remover o elemento selecionado da lista para evitar repetição
      const elementIndex = selectedList.indexOf(element)
      selectedList.splice(elementIndex, 1)
    }
  }
  
  return result
}

export const ArrayHelpers = {
  findByObj,
  findByString,
  find,
  findIndex,
  findAll,
  removeAll,
  remove,
  uniqueByKey,
  objArrayToCsv,
  toggleInArray,
  compareArray,
  shuffle,
  getRandomElement,
  chunkArray,
  getRandomWeithedElementsInArrays
}

