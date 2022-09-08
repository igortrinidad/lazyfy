export = SiteMapGenerator;
declare class SiteMapGenerator {
    constructor(baseUrl: any);
    baseUrl: any;
    init: string;
    end: string;
    items: any[];
    addItem({ url, lastModified, changeFreq, priority, image }: {
        url: any;
        lastModified: any;
        changeFreq?: string;
        priority?: string;
        image?: any;
    }): void;
    generate(): string;
}
