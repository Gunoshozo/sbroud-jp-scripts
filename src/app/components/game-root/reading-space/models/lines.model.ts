export interface ReadableLine {
    text: string;
    isChoice?: boolean;
    innerLines?: ReadableLine[];
    index?: number;
}

export interface BookmarkData{
    gameName:string;
    route?: string;
    chapter: string;
    lineIndex: number;
}