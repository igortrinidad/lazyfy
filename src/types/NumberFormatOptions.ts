export interface NumberFormatOptions {
  prefix: string
  suffix: string
  decimal: string
  thousand: string
  precision: number
  acceptNegative: boolean
  isInteger: boolean
  vueVersion?: string
}

const defaultOptions: NumberFormatOptions = {
  prefix: 'US$ ',
  suffix: '',
  decimal: '.',
  thousand: ',',
  precision: 2,
  acceptNegative: true,
  isInteger: false
}

export default defaultOptions