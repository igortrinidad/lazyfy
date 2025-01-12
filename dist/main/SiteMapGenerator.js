"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteMapGenerator = exports.UrlItem = void 0;
class UrlItem {
    constructor(urlItem) {
        this.lastModified = new Date().toISOString().substring(0, 10);
        this.changeFreq = 'monthly';
        this.priority = '1.0';
        this.image = null;
        if (!urlItem.url)
            throw new Error('Url is required');
        this.url = this.removeFirstSlashFromUrl(urlItem.url);
        if (urlItem.lastModified)
            this.lastModified = urlItem.lastModified;
        if (urlItem.changeFreq)
            this.changeFreq = urlItem.changeFreq;
        if (urlItem.priority)
            this.priority = urlItem.priority;
        if (urlItem.image)
            this.image = urlItem.image;
    }
    removeFirstSlashFromUrl(url) {
        if (url[0] == '/')
            return url.substring(1);
        return url;
    }
}
exports.UrlItem = UrlItem;
class SiteMapGenerator {
    constructor(baseUrl) {
        this.baseUrl = '';
        this.items = [];
        this.xmlStylesheetPath = '';
        this.baseUrl = baseUrl;
        this.items = [];
    }
    get getHeader() {
        const header = `
${this.xmlStylesheetPath ? `<?xml-stylesheet href="${this.xmlStylesheetPath}" type="text/xsl"?>` : ''}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;
        return header;
    }
    get getBody() {
        return this.items.map((item) => {
            var itemResult = `
  <url>
    <loc>${this.baseUrl}${(!item.url) ? '' : `/${item.url}`}</loc>
    <priority>${item.priority}</priority>
    <lastmod>${item.lastModified}</lastmod>
    <changefreq>${item.changeFreq}</changefreq>`;
            if (item.image) {
                itemResult +=
                    `
      <image:image>
        <image:loc>${item.image.url}</image:loc>
        <image:caption>${item.image.caption}</image:caption>
        <image:title>${item.image.title}</image:title>
      </image:image>`;
            }
            itemResult +=
                `
  </url>
`;
            return itemResult;
        })
            .join('');
    }
    get getFooter() {
        return `</urlset>`;
    }
    setXmlStyleSheetPath(path) {
        this.xmlStylesheetPath = path;
    }
    addItem(urlItem) {
        this.items.push(new UrlItem(urlItem));
    }
    generate() {
        const result = `
${this.getHeader}
${this.getBody}
${this.getFooter}
`;
        return result;
    }
}
exports.SiteMapGenerator = SiteMapGenerator;
