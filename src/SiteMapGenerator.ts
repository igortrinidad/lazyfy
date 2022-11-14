
interface UrlImage {
  url: string
  title: string
  caption: string
}

type ChangeFreqs = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'anual' | 'never'

interface UrlItemInterface {
  url: string
  lastModified?: string
  changeFreq?: ChangeFreqs
  priority?: string
  image?: UrlImage
}

export class UrlItem {

  url: string
  lastModified: string = new Date().toISOString().substring(0,10)
  changeFreq: ChangeFreqs = 'monthly'
  priority: string = '1.0'
  image?: UrlImage = null

  constructor(urlItem: UrlItemInterface){
    this.url = this.removeFirstSlashFromUrl(urlItem.url)
    this.lastModified = urlItem.lastModified
    this.changeFreq = urlItem.changeFreq
    this.priority = urlItem.priority
    this.image = urlItem.image
  }

  removeFirstSlashFromUrl(url: string) {
    if(url[0] == '/') return url.substring(1)
    return url
  }

}

export class SiteMapGenerator {

  baseUrl: string = ''
  items: UrlItem[] = []

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.items = []
  }

  get init () {
    return `
      <?xml-stylesheet href="/assets/xml_stylesheet.xsl" type="text/xsl"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
    `
  }

  get end () {
    return `</urlset>`
  }

  addItem(urlItem: UrlItemInterface): void {
    this.items.push(new UrlItem(urlItem))
  }

  generate(): string{
    return `
      ${this.init}
      ${this.items.map((item) => {
        return `
        <url>
          <loc>${ this.baseUrl }${ (!item.url) ? '' : `/${ item.url }` }</loc>
          <priority>${item.priority}</priority>
          <lastmod>${item.lastModified}</lastmod>
          <changefreq>${item.changeFreq}</changefreq>
          ${(!item.image) ? '' :
          `
          <image:image>
            <image:loc>${item.image.url}</image:loc>
            <image:title>${item.image.title}</image:title>
            <image:caption>${item.image.caption}</image:caption>
          </image:image>
          `}
        </url>
        `
      })}
      ${this.end}
    `
  }
}

