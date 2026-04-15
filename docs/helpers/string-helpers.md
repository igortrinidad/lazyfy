# String Helpers

Utility functions for string manipulation, formatting, similarity search, and fuzzy matching.

## Installation

```ts
import { StringHelpers } from '@igortrindade/lazyfy'
// or individually:
import { titleCaseString, randomString, joinCommaPlusAnd, checkStringSimilarity, checkStringIsSimilar, ensureStartsWithUpperCase, truncateText, findSimilarItems } from '@igortrindade/lazyfy'
```

---

## titleCaseString

Converts a string to Title Case (first letter of each word capitalized).

**Signature:**
```ts
titleCaseString(str: string): string
```

**Examples:**
```ts
StringHelpers.titleCaseString('hello world')         // 'Hello World'
StringHelpers.titleCaseString('CLEAN CODE is great') // 'Clean Code Is Great'
```

---

## randomString

Generates a random alphanumeric string of the specified length.

**Signature:**
```ts
randomString(length: number): string
```

**Examples:**
```ts
StringHelpers.randomString(8)  // e.g. 'aB3xKp9Z'
StringHelpers.randomString(32) // e.g. 'Kp9Za3xBqRmNvCt7LwYhGjUeDs5OiF2P'
```

---

## joinCommaPlusAnd

Joins an array into a human-readable string separated by commas with a custom conjunction before the last element.

**Signature:**
```ts
joinCommaPlusAnd(a: any[], unifierString?: string): string
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `a` | `any[]` | — | Array of items to join |
| `unifierString` | `string` | `' and '` | Conjunction before the last element |

**Examples:**
```ts
StringHelpers.joinCommaPlusAnd(['Alice', 'Bob', 'Charlie'])
// 'Alice, Bob and Charlie'

StringHelpers.joinCommaPlusAnd(['cats', 'dogs'], ' or ')
// 'cats or dogs'

StringHelpers.joinCommaPlusAnd(['JavaScript'])
// 'JavaScript'
```

---

## checkStringSimilarity

Returns a similarity score between 0 and 1 for two strings using the Levenshtein distance algorithm. Ignores accents by default.

**Signature:**
```ts
checkStringSimilarity(base: string, stringToCompare: string, caseInsensitive?: boolean): number
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `base` | `string` | — | Reference string |
| `stringToCompare` | `string` | — | String to compare against |
| `caseInsensitive` | `boolean` | `true` | Whether to ignore case and accents |

**Examples:**
```ts
StringHelpers.checkStringSimilarity('hello', 'hello') // 1
StringHelpers.checkStringSimilarity('hello', 'helo')  // ~0.8
StringHelpers.checkStringSimilarity('café', 'cafe')   // 1 (accents ignored)
StringHelpers.checkStringSimilarity('abc', 'xyz')     // 0
```

---

## checkStringIsSimilar

Returns `true` if the similarity between two strings meets or exceeds the given threshold.

**Signature:**
```ts
checkStringIsSimilar(base: string, stringToCompare: string, threshold?: number, caseInsensitive?: boolean): boolean
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `base` | `string` | — | Reference string |
| `stringToCompare` | `string` | — | String to compare against |
| `threshold` | `number` | `0.8` | Minimum similarity score (0–1) |
| `caseInsensitive` | `boolean` | `true` | Ignore case and accents |

**Examples:**
```ts
StringHelpers.checkStringIsSimilar('hello', 'helo')        // true  (threshold 0.8)
StringHelpers.checkStringIsSimilar('hello', 'helo', 0.95)  // false (strict threshold)
StringHelpers.checkStringIsSimilar('TypeScript', 'typescript') // true
```

---

## ensureStartsWithUpperCase

Ensures the first non-whitespace character of a string is uppercase, preserving leading spaces.

**Signature:**
```ts
ensureStartsWithUpperCase(str?: string): string
```

**Examples:**
```ts
StringHelpers.ensureStartsWithUpperCase('hello world') // 'Hello world'
StringHelpers.ensureStartsWithUpperCase('  spaces')    // '  Spaces'
StringHelpers.ensureStartsWithUpperCase('')            // ''
```

---

## truncateText

Truncates a string to a maximum length, appending `...` if truncated.

**Signature:**
```ts
truncateText(text?: string, max?: number): string
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | `string` | `''` | The string to truncate |
| `max` | `number` | `40` | Maximum number of characters |

**Examples:**
```ts
StringHelpers.truncateText('Hello, World!', 5)   // 'Hello...'
StringHelpers.truncateText('Short', 40)           // 'Short'
StringHelpers.truncateText('Any text', 0)         // 'Any text...'
StringHelpers.truncateText('', 40)                // ''
```

---

## findSimilarItems

Filters an array of strings or objects returning only items that are similar to the search text. Uses Levenshtein distance with substring matching for better fuzzy search results.

**Signature:**
```ts
findSimilarItems<T>(items: T[], searchText: string, options?: SimilarSearchOptions): T[]
```

**SimilarSearchOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | `number` | `0.8` (or `0.5` if `splitWords`) | Minimum similarity score |
| `caseInsensitive` | `boolean` | `true` | Ignore case and accents |
| `splitWords` | `boolean` | `false` | Split search text into words and match each independently |
| `searchKeys` | `string[]` | `[]` | Object keys to search within (required for object arrays) |

**Examples:**
```ts
// String array
StringHelpers.findSimilarItems(
  ['JavaScript', 'TypeScript', 'Python', 'Ruby'],
  'script'
)
// ['JavaScript', 'TypeScript']

// Object array
const users = [
  { id: 1, name: 'Alice Johnson' },
  { id: 2, name: 'Bob Smith' },
  { id: 3, name: 'Charlie Brown' },
]
StringHelpers.findSimilarItems(users, 'alice', { searchKeys: ['name'] })
// [{ id: 1, name: 'Alice Johnson' }]

// Word splitting
StringHelpers.findSimilarItems(
  ['clean code book', 'clean architecture book', 'pragmatic programmer'],
  'clean book',
  { splitWords: true, searchKeys: [] }
)
// ['clean code book', 'clean architecture book']
```
