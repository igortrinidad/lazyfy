# Number Format

Functions to format and unformat currency/numeric strings with customizable separators, prefix, suffix, and precision.

## Installation

```ts
import { NumberFormat } from '@igortrindade/lazyfy'
// or individually:
import { formatNumber, unformatNumber } from '@igortrindade/lazyfy'
```

---

## Default Options

Both `formatNumber` and `unformatNumber` accept an options object. The default values are:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefix` | `string` | `'US$ '` | String prepended to the number |
| `suffix` | `string` | `''` | String appended to the number |
| `decimal` | `string` | `'.'` | Decimal separator character |
| `thousand` | `string` | `','` | Thousand separator character |
| `precision` | `number` | `2` | Number of decimal digits |
| `acceptNegative` | `boolean` | `true` | Allow negative numbers |
| `isInteger` | `boolean` | `false` | Treat the number as an integer (no decimals) |

---

## formatNumber

Formats a number or numeric string into a human-readable currency/number string.

**Signature:**
```ts
formatNumber(input?: string | number | null, opt?: Partial<TypeNumberFormatOptions>): string
```

**Examples:**

```ts
// Default (US dollar format)
NumberFormat.formatNumber(1234.56)
// 'US$ 1,234.56'

// Brazilian Real
NumberFormat.formatNumber(1234.56, {
  prefix: 'R$ ',
  decimal: ',',
  thousand: '.'
})
// 'R$ 1.234,56'

// No prefix, custom precision
NumberFormat.formatNumber(9999.999, { prefix: '', precision: 3 })
// '9,999.999'

// Integer mode
NumberFormat.formatNumber(1234, { prefix: '', isInteger: true })
// '1,234'

// With suffix (e.g. percentage)
NumberFormat.formatNumber(75, { prefix: '', suffix: '%', precision: 0 })
// '75%'

// Negative value
NumberFormat.formatNumber(-500, { prefix: 'US$ ' })
// '-US$ 500.00'
```

---

## unformatNumber

Parses a formatted string back into a JavaScript `number`.

**Signature:**
```ts
unformatNumber(input?: string | number | null, opt?: Partial<TypeNumberFormatOptions>): number
```

**Examples:**

```ts
// Default (US dollar format)
NumberFormat.unformatNumber('US$ 1,234.56')
// 1234.56

// Brazilian Real
NumberFormat.unformatNumber('R$ 1.234,56', {
  decimal: ',',
  thousand: '.'
})
// 1234.56

// Integer mode
NumberFormat.unformatNumber('1,234', { isInteger: true })
// 1234

// Negative value
NumberFormat.unformatNumber('-US$ 500.00')
// -500

// Returns 0 for null/empty
NumberFormat.unformatNumber(null)
// 0
```

---

## Common Locale Configurations

```ts
// Brazilian Real (BRL)
const brlOptions = {
  prefix: 'R$ ',
  decimal: ',',
  thousand: '.',
  precision: 2,
}

// Euro (EUR)
const eurOptions = {
  prefix: '€ ',
  decimal: ',',
  thousand: '.',
  precision: 2,
}

// Plain integer (no currency)
const integerOptions = {
  prefix: '',
  isInteger: true,
}

// Percentage
const percentOptions = {
  prefix: '',
  suffix: '%',
  precision: 1,
}
```
