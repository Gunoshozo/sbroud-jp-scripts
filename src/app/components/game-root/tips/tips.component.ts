import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, switchMap, tap } from 'rxjs';
import { GameNameMapping } from '../../../consts/general.const';
import { Tip } from '../../../models/reading.models';
import { GameRootService } from '../game-root.serviece';
import { RestApiService } from '../../../services/rest.service';
import { TuiAccordionModule, TuiIslandModule } from '@taiga-ui/kit';
import { TuiPrimitiveTextfieldModule, TuiTextfieldControllerModule } from '@taiga-ui/core';

import { GlobalLoaderService } from '../../../services/global-loader.service';


@Component({
	selector: 'app-tips',
	templateUrl: './tips.component.html',
	standalone: true,
	imports: [
    TuiAccordionModule,
    TuiIslandModule,
    TuiPrimitiveTextfieldModule,
    TuiTextfieldControllerModule
]
})
export class TipsComponent implements OnInit {

	public _tipsList: Tip[] = [];

	public gameName: string = "";

	private filterStr: string = "";

	private filterTimeout: any;

	public get filterString(): string {
		return this.filterStr;
	}

	public set filterString(value: string) {
		this.filterStr = value;
		if (this.filterTimeout) {
			clearTimeout(this.filterTimeout);
		}
		this.filterTimeout = setTimeout(() => {
			this.onFilter(this.filterStr);
		}, 200)
	}

	public filteredTips: Tip[] = [];

	public header: string = ""

	public isDraw: boolean = false;

	public constructor(private activeRoute: ActivatedRoute, private router: Router, private restApiService: RestApiService, private gameRootService: GameRootService, private globalLoader: GlobalLoaderService) { }

	public ngOnInit(): void {
		const observables: any = {
			"parentParams": this.activeRoute.parent?.paramMap,
			"queryParams": this.activeRoute.parent?.queryParamMap
		};
		if (!GameNameMapping.mapping) {
			observables["mapping"] = this.restApiService.get("nameMapping").pipe(tap((file) => {
				GameNameMapping.mapping = file;
			}))
		}
		combineLatest(observables).pipe(
			switchMap((res: any) => {
				const query = res.queryParams?.params.filter;
				if (query) {
					this.filterStr = query
				}
				const params = res.parentParams;
				this.gameName = params.get('gameName') || ""
				this.header = `${(GameNameMapping.mapping[this.gameName] && GameNameMapping.mapping[this.gameName] + ' ') || ''}Tips`
				this.gameRootService.pushHeader(this.header);
				return this.restApiService.get("tips", {
					pathParams: {
						"gameName": this.gameName
					}
				})
			})
		).subscribe({
			next: (it) => {
				this._tipsList = (<Tip[]>it).map((it, _index) => {
					it.name = `${_index + 1}: ${it.name}`
					return it
				});
				this.filteredTips = this._tipsList;
				if (this.filterStr) {
					this.onFilter(this.filterStr);
				}
				this.isDraw = true;
			},
			error: () => {
				this.router.navigate(["/error"])
				this.globalLoader.setGlobalLoader(false);
			}
		})
	}


	public onFilter(text: string): void {
		if (!text) {
			this.filteredTips = JSON.parse(JSON.stringify(this._tipsList));
		} else {
			this.filteredTips = this._tipsList.filter(it =>
				it.name.toLowerCase().includes(text.toLowerCase()) ||
				it.pronunciation?.toLowerCase().includes(text.toLowerCase()) ||
				it.content.toLowerCase().includes(text.toLowerCase())
			)
		}
	}

}
