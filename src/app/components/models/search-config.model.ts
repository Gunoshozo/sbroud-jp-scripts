export interface SearchConfig {
    routed: boolean;
}

export interface SearchableChapter {
    name: string;
    text: string;
    routerLink: string;
}

export interface SearchableRoute{
    items: SearchableChapter[];
    name: string;
    spoiler?: boolean;
}