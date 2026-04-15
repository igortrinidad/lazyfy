# Array Helpers

Utility functions for working with arrays — searching, filtering, manipulating, and generating random elements.

## Installation

```ts
import { ArrayHelpers } from '@igortrindade/lazyfy'
// or individually:
import { find, findAll, findIndex, remove, removeAll, unique, toggleInArray, shuffle, chunkArray, getRandomElement, objArrayToCsv, compareArray, getRandomWeithedElementsInArrays } from '@igortrindade/lazyfy'
```

---

## find

Searches for an element in an array. Works with strings (case-insensitive) and objects (partial match).

**Signature:**
```ts
find(arr: any[], query: any, asBoolean?: boolean): any
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `arr` | `any[]` | — | Source array |
| `query` | `any` | — | String or object to search for |
| `asBoolean` | `boolean` | `false` | Return `true`/`false` instead of the item |

**Examples:**
```ts
const fruits = ['strawberry', 'watermelon', 'pineapple']
ArrayHelpers.find(fruits, 'watermelon') // 'watermelon'
ArrayHelpers.find(fruits, 'WATERMELON') // 'watermelon' (case-insensitive)
ArrayHelpers.find(fruits, 'grape')      // false

const books = [
  { id: 1, title: 'Clean Code', category: 'Programming' },
  { id: 2, title: 'Clean Architecture', category: 'Programming' },
]
ArrayHelpers.find(books, { title: 'clean code' }) // { id: 1, title: 'Clean Code', ... }
ArrayHelpers.find(books, { id: 1 }, true)         // true
```

---

## findIndex

Returns the index of the first matching element, or `-1` if not found.

**Signature:**
```ts
findIndex(arr: any[], query: any): number
```

**Examples:**
```ts
const fruits = ['strawberry', 'watermelon', 'pineapple']
ArrayHelpers.findIndex(fruits, 'watermelon') // 1
ArrayHelpers.findIndex(fruits, 'grape')      // -1

const books = [{ id: 1, title: 'Clean Code' }]
ArrayHelpers.findIndex(books, { id: 1 }) // 0
```

---

## findAll

Filters an array returning all elements that match the query. Works with strings, arrays of values, and objects.

**Signature:**
```ts
findAll(arr: any[], query: any, ignoreEmptyArray?: boolean): any[]
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `arr` | `any[]` | — | Source array |
| `query` | `string \| any[] \| object` | — | Filter criteria |
| `ignoreEmptyArray` | `boolean` | `false` | Ignore empty array values when filtering by object |

**Examples:**
```ts
const books = [
  { id: 1, title: 'Clean Code', category: 'Programming' },
  { id: 2, title: 'Clean Architecture', category: 'Programming' },
  { id: 3, title: 'The Pragmatic Programmer', category: 'Programming' },
  { id: 4, title: 'Atomic Habits', category: 'Self Help' },
]

// Filter by object property
ArrayHelpers.findAll(books, { category: 'Programming' })
// Returns all 3 programming books

// Filter by array of ids
ArrayHelpers.findAll(books, { id: [1, 2] })
// Returns books with id 1 and 2

// Filter string array
const fruits = ['apple', 'banana', 'apple', 'cherry']
ArrayHelpers.findAll(fruits, 'apple') // ['apple', 'apple']
```

---

## remove

Removes the **first** matching element from the array (mutates the array).

**Signature:**
```ts
remove(arr: any[], query?: any): any[]
```

**Examples:**
```ts
const fruits = ['strawberry', 'watermelon', 'pineapple']
ArrayHelpers.remove(fruits, 'watermelon')
// fruits is now ['strawberry', 'pineapple']

const books = [{ id: 1, title: 'Clean Code' }, { id: 2, title: 'Clean Architecture' }]
ArrayHelpers.remove(books, { id: 1 })
// books is now [{ id: 2, title: 'Clean Architecture' }]
```

---

## removeAll

Returns a **new** array with all matching elements removed (does not mutate).

**Signature:**
```ts
removeAll(arr: any[], query: any, ignoreEmptyArray?: boolean): any[]
```

**Examples:**
```ts
const books = [
  { id: 1, title: 'Clean Code', category: 'Programming' },
  { id: 2, title: 'Atomic Habits', category: 'Self Help' },
  { id: 3, title: 'Deep Work', category: 'Self Help' },
]

ArrayHelpers.removeAll(books, { category: 'Self Help' })
// Returns [{ id: 1, title: 'Clean Code', category: 'Programming' }]
```

---

## toggleInArray

Adds an element to the array if it's not present, or removes it if it is (mutates the array).

**Signature:**
```ts
toggleInArray(arr: any[], obj: any): any[]
```

**Examples:**
```ts
const selected = [1, 2, 3]
ArrayHelpers.toggleInArray(selected, 4) // [1, 2, 3, 4]
ArrayHelpers.toggleInArray(selected, 2) // [1, 3, 4]

const tags = [{ id: 'js' }, { id: 'ts' }]
ArrayHelpers.toggleInArray(tags, { id: 'vue' }) // adds { id: 'vue' }
ArrayHelpers.toggleInArray(tags, { id: 'js' })  // removes { id: 'js' }
```

---

## uniqueByKey

Returns a new array with duplicate elements removed, optionally by a specific key.

**Signature:**
```ts
uniqueByKey(arr: any[], query?: string | object): any[]
```

**Examples:**
```ts
// Primitive deduplication
ArrayHelpers.uniqueByKey([1, 2, 2, 3, 3]) // [1, 2, 3]

// Deduplicate objects by key
const items = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Alice Duplicate' },
]
ArrayHelpers.uniqueByKey(items, 'id')
// [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
```

---

## compareArray

Checks if two arrays have the same elements (order-independent). Requires a key for object arrays.

**Signature:**
```ts
compareArray(arrFrom: any[], arrToCompare: any[], key?: string): boolean
```

**Examples:**
```ts
ArrayHelpers.compareArray([1, 2, 3], [3, 2, 1]) // true
ArrayHelpers.compareArray([1, 2], [1, 2, 3])     // false

const a = [{ id: 1 }, { id: 2 }]
const b = [{ id: 2 }, { id: 1 }]
ArrayHelpers.compareArray(a, b, 'id') // true
```

---

## objArrayToCsv

Converts an array of objects into a CSV-formatted string.

**Signature:**
```ts
objArrayToCsv(arr: any[], delimiter?: string): string
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `arr` | `object[]` | — | Array of objects (all with the same keys) |
| `delimiter` | `string` | `','` | Column delimiter |

**Examples:**
```ts
const data = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
]
ArrayHelpers.objArrayToCsv(data)
// "name,age\nAlice,30\nBob,25"

ArrayHelpers.objArrayToCsv(data, ';')
// "name;age\nAlice;30\nBob;25"
```

---

## shuffle

Shuffles an array in-place using the Fisher-Yates algorithm.

**Signature:**
```ts
shuffle(array: any[]): any[]
```

**Examples:**
```ts
const numbers = [1, 2, 3, 4, 5]
ArrayHelpers.shuffle(numbers) // e.g. [3, 1, 5, 2, 4]
```

---

## getRandomElement

Returns a random element from the array.

**Signature:**
```ts
getRandomElement(list: any[]): any
```

**Examples:**
```ts
const colors = ['red', 'green', 'blue']
ArrayHelpers.getRandomElement(colors) // e.g. 'green'
```

---

## chunkArray

Splits an array into chunks of a given size.

**Signature:**
```ts
chunkArray(arr: any[], size: number): any[][]
```

**Examples:**
```ts
ArrayHelpers.chunkArray([1, 2, 3, 4, 5], 2)
// [[1, 2], [3, 4], [5]]

ArrayHelpers.chunkArray(['a', 'b', 'c', 'd', 'e', 'f'], 3)
// [['a', 'b', 'c'], ['d', 'e', 'f']]
```

---

## getRandomWeithedElementsInArrays

Picks `count` unique elements from multiple arrays, respecting weighted probabilities per array.

**Signature:**
```ts
getRandomWeithedElementsInArrays(lists: any[][], weights: number[], count: number): any[]
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `lists` | `any[][]` | Array of arrays to pick from |
| `weights` | `number[]` | Weight for each array (higher = more likely) |
| `count` | `number` | Total number of elements to pick |

**Examples:**
```ts
const premium = ['Gold Plan', 'Platinum Plan']
const standard = ['Basic Plan', 'Starter Plan', 'Free Plan']

// Pick 3 items: standard list (weight 3) is 3x more likely than premium (weight 1)
ArrayHelpers.getRandomWeithedElementsInArrays(
  [premium, standard],
  [1, 3],
  3
)
// e.g. ['Basic Plan', 'Free Plan', 'Gold Plan']
```
