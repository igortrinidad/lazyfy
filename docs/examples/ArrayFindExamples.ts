import { arrays } from './arrays'

export const findString = {
  title: 'ArrayHelpers.find',
  code: `
${ arrays }
result = ArrayHelpers.find(fruits, 'watermelon')
  `
}

export const findObjectCaseInsensitive = {
  title: 'ArrayHelpers.find - case insensitive',
  code: `
${ arrays }
result = ArrayHelpers.find(books, { title: 'ClEaN Code' })
  `
}

export const findAllObject = {
  title: 'ArrayHelpers.findAll -> object',
  code: `
${ arrays }
result = ArrayHelpers.findAll(books, { id: [1, '2'] })
  `
}