import maskit from './maskit'
import dynamicMask from './dynamic-mask'
import tokens from './tokens'

export const masker = function (value: any, mask: any, masked = true) {

  value = String(value)
  
  return Array.isArray(mask)
    ? dynamicMask(maskit, mask, tokens)(value, mask, masked, tokens)
    : maskit(value, mask, masked, tokens)
    
}