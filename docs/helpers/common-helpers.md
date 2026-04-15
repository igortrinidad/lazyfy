# Common Helpers

General-purpose browser utility functions for clipboard, downloads, debouncing, cookies, and cache management.

::: warning Browser Only
All functions in this module require a browser environment (`window`, `document`, `navigator`). They will throw or be no-ops in Node.js/SSR contexts.
:::

## Installation

```ts
import { CommonHelpers } from '@igortrindade/lazyfy'
// or individually:
import { debounce, copyToClipboard, downloadRawData, getLetterByNumber, clearBrowserCache, clearBrowserCacheListener, removeAllCookies } from '@igortrindade/lazyfy'
```

---

## debounce

Wraps a function so it only executes after `timeout` milliseconds have elapsed since the last call. Ideal for search inputs, resize handlers, and other high-frequency events.

**Signature:**
```ts
debounce<T extends (...args: any[]) => any>(callback: T, timeout?: number): (...args: Parameters<T>) => void
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `callback` | `Function` | — | Function to debounce |
| `timeout` | `number` | `300` | Milliseconds to wait before calling |

**Examples:**
```ts
const onSearch = CommonHelpers.debounce((query: string) => {
  fetchResults(query)
}, 500)

// Only calls fetchResults after 500ms of inactivity
inputElement.addEventListener('input', (e) => onSearch(e.target.value))
```

```ts
// With Vue
import { debounce } from '@igortrindade/lazyfy'

const handleInput = debounce((value: string) => {
  console.log('searching for:', value)
}, 300)
```

---

## copyToClipboard

Copies a string to the user's clipboard. Uses the modern `navigator.clipboard` API with a fallback for older browsers.

**Signature:**
```ts
copyToClipboard(string: string): void
```

**Examples:**
```ts
CommonHelpers.copyToClipboard('https://github.com/igortrinidad/lazyfy')
// Text is now in the clipboard
```

---

## downloadRawData

Triggers a file download in the browser with the provided string content.

**Signature:**
```ts
downloadRawData(data: string, fileName?: string): void
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `data` | `string` | — | File content as a string |
| `fileName` | `string` | `'file.txt'` | Name of the downloaded file |

**Examples:**
```ts
// Download a CSV
const csvContent = 'name,age\nAlice,30\nBob,25'
CommonHelpers.downloadRawData(csvContent, 'users.csv')

// Download a JSON file
const json = JSON.stringify({ version: '1.0.0' }, null, 2)
CommonHelpers.downloadRawData(json, 'config.json')
```

---

## getLetterByNumber

Returns the lowercase letter corresponding to a zero-based index (0 → `'a'`, 1 → `'b'`, etc.). Returns `'--'` if the index is out of range.

**Signature:**
```ts
getLetterByNumber(number: number): string
```

**Examples:**
```ts
CommonHelpers.getLetterByNumber(0)   // 'a'
CommonHelpers.getLetterByNumber(1)   // 'b'
CommonHelpers.getLetterByNumber(25)  // 'z'
CommonHelpers.getLetterByNumber(26)  // '--'
```

::: tip Use case
Useful for generating labeled options in forms or quiz answers (a, b, c...).
:::

---

## removeAllCookies

Removes all browser cookies by setting their expiry date to the past.

**Signature:**
```ts
removeAllCookies(): void
```

**Examples:**
```ts
CommonHelpers.removeAllCookies()
// All cookies are now expired/removed
```

---

## clearBrowserCache

Clears `localStorage`, `sessionStorage`, and optionally all cookies.

**Signature:**
```ts
clearBrowserCache(removeCookies?: boolean): void
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `removeCookies` | `boolean` | `true` | Also remove all cookies |

**Examples:**
```ts
CommonHelpers.clearBrowserCache()        // clears storage + cookies
CommonHelpers.clearBrowserCache(false)   // clears storage only
```

---

## clearBrowserCacheListener

Attaches a keyboard shortcut listener that clears the browser cache when triggered (default: `Alt + X`). Optionally calls a callback or reloads the page.

**Signature:**
```ts
clearBrowserCacheListener(hotKey?: string, removeCookies?: boolean, cb?: Function | null): void
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `hotKey` | `string` | `'KeyX'` | KeyboardEvent `code` value for the shortcut |
| `removeCookies` | `boolean` | `true` | Also remove cookies when triggered |
| `cb` | `Function \| null` | `null` | Callback after clearing (if null, reloads the page) |

**Examples:**
```ts
// Default: Alt+X clears cache and reloads
CommonHelpers.clearBrowserCacheListener()

// Custom key + callback
CommonHelpers.clearBrowserCacheListener('KeyR', true, () => {
  console.log('Cache cleared!')
  router.push('/')
})
```

::: tip Dev Utility
This is useful during development to quickly reset application state without opening DevTools.
:::
