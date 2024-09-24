import { HttpHeaders } from '@angular/common/http';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, ReplaySubject, Subject, forkJoin, of, switchMap } from 'rxjs';
import { RouteConfig, RouteItem, ChapterConfig } from '../../../../models/reading.models';
import { GlobalLoaderService } from '../../../../services/global-loader.service';
import { RestApiService } from '../../../../services/rest.service';
import { SearchableRoute } from '../../../models/search-config.model';
import { NameHelper } from '../../../../helpers/name-helper';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TuiCarouselModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiTextfieldControllerModule } from '@taiga-ui/core';


@Component({
	selector: 'routed-items',
	templateUrl: './routed-items.component.html',
	standalone: true,
	imports: [
		NgClass,
		RouterLink,
		TuiCarouselModule,
		TuiTextfieldControllerModule,
		TuiButtonModule
	]
})
export class RoutedItemsComponent implements OnInit, OnDestroy {

	@Input()
	public gameName: string;

	@Input()
	public set filterStr(value: string) {
		this.onFilter.next(value);
	}

	public _index: number = 0;

	private onLoad: ReplaySubject<void> = new ReplaySubject();
	private onFilter: Subject<string> = new Subject()

	public carouselCount: number = Math.ceil(window.innerWidth / 500);

	private prevSearchString = "";

	public initialItems: SearchableRoute[] = [];

	public filteredItems: SearchableRoute[] = [];

	constructor(private globalLoaderService: GlobalLoaderService, private restApi: RestApiService) { }

	ngOnInit(): void {
		this.subscribeOnChanges();
		this.restApi.get("gameRouteConfig", {
			pathParams: {
				"gameName": this.gameName
			}
		}).pipe(
			switchMap((routeConfig: RouteConfig) => {
				this.initialItems = routeConfig.items.map((item: RouteItem) => {
					return {
						"name": item.name,
						"spoiler": item.spoiler,
						"items": []
					}
				});
				const paths = routeConfig.items.map((it) =>
					this.restApi.get("routedGameChapterConfig",
						{
							pathParams: {
								"gameName": this.gameName,
								"routeName": it.routerLink
							}
						})
				)
				return forkJoin(paths).pipe(
					switchMap((chapterConfigs: ChapterConfig[]) => {
						this.buildInitialItems(chapterConfigs, routeConfig);
						this.globalLoaderService.setGlobalLoader(false);
						const pathsObj = this.getOrderedChapterTexts(chapterConfigs, routeConfig)
						return forkJoin(pathsObj)
					})
				)
			})
		).subscribe((it: string[][]) => {
			this.initialItems.forEach((route, rIndex) => {
				route.items.forEach((chapter, chIndex) => {
					chapter.text = it[rIndex][chIndex]
				})
			})
			this.filteredItems = this.initialItems;
			this.onLoad.next();
			this.onLoad.complete();
		})
	}

	ngOnDestroy(): void {
		this.onFilter.complete();
	}

	public scrollToTop() : void{
		window.scroll({top: 0, behavior: "smooth"})
	}

	//for each route get texts of each chapter
	private getOrderedChapterTexts(chapterConfig: ChapterConfig[], routeConfig: RouteConfig): Observable<string[]>[] {
		const configs = routeConfig.items.map((k, i) => [k, chapterConfig[i]]);
		return configs.map((item) => {
			const chapterConf = <ChapterConfig>item[1];

			const routeLink = (<RouteItem>item[0]).routerLink;

			return forkJoin(
				//create array for forkJoin
				// iterate by index in range (0, chapterConf.total)
				Array.from({ length: chapterConf.total }).map((_, index) => {
					let fileName = ""
					if (chapterConf.chapterOrder) {
						fileName = chapterConf.chapterOrder[index]
					}
					else {
						fileName = `${index + 1}`
					}
					// get file with text
					return this.restApi.get("routedChapterFile",
						{
							pathParams: {
								"gameName": this.gameName,
								"routeName": routeLink,
								"file": `${fileName}.txt`
							},
							requestOptions: {
								headers: new HttpHeaders({
									"Accept": "application/json;charset=utf-8",
								}),
								responseType: 'text'
							}
						})
				}))
		})
	}

	@HostListener('window:resize', ['$event'])
	onResize() {
		const ciel = Math.ceil(window.innerWidth / 500);
		const newCount = Math.max(Math.min(ciel, this.filteredItems?.length), 1);
		if (newCount != this.carouselCount) {
			this._index = 0;
		}
		this.carouselCount = newCount;
	}

	private subscribeOnChanges() {
		this.onFilter.pipe(
			switchMap((it) => {
				return [it];
			}),
			switchMap((it) => {
				return this.onLoad.pipe(switchMap(() => of(it)));
			})
		).subscribe((it) => {
			this.filterChapters(it);
			this.globalLoaderService.setGlobalLoader(false);
		})
	}

	private filterChapters(searchStr: string) {
		if (searchStr.length > 0) {
			let searchFrom: SearchableRoute[] = []
			if (searchStr.includes(this.prevSearchString)) {
				searchFrom = this.filteredItems;
			} else {
				searchFrom = this.initialItems;
			}
			this.filteredItems = searchFrom.map((it) => {
				const items = it.items.filter((ch) => ch.text.includes(searchStr))
				return {
					items: items,
					name: it.name,
					spoiler: it.spoiler
				}
			}).filter((it) => it.items.length > 0)
			this.prevSearchString = searchStr;
			this.onResize()
			this._index = 0;
		} else {
			if (this.filteredItems?.length != this.initialItems?.length) {
				this.filteredItems = this.initialItems;
				this.onResize()
				this._index = 0;
			}
		}
	}

	private buildInitialItems(chapterConfigs: ChapterConfig[], routeConfig: RouteConfig): void {
		chapterConfigs.forEach((chapterConf, i) => {
			for (let j = 0; j < chapterConf.total; j++) {
				let key;
				let name;
				if (chapterConf.chapterOrder) {
					key = chapterConf.chapterOrder[j];
					name = NameHelper.resolveChapterName(chapterConf, j);
				} else {
					key = `${j + 1}`
					name = NameHelper.resolveChapterName(chapterConf, j + 1);
				}
				this.initialItems[i].items.push({
					"name": name,
					"text": "",
					"routerLink": `../routes/${routeConfig.items[i].routerLink}/${key}`
				})
			}
		})
		this.filteredItems = this.initialItems;
		const ciel = Math.ceil(window.innerWidth / 500);
		this.carouselCount = Math.max(Math.min(ciel, this.filteredItems?.length), 1);
	}
}
