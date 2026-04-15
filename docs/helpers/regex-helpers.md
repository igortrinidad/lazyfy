# Regex Helpers

Utility functions for extracting values from strings using regular expressions.

## Installation

```ts
import { RegexHelpers } from '@igortrindade/lazyfy'
// or individually:
import { extractMatchs, extractUuidsV4 } from '@igortrindade/lazyfy'
```

---

## extractMatchs

Extracts all unique regex matches from a string.

**Signature:**
```ts
extractMatchs(text: string, regex: RegExp): string[]
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | `string` | Input string to search |
| `regex` | `RegExp` | Regular expression with the global `g` flag |

**Examples:**
```ts
// Extract all hashtags
RegexHelpers.extractMatchs('I love #javascript and #typescript', /#\w+/g)
// ['#javascript', '#typescript']

// Extract all email addresses
RegexHelpers.extractMatchs(
  'Contact us at hello@example.com or support@example.com',
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
)
// ['hello@example.com', 'support@example.com']

// Duplicates are automatically removed
RegexHelpers.extractMatchs('cat cat dog cat', /\b\w+\b/g)
// ['cat', 'dog']
```

---

## extractUuidsV4

Extracts all unique UUID v4 strings from a text.

**Signature:**
```ts
extractUuidsV4(text: string): string[]
```

**Examples:**
```ts
const log = `
  Processing order 550e8400-e29b-41d4-a716-446655440000
  User: 6ba7b810-9dad-41d1-80b4-00c04fd430c8
  Failed for 550e8400-e29b-41d4-a716-446655440000 (duplicate)
`

RegexHelpers.extractUuidsV4(log)
// [
//   '550e8400-e29b-41d4-a716-446655440000',
//   '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
// ]
// Note: duplicates are removed automatically
```

::: tip
UUID v4 format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` where `y` is `8`, `9`, `a`, or `b`.
:::
