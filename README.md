<h1 align="center">lazyfy</h1>
<p align="center">A lightweight, zero dependency set of tools that i use in almost any project</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@igortrindade/lazyfy"><img alt="npm" src="https://img.shields.io/github/package-json/v/igortrinidad/lazyfy?style=flat&color=orange" /></a>
  <a href="https://github.com/igortrinidad/lazyfy/actions/workflows/npm-publish-github-packages.yml"><img alt="CI" src="https://img.shields.io/github/workflow/status/igortrinidad/lazyfy/Build,%20release%20version%20and%20changelog%20and%20publish%20to%20NPM?label=ci&logo=github"></a>
  <a href="https://github.com/igortrinidad/lazyfy/tree/HEAD/LICENSE"><img alt="License" src="https://img.shields.io/github/license/igortrinidad/lazyfy?style=flat&color=blue" /></a>
</p>

<p align="center">
  <a href="https://igortrinidad.github.io/lazyfy/" alt="@igortrindade/lazyfy docs" >
    <img src="https://img.shields.io/badge/DOCS-LIVE%20PLAYGROUND%20-blueviolet?style=for-the-badge&logo=read-the-docs&logoColor=white" />
  </a>
</p>

## 🚀 Quickstart

1. Install with your favorite package manager:
   - npm : `npm i @igortrindade/lazyfy`
   - yarn : `yarn add @igortrindade/lazyfy`

2. Usage
```ts
import { ArrayHelpers } from '@igortrindade/lazyfy'

const arr = ['watermelon', 'strawberry', 'grape']

const item = ArrayHelpers.find(arr, 'grape')
// item = 'grape'

const books = [ { id: 1, title: 'Clean Code' }, { id: 2, title: 'Clean Archtecture' }, { id: 3, title: 'Refactoring' }]

const selected = ArrayHelpers.findAll(books, { id: [1, 2]})
// selected = [ { id: 1, title: 'Clean Code' }, { id: 2, title: 'Clean Archtecture' }]

const bookClean = ArrayHelpers.find(books, { title: 'CLEAN CODE' })
// Case insensitive match
// bookClean = { id: 1, title: 'Clean Code' }

// For more examples, see the live playground on: https://igortrinidad.github.io/lazyfy/

```


## 🤝 Contributing

Run into a problem? Open an [issue](https://github.com/igortrinidad/lazyfy/issues/new/choose).
Want to add some feature? PRs are welcome!

## 👤 About the author

Feel free to contact me: 

[![GitHub](https://img.shields.io/badge/MY-PORTFOLIO%20-blueviolet?style=for-the-badge&logo=read-the-docs&logoColor=white)](https://igortrindade.dev)

[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/igortrinidad)

[![twitter: @souigortrindade](https://img.shields.io/twitter/follow/souigortrindade?style=social)](https://twitter.com/souigortrindade)

## 📝 License

Copyright © 2022 [Igor Trindade](https://github.com/igortrinidad).  
This project is under [MIT](https://github.com/igortrinidad/lazyfy/blob/main/LICENCE) license.