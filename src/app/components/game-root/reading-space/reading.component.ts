import { HttpHeaders } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatestWith, forkJoin, of, switchMap, tap } from 'rxjs';
import { TextFormatter } from './helpers/text-formatter';
import { GlobalLoaderService } from '../../../services/global-loader.service';
import { GameRootService } from '../game-root.serviece';
import { ReadableLine } from './models/lines.model';
import { ChapterConfig, ChapterNav } from '../../../models/reading.models';
import { RestApiService } from '../../../services/rest.service';
import { LocalStorageVariables } from '../../../consts/general.const';
import { ReadingLineComponent } from './components/readling-line/reading-line.component';
import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { TuiElasticContainerModule, TuiIslandModule } from '@taiga-ui/kit';
import { NavigationComponent } from './components/navigation/navigation.component';


@Component({
    selector: 'reading-component',
    templateUrl: './reading.component.html',
    standalone: true,
    imports: [
    NgStyle,
    NgTemplateOutlet,
    ReadingLineComponent,
    NavigationComponent,
    TuiElasticContainerModule,
    TuiIslandModule
],
    providers: [
        RestApiService
    ]
})
export class ReadingComponent implements OnInit, AfterViewInit {

    public name: string;

    public lines: ReadableLine[];

    public gameName: string;

    public routeData: any;

    public navigationData: ChapterConfig;

    public _loading: boolean = true;

    public currentBookmark: number = -1;

    @ViewChildren(ReadingLineComponent, { read: ElementRef })
    private chapterLinesRef: QueryList<ElementRef>;

    private routed: boolean = false;

    private toBookmark: boolean = false;

    private chapterData: ChapterConfig;

    private chapter: string;

    private routePath: string;

    constructor(private activeRoute: ActivatedRoute,
        private restApiService: RestApiService,
        private router: Router,
        private gameRootService: GameRootService,
        private globalLoader: GlobalLoaderService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        let navData: any = {};

        this.activeRoute.parent?.paramMap.pipe(
            combineLatestWith([this.activeRoute.paramMap, this.activeRoute.parent.queryParamMap]),
            tap(() => {
                this.globalLoader.setGlobalLoader(true);
                this.cdr.detectChanges();
            }),
            switchMap((params: any) => {
                this.currentBookmark = -1;
                this.toBookmark = false;

                navData = {}
                const gameChanged = params[0].get('gameName') != this.gameName

                this.gameName = params[0].get('gameName');

                this.chapter = params[1].get('chapterNumber') || "";

                navData.chapter = this.chapter

                const routeChanged = this.routePath != (params[1].get('routeName') || "")

                this.routePath = params[1].get('routeName') || "";

                navData.route = this.routePath

                this.routed = params[1].has("routeName")


                this.parseQueryParams(params[2]);


                const uriChapterConf = this.routed ? "routedGameChapterConfig" : "nonRoutedGameChapterConfig";
                const uriChapterFile = this.routed ? "routedChapterFile" : "nonRoutedChapterFile";

                let observable: any = {
                    "config": routeChanged ?
                        this.restApiService.get(uriChapterConf, { pathParams: { "gameName": this.gameName, "routeName": params[1].get('routeName') } })
                        : of(this.chapterData),

                    "chapter": this.restApiService.get(uriChapterFile, {
                        pathParams: { "gameName": this.gameName, "routeName": params[1].get('routeName'), "file": `${this.chapter}.txt` },
                        requestOptions: {
                            headers: new HttpHeaders({
                                "Accept": "application/json;charset=utf-8"
                            }),
                            responseType: 'text'
                        }
                    })
                }
                if (this.routed) {
                    observable['routeConfig'] = gameChanged ?
                        this.restApiService.get("gameRouteConfig", { pathParams: { "gameName": this.gameName } }) : of(this.routeData);
                }

                return forkJoin(observable)
            })).subscribe({
                next: (res: any) => {
                    this.chapterData = <ChapterConfig>res.config;
                    if (res.routeConfig) {
                        this.routeData = res.routeConfig
                        navData.routeData = this.routeData
                    }

                    navData.chapterData = this.chapterData

                    this.lines = TextFormatter.preprocessTextString(res.chapter);

                    this.navigationData = navData;

                    this.name = this.resolveName(this.chapterData.chapters, res);

                    this.gameRootService.pushHeader(this.name);

                    setTimeout(() => {
                        Array.prototype.slice.call(document.getElementsByClassName("dict"))
                            .forEach((it: Element) => {
                                it.addEventListener("click", this.openTip.bind(this))
                            })
                    }, 100)
                },
                error: () => {
                    this.router.navigate(["/error"])
                    this.globalLoader.setGlobalLoader(false);
                }
            })
    }

    ngAfterViewInit(): void {
        this.chapterLinesRef.changes.subscribe(() => {
            if (this.toBookmark) {
                this.findBookMarkAndScroll();
            } else {
                window.scroll(0, 0);
                this.globalLoader.setGlobalLoader(false);
            }
        })
    }


    public addBookmark(index: number): void {
        const key: string = LocalStorageVariables.bookmarkTemplateKey.replace("{gameName}", this.gameName);
        if (this.currentBookmark == index) {
            localStorage.removeItem(key)
            this.currentBookmark = -1;
        } else {
            this.currentBookmark = index;
            let val: string = LocalStorageVariables.bookmarkTemplateValue[`${this.routed}`];
            val = val.replace("{routeName}", this.routePath).replace("{chapterIndex}", this.chapter).replace("{lineIndex}", `${this.currentBookmark}`);
            localStorage.setItem(key, val);
        }
        this.gameRootService.emitBookmarkChange();
    }

    private parseQueryParams(params: any): void {
        const bookmarkParam = params.get("toBookmark")

        const key: string = LocalStorageVariables.bookmarkTemplateKey.replace("{gameName}", this.gameName);
        const split = localStorage.getItem(key)?.split(":") || [];
        const bookmarkOnTheCurrentPage = this.routed ? split[0] === this.routePath && split[1] === this.chapter : split[0] === this.chapter
        this.toBookmark = bookmarkOnTheCurrentPage && bookmarkParam === "true";
        if (bookmarkOnTheCurrentPage) {
            this.currentBookmark = Number(split[split.length - 1]);
        }
    }

    private findBookMarkAndScroll(): void {
        const foundLine = this.findLine(this.lines, this.currentBookmark);
        if (foundLine) {
            //find element that has Bookmark button next to it
            const elRef = this.chapterLinesRef.find((it) => {
                return it.nativeElement.childNodes[0].childNodes[0].nodeName === "BUTTON"
            })?.nativeElement as HTMLElement;

            /// go up the tree from inside the the choice and open up all details tags
            let currentEl: any = elRef;
            while (!currentEl.className.includes("chapter-reading_content-text")) {
                currentEl = currentEl.parentElement;
                if (currentEl.className.includes("chapter-reading_choice") && currentEl.tagName == "DETAILS") {
                    currentEl.open = true
                }
            }

            //mumbo jumbo magic - need some timeout before scrolling to element so the visuals will draw in time
            setTimeout(() => {
                this.scrollWithOffset(elRef, -15)
                this.globalLoader.setGlobalLoader(false);
            }, 600)
        }
    }

    private scrollWithOffset(element: HTMLElement, offset: number): void {
        const y = element.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top: y });
    }


    private findLine(lines: ReadableLine[], lineIndex: number): ReadableLine | null {
        if (!!lines[lineIndex] && lines[lineIndex].index == lineIndex) {
            return lines[lineIndex]
        }

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].index == lineIndex) {
                return lines[i]
            }

            if (lines[i].isChoice) {
                if (i + 1 < lines.length) {
                    if (lineIndex < (lines[i + 1].index || Number.POSITIVE_INFINITY)) {
                        const res = this.findLine(<any>lines[i].innerLines, lineIndex);
                        if (res != null)
                            return res
                    }
                    continue;
                }
                const res = this.findLine(<any>lines[i].innerLines, lineIndex);
                if (res != null)
                    return res
            }
        }
        return null
    }

    private openTip(text: any): void {
        let newRelativeUrl = this.router.createUrlTree([`/games/${this.gameName}/tips`], { queryParams: { filter: this.resolveKanji(text.currentTarget.innerHTML) } });
        let baseUrl = window.location.href.replace(this.router.url, '');
        window.open(baseUrl + newRelativeUrl, '_blank');
    }

    private resolveName(chapters: { [key: string]: ChapterNav; }, res: any): string {
        const chapter = chapters[this.chapter]
        let routeName = ""
        if (res.routeConfig) {
            routeName = res.routeConfig.items.find((item: any) => item.routerLink === this.routePath)?.name + " - "
        }

        let name = ""

        if (chapter && chapter?.name) {
            name = `${routeName}`
            if (this.chapter[0] >= "0" && this.chapter[0] <= "9") {
                name += `${this.chapter}: `
            }
            name += `${chapter?.name}`
        } else {
            name = `${routeName}Chapter ${this.chapter}`
        }
        return name
    }

    private resolveKanji(innerHTML: string): string {
        let result = innerHTML.replaceAll("<ruby>", "").replaceAll("</ruby>", "");

        if (result.includes("•")) {
            return result.replaceAll("<rt>•</rt>", "")
        }
        if (result.includes("<rt>")) {
            const innerRubyPattern = /<rt>(.*?)<\/rt>/gm;
            let matches = [...result.matchAll(innerRubyPattern)];
            matches.forEach((match) => {
                result = result.replaceAll(match[0], '')
            })
        }
        return result
    }
}
