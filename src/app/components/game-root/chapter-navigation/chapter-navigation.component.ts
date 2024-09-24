import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatestWith, switchMap, of, tap } from 'rxjs';
import { GameNameMapping, LocalStorageVariables } from '../../../consts/general.const';
import { GameItem, ChapterConfig, ChapterNav } from '../../../models/reading.models';
import { RestApiService } from '../../../services/rest.service';
import { GameRootService } from '../game-root.serviece';
import { ItemCardComponent } from '../../common/item-card/item-card.component';
import { NgClass, NgStyle } from '@angular/common';
import { TuiButtonModule } from '@taiga-ui/core';
import { NameHelper } from '../../../helpers/name-helper';
import { ImgLinkPipe } from '../../../pipes/img-link.pipe';


@Component({
    selector: 'chapter-navigation',
    templateUrl: './chapter-navigation.component.html',
    standalone: true,
    imports: [
        ItemCardComponent,
        NgClass,
        NgStyle,
        RouterLink,
        TuiButtonModule,
        ImgLinkPipe
    ],
    providers: [
        RestApiService,
        
    ]
})
export class ChapterNavigationComponent implements OnInit {

    constructor(private route: ActivatedRoute, private router: Router, private gameRootService: GameRootService, private restApiService: RestApiService) { }

    //modes routed chapters, routless chapters, route select
    public _items: GameItem[] = [];
    public _routes: boolean = false;

    public headerText: string = ""

    public hasImages = false;

    private easterEggs = true;
    private gameName: string = ""

    ngOnInit(): void {
        window.scroll(0, 0);
        const observables = [this.route.paramMap]
        if (!GameNameMapping.mapping) {
            observables.push(this.restApiService.get("nameMapping").pipe(tap((file) => {
                GameNameMapping.mapping = file;
            })))
        }

        this.route.parent?.paramMap.pipe(
            combineLatestWith(observables),
            switchMap((params: any) => {
                this.easterEggs = localStorage.getItem(LocalStorageVariables.easterEggs) ? localStorage.getItem(LocalStorageVariables.easterEggs) == 'true' : true

                this.gameName = params[0].get('gameName');
                const last = this.router.url.split('/').at(-1);
                this._routes = last === 'routes'
                if (this._routes) {
                    return this.restApiService.get("gameRouteConfig", {
                        pathParams: {
                            "gameName": this.gameName
                        }
                    })
                } else {
                    const uri = params[1].has('routeName') ? "routedGameChapterConfig" : "nonRoutedGameChapterConfig";
                    return this.restApiService.get(uri, {
                        pathParams: {
                            "gameName": this.gameName,
                            "routeName": params[1].get('routeName')
                        }
                    }).pipe(
                        switchMap((chaptersResponse: ChapterConfig) => {
                            let chapters: any = []

                            const entries: { [key: string]: ChapterNav } = chaptersResponse.chapters;
                            let chaptersOrder = chaptersResponse.chapterOrder;

                            if (chaptersOrder) {
                                chaptersOrder.forEach((it, index: number) => {
                                    const name = NameHelper.resolveChapterName(chaptersResponse, index)
                                    chapters.push({
                                        name: name,
                                        routerLink: `${it}`
                                    })
                                });
                            } else {
                                for (let index = 1; index <= chaptersResponse.total; index++) {
                                    const name = NameHelper.resolveChapterName(chaptersResponse, index)
                                    chapters.push({
                                        name: name,
                                        routerLink: `${index}`
                                    })
                                }
                            }
                            return of({
                                "headerLabel": chaptersResponse.headerLabel
                                    || params[1].get('routeName') && `${params[1].get('routeName')} route chapters`
                                    || `${(GameNameMapping.mapping[this.gameName] && GameNameMapping.mapping[this.gameName] + ' ') || ''}chapters`,
                                "items": chapters
                            });
                        })
                    )
                }
            })).subscribe(
                {
                    next: (response: any) => {
                        if (this.easterEggs && response?.items.some((it: GameItem) => it.alternativeImgs)) {
                            this._items = response?.items.map((it: GameItem) => {
                                if (it.alternativeImgs) {
                                    if (Math.random() > 0.75) {
                                        if (it.alternativeImgs.length > 1) {
                                            it.imgSrc = this.selectRandom(it.alternativeImgs)
                                        } else {
                                            it.imgSrc = it.alternativeImgs[0]
                                        }
                                    }
                                }
                                return it
                            })
                        } else {
                            this._items = response?.items
                        }
                        this.hasImages = !!this._items?.some(it => !!it.imgSrc)

                        if (response.headerLabel) {
                            this.gameRootService.pushHeader(response.headerLabel);
                        }
                    },
                    error: () => {
                        this.router.navigate(["/error"])
                    }
                });
    }

    private selectRandom(arr: any[]): any {
        const ind: number = Math.floor(Math.random() * arr.length);
        return arr[ind];
    }
}