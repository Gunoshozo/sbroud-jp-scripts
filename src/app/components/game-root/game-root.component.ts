import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, ParamMap, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subject, distinctUntilChanged, filter, map, of, share, startWith, switchMap, takeUntil } from 'rxjs';
import { RestApiService } from '../../services/rest.service';
import {
	TuiThemeNightService,
	TuiThemeService,
} from '@taiga-ui/addon-doc/services';
import { TuiBrightness, TuiButtonModule, TuiDialogContext, TuiDialogModule, TuiDialogService, TuiHintModule, TuiRootModule } from '@taiga-ui/core';
import { GameRootService } from './game-root.serviece';
import { SakuraService } from '../../services/sakura.service';
import { LocalStorageVariables } from '../../consts/general.const';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { MobileHelper } from '../../helpers/mobile-helper';
import { NgClass, NgComponentOutlet } from '@angular/common';
import { TuiActiveZoneModule } from '@taiga-ui/cdk';
import { TuiSidebarModule } from '@taiga-ui/addon-mobile';

@Component({
	selector: 'game-root',
	templateUrl: './game-root.component.html',
	standalone: true,
	imports: [
    NgClass,
    NgComponentOutlet,
    RouterOutlet,
    RouterLink,
    TuiDialogModule,
    TuiSidebarModule,
    TuiButtonModule,
    TuiHintModule,
    TuiActiveZoneModule
],
	providers: [
		RestApiService,
		GameRootService,
		SakuraService
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GameRootComponent implements OnInit, AfterViewInit {

	@HostBinding('class') get classes() {
		let res = ['root']
		if (this.night.value) {
			res.push('dark')
		}
		return res;
	}

	@HostBinding('attr.data-mode')
	get mode(): TuiBrightness | null {
		return this.night.value ? 'onDark' : null;
	}

	public displayName: string = "";

	public sideBarOpen: boolean = false;

	public menuItems: any[] = [];

	public isMobile: boolean = false;

	public toChaptersLink: string = "";

	public bookmarkLink: string = "";

	private gameName: string = "";

	private unsubscribe: Subject<void> = new Subject();

	constructor(private route: ActivatedRoute,
		private router: Router,
		private rootService: GameRootService,
		private apiService: RestApiService,
		private sakura: SakuraService,
		private cdr: ChangeDetectorRef,
		@Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
		@Inject(TuiThemeService) readonly theme: TuiThemeService,
		@Inject(TuiThemeNightService) readonly night: TuiThemeNightService
	) {
		this.router.events
			.pipe(
				filter((e): e is NavigationEnd => e instanceof NavigationEnd)
			).subscribe(() => {
				const childParams = this.route.firstChild?.snapshot.params;
				if (childParams?.['chapterNumber'] && childParams?.['routeName']) {
					this.toChaptersLink = `routes/${childParams?.['routeName']}`
				} else {
					this.toChaptersLink = "";
				}
			})
	}

	public ngOnInit(): void {
		this.isMobile = MobileHelper.isMobile();

		this.sakura.bindSakura("game-root")

		this.rootService.getHeader().pipe(
			takeUntil(this.unsubscribe)
		).subscribe((header: string) => {
			this.displayName = this.addBreaks(header);
			this.cdr.detectChanges();
		})

		this.rootService.getBookmarkState().pipe(
			takeUntil(this.unsubscribe)
		).subscribe(() => {
			this.initBookmarkLink()
		})

		this.route.paramMap.pipe(
			switchMap((parameters: ParamMap) => {
				this.gameName = parameters.get("gameName") || ""

				this.initBookmarkLink()

				return this.apiService.get("gameConfig", {
					pathParams: {
						"gameName": this.gameName
					}
				})
			})
		).subscribe((res: any) => {
			this.menuItems = res
		})
	}

	public ngAfterViewInit(): void {
		this.initSettings()
	}

	toggle(open: boolean): void {
		this.sideBarOpen = open;
	}

	public onNavigate(event: MouseEvent) {
		event.stopPropagation();
		this.sideBarOpen = false;
	}

	public routerActivate(): void {
		window.scroll(0, 0)
	}

	public dialogueTxt: string = "";

	public showGameHelp(showGameHelp: PolymorpheusContent<TuiDialogContext>): void {

		this.apiService.get("gameInfo", {
			pathParams: {
				"gameName": this.gameName
			},
			requestOptions: {
				responseType: "text"
			}
		}).pipe(
			switchMap((it) => {
				this.dialogueTxt = it;
				return this.dialogs.open(showGameHelp);
			})
		).subscribe()
	}

	private prevScrollPos = window.scrollY

	private addBreaks(header: string): string {
		return header.replace("★", "<wbr/>★<wbr/>").replace(";", "<wbr/>;<wbr/>")
	}

	@ViewChild("header")
	private headerEl: ElementRef;

	// for window scroll events
	@HostListener('window:scroll', ['$event'])
	private onScroll(event: any) {
		const currentScrollPos = window.scrollY;
		if (this.prevScrollPos > currentScrollPos) {
			this.headerEl.nativeElement.style.top = "0"
		} else {
			this.headerEl.nativeElement.style.top = `-${this.headerEl.nativeElement.offsetHeight}px`
		}
		this.prevScrollPos = currentScrollPos;
	}

	private initBookmarkLink(): void {
		const key: string = LocalStorageVariables.bookmarkTemplateKey.replace("{gameName}", this.gameName);
		const value = localStorage.getItem(key)
		if (!value) {
			this.bookmarkLink = ""
			return;
		}

		const splits = value.split(":")
		if (splits.length == 3) {
			this.bookmarkLink = `routes/${splits[0]}/${splits[1]}`
		}

		if (splits.length == 2) {
			this.bookmarkLink = `chapters/${splits[0]}`
		}
	}

	private initSettings(): void {
		const el: any = document.getElementsByTagName("game-root")[0]

		const hideSpoilersVar = localStorage.getItem(LocalStorageVariables.hideSpoilers);
		if (hideSpoilersVar == null) {
			el.style.setProperty("--spoiler-color", "gray")
			el.style.setProperty("--spoiler-background", "gray")
		} else {
			const val = hideSpoilersVar == 'true'
			if (val) {
				el.style.setProperty("--spoiler-color", "gray")
				el.style.setProperty("--spoiler-background", "gray")
			} else {
				el.style.setProperty("--spoiler-color", "unset")
				el.style.setProperty("--spoiler-background", "unset")
			}

		}


		const fontMult = localStorage.getItem(LocalStorageVariables.fontSizeMul);
		if (fontMult == null) {
			el.style.setProperty("--reading-font-size", '1rem');
		} else {
			el.style.setProperty("--reading-font-size", `${fontMult}rem`);
		}
	}

	readonly change$ = this.night;

	readonly night$ = this.change$.pipe(
		startWith(null),
		map(() => this.night.value),
		distinctUntilChanged(),
		share()
	);

}