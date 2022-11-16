import { defineConfig } from 'vitepress'

export default defineConfig({
  base: "/lazyfy/",
  title: '@igortrindade/lazyfy',
  description: "Someone once said: \"I choose a lazy person to do a hard job. Because a lazy person will find an easy way to do it.\"",
  
  
  themeConfig: {
    outline: 'deep',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/igortrinidad/lazyfy' },
    ]
  }
})
