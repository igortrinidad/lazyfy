import { masker } from './mask/masker'
import { DEFAULT_PHONE_DDI, DEFAULT_PHONE_MASK, DEFAULT_PHONE_MASK_WITH_DDI} from './mask/enums'

export const mask = (value: any, mask: any) => {
  return masker(value, mask, true)
}

export const unmask = (value: any, mask: any) => {
  return masker(value, mask, false)
}

export const Masker = {
  mask,
  unmask,
  DEFAULT_PHONE_DDI,
  DEFAULT_PHONE_MASK,
  DEFAULT_PHONE_MASK_WITH_DDI
}