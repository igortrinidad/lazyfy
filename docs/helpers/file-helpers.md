# File Helpers

Utility functions for formatting file metadata — sizes, extensions, names, colors, and icons.

## Installation

```ts
import { formatFileSize, formatFileExtension, formatFileName, formatFileColor, getFileIcon } from '@igortrindade/lazyfy'
```

---

## formatFileSize

Converts a byte count into a human-readable string (e.g. `1.5 MB`).

**Signature:**
```ts
formatFileSize(bytes: number | string): string
```

**Examples:**
```ts
formatFileSize(0)           // '0 Bytes'
formatFileSize(1024)        // '1 KB'
formatFileSize(1048576)     // '1 MB'
formatFileSize(1536000)     // '1.46 MB'
formatFileSize(1073741824)  // '1 GB'
formatFileSize(null)        // '0 Bytes'
formatFileSize('')          // '0 Bytes'
```

---

## formatFileExtension

Extracts the file extension (including the leading dot) from a filename or path.

**Signature:**
```ts
formatFileExtension(file: string): string
```

**Examples:**
```ts
formatFileExtension('document.pdf')          // '.pdf'
formatFileExtension('report.final.docx')     // '.docx'
formatFileExtension('/uploads/photo.jpg')    // '.jpg'
```

---

## formatFileName

Extracts just the filename from a full file path.

**Signature:**
```ts
formatFileName(file: string): string | undefined
```

**Examples:**
```ts
formatFileName('/uploads/2024/photo.jpg')     // 'photo.jpg'
formatFileName('C:\\Documents\\report.pdf')   // 'report.pdf'
formatFileName('invoice.pdf')                 // 'invoice.pdf'
```

---

## formatFileColor

Returns a color hex code associated with the file type based on its extension.

**Signature:**
```ts
formatFileColor(path: string): string
```

| Extension(s) | Color | Description |
|---|---|---|
| `.pdf` | `#ef4444` | Red |
| `.doc`, `.docx` | `#3b82f6` | Blue |
| `.xls`, `.xlsx` | `#22c55e` | Green |
| `.png`, `.jpg`, `.jpeg`, `.gif`, `.mp4`, `.mpeg`, `.webm`, `.webp`, `.svg` | `#eab308` | Yellow |
| Others | `#6b7280` | Gray |

**Examples:**
```ts
formatFileColor('report.pdf')     // '#ef4444'
formatFileColor('data.xlsx')      // '#22c55e'
formatFileColor('photo.png')      // '#eab308'
formatFileColor('script.ts')      // '#6b7280'
```

---

## getFileIcon

Returns an icon identifier string for a given file path. Currently supports the [Solar icon set](https://icon-sets.iconify.design/solar/).

**Signature:**
```ts
getFileIcon(path: string, provider?: string): string | undefined
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `path` | `string` | — | File path or filename |
| `provider` | `string` | `'solar'` | Icon library to use |

**Returned icons by type:**

| File type | Icon |
|-----------|------|
| PDF, DOC, DOCX | `solar:document-text-line-duotone` |
| XLS, XLSX | `solar:clipboard-list-line-duotone` |
| Images (PNG, JPG, JPEG, GIF, WEBP, SVG) | `solar:gallery-bold-duotone` |
| Archives (ZIP, RAR, 7Z, TAR, GZ) | `solar:archive-line-duotone` |
| Audio (MP3, WAV, FLAC, AAC, OGG) | `solar:microphone-2-line-duotone` |

**Examples:**
```ts
getFileIcon('document.pdf')     // 'solar:document-text-line-duotone'
getFileIcon('spreadsheet.xlsx') // 'solar:clipboard-list-line-duotone'
getFileIcon('photo.png')        // 'solar:gallery-bold-duotone'
getFileIcon('archive.zip')      // 'solar:archive-line-duotone'
getFileIcon('audio.mp3')        // 'solar:microphone-2-line-duotone'
```

::: tip Using with Iconify
If you use Iconify in your project, you can render the icon directly:
```vue
<Icon :icon="getFileIcon(file.path)" />
```
:::
