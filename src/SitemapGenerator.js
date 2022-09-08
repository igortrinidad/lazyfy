class SiteMapGenerator {

  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  init = `
    <?xml-stylesheet href="/assets/xml_stylesheet.xsl" type="text/xsl"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  `

  end = `</urlset>`

  items = []

  addItem({url, lastModified, changeFreq = 'monthly', priority = '1.0', image = null}) {
    if(url[0] == '/') {
      url = url.substring(1)
    }
    this.items.push({url, lastModified, changeFreq, priority, image})
  }

  generate(){
    return `
      ${this.init}
      ${this.items.map((item) => {
        return `
        <url>
          <loc>${this.baseUrl}${(!item.url) ? '' : `/${item.url}`}</loc>
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

module.exports = SiteMapGenerator
