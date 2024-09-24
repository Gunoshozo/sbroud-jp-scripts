import { Component, HostBinding, Input } from "@angular/core";
import { ChapterConfig, ChapterNav, NavItem, RouteConfig } from "../../../../../models/reading.models";
import { NgClass, NgTemplateOutlet } from "@angular/common";
import { TuiLinkModule } from "@taiga-ui/core";
import { RouterLink } from "@angular/router";

@Component({
    selector: 'navigation',
    templateUrl: './navigation.component.html',
    standalone: true,
    imports: [
        NgClass,
        NgTemplateOutlet,
        TuiLinkModule,
        RouterLink
    ]
})
export class NavigationComponent {

    @HostBinding("class")
    public get _classes() {
        return ["navigation"]
    }

    @Input()
    public set navigationData(val: any) {
        if (!!val) {
            this.onNavigationDataChange(val)
        }
    }

    public comment: string = "";

    public prev: any[] = [];
    public next: any[] = [];

    private onNavigationDataChange(res: any) {
        this.prev = []
        this.next = []
        if (!res) {
            return;
        }

        const chapter = res?.chapter;
        const chapterData: ChapterConfig = res?.chapterData;
        const route = res.route;
        const routeData = res.routeData;

        if (chapter && chapterData) {
            const nav: ChapterNav = chapterData.chapters[chapter];

            let nextChapterKey: string = this.nextChapterKey(chapter, chapterData);
            let prevChapterKey: string = this.prevChapterKey(chapter, chapterData);

            let currentRoute = routeData?.items.find((it: any) => it.routerLink == route)?.name || ''
            if (currentRoute) {
                currentRoute += ' '
            }

            let chapterIndex: number = 0;
            if (chapterData.chapterOrder) {
                chapterIndex = chapterData.chapterOrder.findIndex((it) => it == chapter) + 1
            } else {
                chapterIndex = Number(chapter)
            }

            // simple next chapter
            if (!nav?.next && chapterIndex < chapterData.total) {
                this.initSimpleNav(this.next, currentRoute, chapterData, nextChapterKey);
            }

            //simple prev chapter
            if (!nav?.prev && chapterIndex > 1) {
                this.initSimpleNav(this.prev, currentRoute, chapterData, prevChapterKey);
            }

            this.initArrayNaV(this.next, nav?.next, route, currentRoute, chapterData, routeData);
            this.initArrayNaV(this.prev, nav?.prev, route, currentRoute, chapterData, routeData)

            this.comment = nav?.comment || '';
        }
    }

    private initSimpleNav(outputContainer: any[], currentRoute: string, chapterData: ChapterConfig, targetChapterKey: string): void {
        let name: string = "";

        if (chapterData.total == Object.keys(chapterData.chapters).length || chapterData.chapters[targetChapterKey]) {
            let nextChapterText = chapterData.chapters[targetChapterKey].name || '';
            let chapterNum = ""
            const link = targetChapterKey
            if (link >= "0" && link <= "9") {
                chapterNum = `Chapter ${targetChapterKey}`
            }
            if (chapterNum && nextChapterText)
                nextChapterText = ": " + nextChapterText;
            name = `${chapterNum}${nextChapterText}`;
        } else {
            name = `Chapter ${targetChapterKey}`
        }

        outputContainer.push({
            "link": `../${targetChapterKey}`,
            "text": `${currentRoute} ${name}`
        })
    }

    private initArrayNaV(outputContainer: any[], inputCntainer: NavItem[] | undefined, routeKey: string, currentRoute: string, chapterData: ChapterConfig, routeData: RouteConfig): void {
        inputCntainer?.forEach((it: any) => {
            let nextChapterKey = it.index;
            let nextChapterText = "";
            let chapterNum = "";

            // show 'Chapter X' in name only if X starts with number examples: 1, 2a, 01-01, 09b-01c 
            if (/^\d+[A-Za-z0-9\-_]*$/gm.test(nextChapterKey)) {
                chapterNum = `Chapter ${nextChapterKey}`
            }

            if (routeKey != it.route && !!it.name) {
                nextChapterText = it.name
            } else if (chapterData.total == Object.keys(chapterData.chapters).length || chapterData.chapters[nextChapterKey]) {
                nextChapterText = chapterData.chapters[nextChapterKey]?.name || '';
            }

            if (chapterNum && nextChapterText) {
                nextChapterText = ": " + nextChapterText;
            }

            const name = `${chapterNum}${nextChapterText}`;
            if (routeKey != it.route) {
                const routeName = routeData.items.find((jt: any) => jt.routerLink == it.route)?.name
                outputContainer.push({
                    "link": `../../${it.route}/${nextChapterKey || '1'}`,
                    "text": `${routeName} ${name}`.trim(),
                    "spoiler": !!it.spoiler
                })
            } else {
                outputContainer.push({
                    "link": `../${nextChapterKey}`,
                    "text": `${currentRoute} ${name}`.trim(),
                    "spoiler": !!it.spoiler
                })
            }

        })
    }

    private nextChapterKey(chapter: string, chapterData: ChapterConfig): string {
        if (chapterData.chapterOrder) {
            const index = chapterData.chapterOrder.findIndex((it) => it == chapter)
            return chapterData.chapterOrder[index + 1]
        } else {
            return (Number(chapter) + 1).toString()
        }
    }

    private prevChapterKey(chapter: string, chapterData: ChapterConfig): string {
        if (chapterData.chapterOrder) {
            const index = chapterData.chapterOrder.findIndex((it) => it == chapter)
            return chapterData.chapterOrder[index - 1]
        } else {
            return (Number(chapter) - 1).toString()
        }
    }
}