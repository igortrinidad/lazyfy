import { getNestedObjectByKey } from '../../src'

const obj = {
  deep: {
    superDeep: {
      superDeepTitle: 'Super Deep Title',
      superDeepArray: [
        { title: 'Super Deep Item 0' },
        { title: 'Super Deep Item 1' },
        { title: 'Super Deep Item 2' }
      ],
      extremeDeep: {
        extremeDeepTitle: 'Extreme Deep Title',
        extremeDeepArray: [
          { title: 'Extreme Deep Item 0' },
          { title: 'Extreme Deep Item 1' },
          { title: 'Extreme Deep Item 2' }
        ]
      }
    }
  }
}

test('Get object attr by key', () => {
  expect(getNestedObjectByKey(obj, 'deep.superDeep.superDeepTitle')).toBe(obj.deep.superDeep.superDeepTitle)
  expect(getNestedObjectByKey(obj, 'deep.superDeep.superDeepArray[1].title')).toBe(obj.deep.superDeep.superDeepArray[1].title)
  expect(getNestedObjectByKey(obj, 'deep.superDeep.extremeDeep.extremeDeepTitle')).toBe(obj.deep.superDeep.extremeDeep.extremeDeepTitle)
  expect(getNestedObjectByKey(obj, 'deep.superDeep.extremeDeep.extremeDeepArray[1].title')).toBe(obj.deep.superDeep.extremeDeep.extremeDeepArray[1].title)
})

test('Returns undefined for non existing obj or array keys', () => {
  expect(getNestedObjectByKey(obj, 'deep.superDeep.nonExistentKey')).toBe(undefined)
  expect(getNestedObjectByKey(obj, 'deep.superDeep.extremeDeep.extremeDeepArray[12].title')).toBe(undefined)
})

