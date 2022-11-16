import { SiteMapGenerator } from '../src'

test('SiteMapGenerator', () => {
  const sitemap = new SiteMapGenerator('https://lazyfy.github.com')
  sitemap.addItem({ url: '/home' })
  sitemap.generate()
})