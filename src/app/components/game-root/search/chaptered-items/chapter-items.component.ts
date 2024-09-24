import { HttpHeaders } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { switchMap, forkJoin, Observable, Subject, ReplaySubject, of } from 'rxjs';
import { ChapterConfig } from '../../../../models/reading.models';
import { GlobalLoaderService } from '../../../../services/global-loader.service';
import { RestApiService } from '../../../../services/rest.service';
import { SearchableChapter } from '../../../models/search-config.model';

import { RouterLink } from '@angular/router';
import { TuiButtonModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { NameHelper } from '../../../../helpers/name-helper';

@Component({
	selector: 'chapters-items',
	templateUrl: './chapter-items.component.html',
	standalone: true,
	imports: [
		TuiTextfieldControllerModule,
		TuiButtonModule,
		RouterLink
	]
})
export class ChapteredItemsComponent implements OnInit, OnDestroy {

	@Input()
	public gameName: string;

	@Input()
	public set filterStr(value: string) {
		this.onFilter.next(value);
	}

	public filteredItems: SearchableChapter[] = [];

	private onLoad: ReplaySubject<void> = new ReplaySubject();
	private onFilter: Subject<string> = new Subject()

	private initialItems: SearchableChapter[] = [];

	private prevSearchString = "";

	constructor(private globalLoaderService: GlobalLoaderService,
		private restApi: RestApiService) { }

	ngOnInit(): void {
		this.subscribeOnChanges();
		this.restApi.get("nonRoutedGameChapterConfig", {
			pathParams: {
				"gameName": this.gameName
			}
		}).pipe(
			switchMap((resChapterConfig: ChapterConfig) => {
				let count = resChapterConfig.total;
				let observables: Observable<string>[] = [];
				this.initialItems = new Array(count);
				for (let index = 0; index < count; index++) {
					this.initialItems[index] = <SearchableChapter>{};
					let key: string;
					let name: string;
					if (resChapterConfig.chapterOrder) {
						key = resChapterConfig.chapterOrder[index];
						name = NameHelper.resolveChapterName(resChapterConfig, index);
					} else {
						key = `${index + 1}`
						name = NameHelper.resolveChapterName(resChapterConfig, index + 1);
					}

					this.initialItems[index].name = name;
					this.initialItems[index].routerLink = `../chapters/${key}`;

					this.globalLoaderService.setGlobalLoader(false);

					observables.push(this.restApi.get("nonRoutedChapterFile", {
						pathParams: { "gameName": this.gameName, "file": `${key}.txt` },
						requestOptions: {
							headers: new HttpHeaders({
								"Accept": "application/json;charset=utf-8"
							}),
							responseType: 'text'
						}
					}));
				}
				this.filteredItems = this.initialItems;
				return forkJoin(observables);
			})
		).subscribe((it: string[]) => {
			it.forEach((v, i) => {
				this.initialItems[i].text = v;
			});
			this.filteredItems = this.initialItems;
			this.onLoad.next();
			this.onLoad.complete();
		})
	}

	ngOnDestroy(): void {
		this.onFilter.complete();
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
		if (searchStr?.length > 0) {
			let searchFrom = [];
			if (searchStr.includes(this.prevSearchString)) {
				searchFrom = this.filteredItems;
			} else {
				searchFrom = this.initialItems;
			}
			this.filteredItems = searchFrom?.filter((item) => {
				return item.text.includes(searchStr);
			})
			this.prevSearchString = searchStr;
		} else {
			if (this.filteredItems.length != this.initialItems.length) {
				this.filteredItems = this.initialItems;
			}
		}
	}
}
