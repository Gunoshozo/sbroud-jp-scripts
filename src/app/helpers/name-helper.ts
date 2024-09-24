import { ChapterConfig, ChapterNav } from "../models/reading.models";

export class NameHelper {
    public static resolveChapterName(chapterConfig: ChapterConfig, chapterIndex: number): string {
        if (chapterConfig.chapterOrder) {
            let chapterKey = chapterConfig.chapterOrder[chapterIndex]
            let chapter = chapterConfig.chapters[chapterKey];
            let number = chapterKey
            if (!/^\d+[A-Za-z0-9\-_]*$/gm.test(number)) {
                number = ""
            }
            if (number && chapter?.name) {
                number += ": "
            }
            return chapter && chapter.name && `${number}${chapter.name}` || !!number && `Chapter ${number}` || `Chapter ${chapterIndex + 1}`
        } else {
            const number = chapterIndex
            const chapter: ChapterNav = chapterConfig.chapters[number];
            return chapter && chapter.name && `${number}: ${chapter.name}` || `Chapter ${number}`
        }
    }
}