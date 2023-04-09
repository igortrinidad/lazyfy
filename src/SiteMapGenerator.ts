
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
    if(!urlItem.url) throw new Error('Url is required')
    this.url = this.removeFirstSlashFromUrl(urlItem.url)
    if(urlItem.lastModified ) this.lastModified = urlItem.lastModified
    if(urlItem.changeFreq ) this.changeFreq = urlItem.changeFreq
    if(urlItem.priority ) this.priority = urlItem.priority
    if(urlItem.image ) this.image = urlItem.image
  }

  removeFirstSlashFromUrl(url: string) {
    if(url[0] == '/') return url.substring(1)
    return url
  }

}

export class SiteMapGenerator {

  baseUrl: string = ''
  items: UrlItem[] = []
  xmlStylesheetPath: string = ''

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.items = []
  }

  private get getHeader () {
const header = 
`
${ this.xmlStylesheetPath ? `<?xml-stylesheet href="${ this.xmlStylesheetPath }" type="text/xsl"?>` : '' }
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`
return header
  }

  private get getBody () {
    return this.items.map((item) => {
      var itemResult =  
`
  <url>
    <loc>${ this.baseUrl }${ (!item.url) ? '' : `/${ item.url }` }</loc>
    <priority>${item.priority}</priority>
    <lastmod>${item.lastModified}</lastmod>
    <changefreq>${item.changeFreq}</changefreq>`

    if(item.image) {
      
      itemResult += 
`
      <image:image>
        <image:loc>${item.image.url}</image:loc>
        <image:caption>${item.image.caption}</image:caption>
        <image:title>${item.image.title}</image:title>
      </image:image>`
    }
    itemResult += 
`
  </url>
`
return itemResult
    
  })
  .join('')

  }

  private get getFooter () {
    return `</urlset>`
  }

  public setXmlStyleSheetPath(path: string) {
    this.xmlStylesheetPath = path
  }

  public addItem(urlItem: UrlItemInterface): void {
    this.items.push(new UrlItem(urlItem))
  }

  public generate(): string{
    const result = 
`
${ this.getHeader }
${ this.getBody }
${ this.getFooter }
`
    return result
  }

}

