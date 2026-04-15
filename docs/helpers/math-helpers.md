# Math Helpers

Utility functions for percentage calculations, rounding, random integers, and value clamping.

## Installation

```ts
import { MathHelpers } from '@igortrindade/lazyfy'
// or individually:
import { getAmountOfPercentage, getPercentageOfAmount, round, randomInt, addPercentage, getValueOrMinPercentage } from '@igortrindade/lazyfy'
```

---

## getAmountOfPercentage

Returns the absolute amount that corresponds to a given percentage of a value.

$$result = \frac{amount \times percentage}{100}$$

**Signature:**
```ts
getAmountOfPercentage(amount: number, percentage: number | string): number
```

**Examples:**
```ts
MathHelpers.getAmountOfPercentage(200, 10)   // 20
MathHelpers.getAmountOfPercentage(1500, 15)  // 225
MathHelpers.getAmountOfPercentage(100, '7')  // 7 (string input accepted)
```

---

## getPercentageOfAmount

Returns what percentage `value` is of `amount`. Optionally formats as a percentage string.

$$result = \frac{100}{amount} \times value$$

**Signature:**
```ts
getPercentageOfAmount(
  amount: number,
  value: number,
  percentageSign?: boolean,
  digits?: number,
  returnWhenAmountIsZero?: null | string | number
): number | string
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `amount` | `number` | — | The total/base value |
| `value` | `number` | — | The partial value |
| `percentageSign` | `boolean` | `false` | Return a formatted `%` string |
| `digits` | `number` | `2` | Decimal digits when formatting as string |
| `returnWhenAmountIsZero` | `null \| string \| number` | `'--'` | Value to return when `amount` is `0` |

**Examples:**
```ts
MathHelpers.getPercentageOfAmount(200, 50)             // 25
MathHelpers.getPercentageOfAmount(200, 50, true)        // '25.00%'
MathHelpers.getPercentageOfAmount(0, 50)               // '--'
MathHelpers.getPercentageOfAmount(0, 50, false, 2, 0)  // 0
```

---

## round

Rounds a number to a given number of decimal places.

**Signature:**
```ts
round(value: number, decimals?: number): number
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `number` | — | Number to round |
| `decimals` | `number` | `2` | Number of decimal places |

**Examples:**
```ts
MathHelpers.round(3.14159)    // 3.14
MathHelpers.round(3.14159, 4) // 3.1416
MathHelpers.round(2.005, 2)   // 2.01
MathHelpers.round(100, 0)     // 100
```

---

## randomInt

Returns a random integer between `min` (inclusive) and `max` (exclusive).

**Signature:**
```ts
randomInt(max: number, min?: number): number
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `max` | `number` | — | Upper bound (exclusive) |
| `min` | `number` | `0` | Lower bound (inclusive) |

**Examples:**
```ts
MathHelpers.randomInt(10)       // integer between 0 and 9
MathHelpers.randomInt(10, 5)    // integer between 5 and 9
MathHelpers.randomInt(100, 50)  // integer between 50 and 99
```

---

## addPercentage

Increases a value by a given percentage.

$$result = value \times \left(1 + \frac{percentage}{100}\right)$$

**Signature:**
```ts
addPercentage(value: number, percentage: string | number): number
```

**Examples:**
```ts
MathHelpers.addPercentage(100, 10)   // 110
MathHelpers.addPercentage(200, 50)   // 300
MathHelpers.addPercentage(500, '5')  // 525
```

---

## getValueOrMinPercentage

Returns `value` as-is, unless it is less than a minimum percentage of `amount` — in which case it returns that minimum amount.

**Signature:**
```ts
getValueOrMinPercentage(amount: number, value: number, percentage?: number): number
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `amount` | `number` | — | The base amount |
| `value` | `number` | — | The value to check |
| `percentage` | `number` | `10` | Minimum percentage of `amount` |

**Examples:**
```ts
// value (5) is less than 10% of 200 (20), so return 20
MathHelpers.getValueOrMinPercentage(200, 5, 10)  // 20

// value (50) is greater than 10% of 200 (20), so return 50
MathHelpers.getValueOrMinPercentage(200, 50, 10) // 50

// Useful for minimum fee enforcement:
const orderTotal = 150
const discount = 5
const minDiscount = MathHelpers.getValueOrMinPercentage(orderTotal, discount, 5)
// Ensures discount is at least 5% of 150 = 7.5
```
