import { Masker } from '../../src'

test('Mask multiple phone numbers', () => {
  expect(Masker.mask(31990909090, Masker.DEFAULT_PHONE_MASK)).toEqual('(31) 99090-9090')
  expect(Masker.mask('31990909090', Masker.DEFAULT_PHONE_MASK)).toEqual('(31) 99090-9090')
  expect(Masker.mask('5531990909090', Masker.DEFAULT_PHONE_MASK_WITH_DDI)).toEqual('+55 (31) 99090-9090')
})

test('Unmask multiple phone numbers', () => {
  expect(Masker.unmask('(31) 99090-9090', Masker.DEFAULT_PHONE_MASK)).toEqual('31990909090')
  expect(Masker.unmask('(31) 99090-9090', Masker.DEFAULT_PHONE_MASK)).toEqual('31990909090')
  expect(Masker.unmask('+55 (31) 99090-9090', Masker.DEFAULT_PHONE_MASK_WITH_DDI)).toEqual('5531990909090')
})
