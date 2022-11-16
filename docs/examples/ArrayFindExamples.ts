import { arrays } from './arrays'

export const findString = {
  id: 'array_helpers_find',
  title: 'ArrayHelpers.find',
  code: `
  ${ arrays }
  result = ArrayHelpers.find(fruits, 'watermelon')
  `
}

export const findObjectCaseInsensitive = {
  id: 'array_helpers_find_case',
  title: 'ArrayHelpers.find - case insensitive',
  code: `
  ${ arrays }
  result = ArrayHelpers.find(books, { title: 'ClEaN Code' })
  `
}

export const findAllObject = {
  id: 'array_helpers_find_all',
  title: 'ArrayHelpers.findAll -> object',
  code: `
${ arrays }
result = ArrayHelpers.findAll(books, { id: [1, '2'] })
  `
}