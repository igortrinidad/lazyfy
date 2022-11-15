import { arrays } from './arrays'


export const findString = {
  id: 'array_find_string',
  title: 'ArrayHelpers.find -> string',
  code: `
${ arrays }

result = ArrayHelpers.find(fruits, 'watermelon')
  `
}

export const findAllObject = {
  id: 'array_find_all_object',
  title: 'ArrayHelpers.findAll -> object',
  code: `
${ arrays }

result = ArrayHelpers.findAll(books, { id: [1, '2'] })
  `
}


export const arrayFindExamples = [findString, findAllObject]