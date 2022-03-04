const ObjectHelpers = require('../src/ObjectHelpers')

const objFrom = {
  title: 'Some title'
}

test('Define a property to an object', () => {
  const newObj = ObjectHelpers.defineProperty(objFrom, 'subtitle', 'Some subtitle')
  expect(newObj.subtitle).toBe('Some subtitle')
})


