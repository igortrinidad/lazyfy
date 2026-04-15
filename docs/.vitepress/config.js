import { defineConfig } from 'vitepress'

export default defineConfig({
  base: "/lazyfy/",
  title: '@igortrindade/lazyfy',
  description: "Someone once said: \"I choose a lazy person to do a hard job. Because a lazy person will find an easy way to do it.\"",
  
  themeConfig: {
    outline: 'deep',
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Helpers',
        items: [
          { text: 'Array Helpers', link: '/helpers/array-helpers' },
          { text: 'String Helpers', link: '/helpers/string-helpers' },
          { text: 'Object Helpers', link: '/helpers/object-helpers' },
          { text: 'Math Helpers', link: '/helpers/math-helpers' },
          { text: 'Number Format', link: '/helpers/number-format' },
          { text: 'Common Helpers', link: '/helpers/common-helpers' },
          { text: 'Regex Helpers', link: '/helpers/regex-helpers' },
          { text: 'File Helpers', link: '/helpers/file-helpers' },
        ]
      }
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Playground', link: '/' },
        ]
      },
      {
        text: 'Helpers',
        items: [
          { text: 'Array Helpers', link: '/helpers/array-helpers' },
          { text: 'String Helpers', link: '/helpers/string-helpers' },
          { text: 'Object Helpers', link: '/helpers/object-helpers' },
          { text: 'Math Helpers', link: '/helpers/math-helpers' },
          { text: 'Number Format', link: '/helpers/number-format' },
          { text: 'Common Helpers', link: '/helpers/common-helpers' },
          { text: 'Regex Helpers', link: '/helpers/regex-helpers' },
          { text: 'File Helpers', link: '/helpers/file-helpers' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/igortrinidad/lazyfy' },
    ]
  }
})
