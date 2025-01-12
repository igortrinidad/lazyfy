interface UrlImage {
    url: string;
    title: string;
    caption: string;
}
type ChangeFreqs = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'anual' | 'never';
interface UrlItemInterface {
    url: string;
    lastModified?: string;
    changeFreq?: ChangeFreqs;
    priority?: string;
    image?: UrlImage;
}
export declare class UrlItem {
    url: string;
    lastModified: string;
    changeFreq: ChangeFreqs;
    priority: string;
    image?: UrlImage;
    constructor(urlItem: UrlItemInterface);
    removeFirstSlashFromUrl(url: string): string;
}
export declare class SiteMapGenerator {
    baseUrl: string;
    items: UrlItem[];
    xmlStylesheetPath: string;
    constructor(baseUrl: string);
    private get getHeader();
    private get getBody();
    private get getFooter();
    setXmlStyleSheetPath(path: string): void;
    addItem(urlItem: UrlItemInterface): void;
    generate(): string;
}
export {};
