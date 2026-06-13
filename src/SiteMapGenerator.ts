
interface UrlImage {
  url: string
  title: string
  caption: string
}

interface UrlVideo {
  thumbnailUrl: string
  title: string
  description: string
  contentUrl?: string
  playerUrl?: string
  duration?: number
  publicationDate?: string
  expirationDate?: string
  rating?: number
  viewCount?: number
  familyFriendly?: boolean
  live?: boolean
}

type ChangeFreqs = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'anual' | 'never'

interface UrlItemInterface {
  url: string
  lastModified?: string
  changeFreq?: ChangeFreqs
  priority?: string
  image?: UrlImage
  images?: UrlImage[]
  videos?: UrlVideo[]
}

export class UrlItem {

  url: string
  lastModified: string = new Date().toISOString().substring(0,10)
  changeFreq: ChangeFreqs = 'monthly'
  priority: string = '1.0'
  images: UrlImage[] = []
  videos: UrlVideo[] = []

  constructor(urlItem: UrlItemInterface){
    if(!urlItem.url) throw new Error('Url is required')
    this.url = this.removeFirstSlashFromUrl(urlItem.url)
    if(urlItem.lastModified ) this.lastModified = urlItem.lastModified
    if(urlItem.changeFreq ) this.changeFreq = urlItem.changeFreq
    if(urlItem.priority ) this.priority = urlItem.priority
    if(urlItem.image ) this.images = [urlItem.image]
    if(urlItem.images?.length ) this.images = urlItem.images
    if(urlItem.videos?.length ) this.videos = urlItem.videos
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

    for (const image of item.images) {
      itemResult += 
`
      <image:image>
        <image:loc>${image.url}</image:loc>
        <image:caption>${image.caption}</image:caption>
        <image:title>${image.title}</image:title>
      </image:image>`
    }

    for (const video of item.videos) {
      itemResult +=
`
      <video:video>
        <video:thumbnail_loc>${video.thumbnailUrl}</video:thumbnail_loc>
        <video:title>${video.title}</video:title>
        <video:description>${video.description}</video:description>`
      if (video.contentUrl) itemResult += `\n        <video:content_loc>${video.contentUrl}</video:content_loc>`
      if (video.playerUrl) itemResult += `\n        <video:player_loc>${video.playerUrl}</video:player_loc>`
      if (video.duration != null) itemResult += `\n        <video:duration>${video.duration}</video:duration>`
      if (video.publicationDate) itemResult += `\n        <video:publication_date>${video.publicationDate}</video:publication_date>`
      if (video.expirationDate) itemResult += `\n        <video:expiration_date>${video.expirationDate}</video:expiration_date>`
      if (video.rating != null) itemResult += `\n        <video:rating>${video.rating}</video:rating>`
      if (video.viewCount != null) itemResult += `\n        <video:view_count>${video.viewCount}</video:view_count>`
      if (video.familyFriendly != null) itemResult += `\n        <video:family_friendly>${video.familyFriendly ? 'yes' : 'no'}</video:family_friendly>`
      if (video.live != null) itemResult += `\n        <video:live>${video.live ? 'yes' : 'no'}</video:live>`
      itemResult += `\n      </video:video>`
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

