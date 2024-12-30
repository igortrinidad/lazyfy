import { checkSameStructure } from '../../src'

test('Check object has the same structure', () => {
  const objOne = {
    deep: {
      superDeepArray: [
        { title: 'Item 0' },
        { title: 'Item 1' },
        { title: 'Item 2' }
      ]
    }
  }

  const objTwo = {
    deep: {
      superDeepArray: [
        { title: 'Item 0' },
        { title: 'Item 2' }
      ]
    }
  }

  const result = checkSameStructure(objTwo, objOne)
  expect(result).toEqual(true)
})

test('Check object does not has the same structure', () => {
  const objOne = {
    deep: {
      superDeepArray: [
        { title: 'Item 0' },
        { title: 'Item 1' },
        { title: 'Item 2' }
      ]
    }
  }

  const objTwo = {
    deep: {
      another_thing: [
        { title: 'Item 0' },
        { title: 'Item 2' }
      ]
    }
  }

  const result = checkSameStructure(objTwo, objOne)
  expect(result).toEqual(false)
})