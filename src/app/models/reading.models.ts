export interface GameConfig {
    name: string;
    link: string;
}

export interface RouteItem {
    name: string;
    routerLink: string;
    spoiler?: boolean;
}

export interface RouteConfig {
    headerLabel?: string;
    items: RouteItem[];
}

export interface ChapterConfig {
    total: number;
    headerLabel?: string;
    chapterOrder?: string[];  // needed if chapter files names contains non number characters (due to keyed object not preserving order in insertion), can be omitted if chapter indexes are numbers only. Should be a size of this.total
    chapters: { [key: string]: ChapterNav }; //mapped, contains additional data for chapter like name, prev/next navigation. Can be empty if vn has no names for chapters and mostly linear and without routes
}

export interface ChapterNav {
    name?: string;
    next?: NavItem[]
    prev?: NavItem[];
    comment?: string;
}

export interface NavItem {
    route: string
    index: number;
}

export interface GameItem {
    name: string;
    imgSrc: string;
    routerLink: string;
    spoiler?: boolean;
    alternativeImgs?: string[];
}

export interface Tip {
    name: string;
    content: string;
    pronunciation?: string;
    firstLetter?: string;   //currently unused
    tags?: string;          //currently unused
}
