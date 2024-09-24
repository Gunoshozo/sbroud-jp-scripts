import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap, switchMap } from 'rxjs';
import { GlobalLoaderService } from '../../../services/global-loader.service';
import { RestApiService } from '../../../services/rest.service';
import { SearchConfig } from '../../models/search-config.model';
import { GameRootService } from '../game-root.serviece';

import { ChapteredItemsComponent } from './chaptered-items/chapter-items.component';
import { RoutedItemsComponent } from './routed-items/routed-items.component';
import { TuiPrimitiveTextfieldModule, TuiTextfieldControllerModule } from '@taiga-ui/core';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	standalone: true,
	imports: [
		ChapteredItemsComponent,
		RoutedItemsComponent,
		TuiPrimitiveTextfieldModule,
		TuiTextfieldControllerModule
	]
})
export class SearchComponent implements OnInit {

	public gameName: string;

	public _routed: boolean = false;

	public loaded: boolean;

	public routeName: string;

	private filterStr: string = "";

	private filterTimeout: any;

	public get filterString(): string {
		return this.filterStr;
	}

	public set filterString(value: string) {
		if (this.filterTimeout) {
			clearTimeout(this.filterTimeout);
		}
		this.filterTimeout = setTimeout(() => {
			this.filterStr = value;
		}, 600)
	}

	public constructor(private route: ActivatedRoute,
		private restApi: RestApiService,
		private gameRootService: GameRootService,
		private globalLoader: GlobalLoaderService) {
	}

	public ngOnInit(): void {
		window.scroll(0, 0);
		this.gameRootService.pushHeader("Search");

		this.route.parent?.paramMap.pipe(
			tap(() => {
				this.loaded = false;
				this.globalLoader.setGlobalLoader(true);
			}),
			switchMap((res) => {
				this.gameName = res.get("gameName") || ""
				return this.restApi.get("searchConfig",
					{
						pathParams: {
							"gameName": this.gameName
						}
					})
			})
		).subscribe((res: SearchConfig) => {
			this._routed = res.routed;
			this.loaded = true;
		})
	}

}
