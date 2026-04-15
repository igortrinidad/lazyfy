# Object Helpers

Utility functions for working with objects — deep merging, nested key access, structural comparison, and more.

## Installation

```ts
import { ObjectHelpers } from '@igortrindade/lazyfy'
// or individually:
import { filterObjectKeys, checkObjMatch, checkIsEqual, defineProperty, isObject, deepMergeObject, getNestedObjectByKey, setNestedObjectByKey, deleteNestedObjectByKey, deepSearchKey, checkSameStructure, getObjectMapped } from '@igortrindade/lazyfy'
```

---

## filterObjectKeys

Returns a new object containing only the allowed keys from the source object.

**Signature:**
```ts
filterObjectKeys(allowed: string[], object: any): any
```

**Examples:**
```ts
const user = { id: 1, name: 'Alice', password: 'secret', role: 'admin' }

ObjectHelpers.filterObjectKeys(['id', 'name'], user)
// { id: 1, name: 'Alice' }
```

---

## checkObjMatch

Checks if an object matches a given query object (partial match, case-insensitive for strings).

**Signature:**
```ts
checkObjMatch(item: any, query: any, ignoreEmptyArray?: boolean): any
```

**Examples:**
```ts
const book = { id: 1, title: 'Clean Code', category: 'Programming' }

ObjectHelpers.checkObjMatch(book, { category: 'programming' }) // book (truthy)
ObjectHelpers.checkObjMatch(book, { category: 'Self Help' })   // false

// Array values act as "includes" filter
ObjectHelpers.checkObjMatch(book, { id: [1, 2] }) // book (truthy)
ObjectHelpers.checkObjMatch(book, { id: [3, 4] }) // false
```

---

## checkIsEqual

Compares two values for equality. String comparison is case-insensitive.

**Signature:**
```ts
checkIsEqual(value: any, query: any): boolean
```

**Examples:**
```ts
ObjectHelpers.checkIsEqual('Hello', 'hello') // true
ObjectHelpers.checkIsEqual(42, 42)           // true
ObjectHelpers.checkIsEqual(1, '1')           // true (loose equality)
ObjectHelpers.checkIsEqual('foo', 'bar')     // false
```

---

## defineProperty

Adds a writable, enumerable, and configurable property to an object using `Object.defineProperty`.

**Signature:**
```ts
defineProperty(object: any, key: string, value: any): any
```

**Examples:**
```ts
const obj = { name: 'Alice' }
ObjectHelpers.defineProperty(obj, 'role', 'admin')
// { name: 'Alice', role: 'admin' }
```

---

## isObject

Returns `true` if the value is a plain (non-array) object.

**Signature:**
```ts
isObject(item: any): boolean
```

**Examples:**
```ts
ObjectHelpers.isObject({})         // true
ObjectHelpers.isObject({ a: 1 })   // true
ObjectHelpers.isObject([1, 2])     // false
ObjectHelpers.isObject(null)       // false
ObjectHelpers.isObject('string')   // false
```

---

## deepMergeObject

Deep-merges one or more source objects into the target object. Nested objects are recursively merged rather than replaced.

**Signature:**
```ts
deepMergeObject(target: any, ...sources: any): any
```

**Examples:**
```ts
const defaults = {
  theme: { color: 'blue', size: 'md' },
  debug: false,
}

const overrides = {
  theme: { color: 'red' },
}

ObjectHelpers.deepMergeObject(defaults, overrides)
// { theme: { color: 'red', size: 'md' }, debug: false }
```

::: warning
This method mutates the `target` object. Pass an empty object `{}` as the first argument to avoid side effects:
```ts
ObjectHelpers.deepMergeObject({}, defaults, overrides)
```
:::

---

## getNestedObjectByKey

Reads a value from a deeply nested object using dot-notation. Supports array index notation.

**Signature:**
```ts
getNestedObjectByKey(obj: any, key: string): any
```

**Examples:**
```ts
const data = {
  user: {
    profile: {
      name: 'Alice',
      addresses: [{ city: 'São Paulo' }, { city: 'Rio de Janeiro' }]
    }
  }
}

ObjectHelpers.getNestedObjectByKey(data, 'user.profile.name')
// 'Alice'

ObjectHelpers.getNestedObjectByKey(data, 'user.profile.addresses[0].city')
// 'São Paulo'

ObjectHelpers.getNestedObjectByKey(data, 'user.profile.missing')
// undefined
```

---

## setNestedObjectByKey

Returns a new object with a value set at the specified dot-notation path. Supports array index notation.

**Signature:**
```ts
setNestedObjectByKey(obj: any, key: string, value: any, allowNonExistingArrayIndex?: boolean): any
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `obj` | `any` | `{}` | Source object (not mutated) |
| `key` | `string` | — | Dot-notation path |
| `value` | `any` | — | Value to set |
| `allowNonExistingArrayIndex` | `boolean` | `false` | Allow pushing to non-existing array indexes |

**Examples:**
```ts
const user = { profile: { name: 'Alice', age: 30 } }

ObjectHelpers.setNestedObjectByKey(user, 'profile.name', 'Bob')
// { profile: { name: 'Bob', age: 30 } }

ObjectHelpers.setNestedObjectByKey(user, 'profile.address.city', 'São Paulo')
// { profile: { name: 'Alice', age: 30, address: { city: 'São Paulo' } } }
```

---

## deleteNestedObjectByKey

Returns a new object with a specific nested key removed. Uses dot-notation and supports array indexes.

**Signature:**
```ts
deleteNestedObjectByKey(obj: any, key: string, ignoreNonExisting?: boolean): any
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `obj` | `any` | — | Source object |
| `key` | `string` | — | Dot-notation path to delete |
| `ignoreNonExisting` | `boolean` | `true` | Silently skip non-existing paths |

**Examples:**
```ts
const user = { id: 1, profile: { name: 'Alice', password: 'secret' } }

ObjectHelpers.deleteNestedObjectByKey(user, 'profile.password')
// { id: 1, profile: { name: 'Alice' } }

// Delete array item
const data = { tags: ['js', 'ts', 'vue'] }
ObjectHelpers.deleteNestedObjectByKey(data, 'tags[1]')
// { tags: ['js', 'vue'] }
```

---

## deepSearchKey

Recursively searches an object (and its nested children) for a given key, returning the value(s).

**Signature:**
```ts
deepSearchKey(obj: object, targetKey: string, returnAll?: boolean): any[] | any
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `obj` | `object` | — | Object to search |
| `targetKey` | `string` | — | Key name to look for |
| `returnAll` | `boolean` | `false` | Return all occurrences instead of the first one |

**Examples:**
```ts
const data = {
  user: {
    name: 'Alice',
    company: {
      name: 'ACME Corp',
    }
  }
}

ObjectHelpers.deepSearchKey(data, 'name')
// 'Alice' (first occurrence)

ObjectHelpers.deepSearchKey(data, 'name', true)
// ['Alice', 'ACME Corp'] (all occurrences)
```

---

## checkSameStructure

Recursively checks if two objects share the same structure (same keys at every level).

**Signature:**
```ts
checkSameStructure(baseObj: object, compareObj: object): boolean
```

**Examples:**
```ts
const a = { id: 1, profile: { name: 'Alice' } }
const b = { id: 2, profile: { name: 'Bob' } }
const c = { id: 3, profile: { name: 'Charlie', age: 25 } }

ObjectHelpers.checkSameStructure(a, b) // true
ObjectHelpers.checkSameStructure(a, c) // false (c has extra 'age' key)
```

---

## getObjectMapped

Converts an object into an array of its values, injecting the original key as a `key` property on each item.

**Signature:**
```ts
getObjectMapped(object: any): any[]
```

**Examples:**
```ts
const routes = {
  home: { path: '/', label: 'Home' },
  about: { path: '/about', label: 'About' },
}

ObjectHelpers.getObjectMapped(routes)
// [
//   { path: '/', label: 'Home', key: 'home' },
//   { path: '/about', label: 'About', key: 'about' },
// ]
```
