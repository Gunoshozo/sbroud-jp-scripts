import { ChangeDetectorRef, Component, HostBinding, Inject, OnInit, ViewChild } from '@angular/core';
import {
	TuiThemeNightService,
	TuiThemeService,
} from '@taiga-ui/addon-doc/services';
import { TuiBrightness, TuiLabelModule, TuiLinkModule, TuiPrimitiveTextfieldModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { startWith, map, distinctUntilChanged, share } from 'rxjs';
import { SakuraService } from '../../services/sakura.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { defaultRepo, LocalStorageVariables } from '../../consts/general.const';
import { TuiInputModule, TuiIslandModule, TuiKeySteps, TuiSliderModule, TuiTextareaModule, TuiToggleModule } from '@taiga-ui/kit';
import { GlobalLoaderService } from '../../services/global-loader.service';
import { GameItem } from '../../models/reading.models';
import { ItemCardComponent } from '../common/item-card/item-card.component';

import { HeaderControlsComponent } from '../common/header-controls/header-controls.component';
import { FooterControlsComponent } from '../common/footer-controls/footer-controls.component';

@Component({
	selector: 'settings',
	templateUrl: './settings.component.html',
	standalone: true,
	imports: [
    FormsModule,
    ReactiveFormsModule,
    ItemCardComponent,
    HeaderControlsComponent,
    FooterControlsComponent,
	TuiLinkModule,
    TuiLabelModule,
    TuiIslandModule,
    TuiToggleModule,
    TuiSliderModule,
	TuiInputModule
]
})
export class SettingsComponent implements OnInit {


	@HostBinding('class') get classes() {
		return 'root';
	}

	public settingsForm: FormGroup = new FormGroup({
		"repo": new FormControl(defaultRepo),
		"sakura": new FormControl(true),
		"spoiler": new FormControl(true),
		"easterEggs": new FormControl(true),
		"fontMul": new FormControl(100)
	});

	public exampleItem: GameItem = {
		name: "Example",
		imgSrc: "assets/images/common/example-1000w.webp",
		routerLink: "/settings",
		spoiler: true
	}

	private sliderTimeout: any;
	private controls: any = {};

	readonly labels: string[] = ['1', '2', '3'];
	readonly segments: number = 2;
	readonly keySteps: TuiKeySteps = [
		[0, 100],
		[50, 200],
		[100, 300]
	];

	@ViewChild("card")
	public itemCard: ItemCardComponent;

	constructor(
		private globalLoaderService: GlobalLoaderService,
		private sakura: SakuraService,
		private cdr: ChangeDetectorRef,
		@Inject(TuiThemeService) readonly theme: TuiThemeService,
		@Inject(TuiThemeNightService) readonly night: TuiThemeNightService) { }

	ngOnInit(): void {
		window.scroll(0, 0);
		this.globalLoaderService.setGlobalLoader(true);
	}

	ngAfterViewInit(): void {
		this.sakura.bindSakura("settings");
		this.InitData();
		this.InitControls();
		this.globalLoaderService.setGlobalLoader(false);
	}

	private InitData(): void {
		this.cdr.detectChanges();
		let el: any = document.getElementsByTagName("settings")[0];

		const repoVal = localStorage.getItem(LocalStorageVariables.sourceRepo);
		if (repoVal == null) {
			this.controls["repo"] = new FormControl(defaultRepo);
			localStorage.setItem(LocalStorageVariables.sourceRepo, defaultRepo)
		} else {
			this.controls["repo"] = new FormControl(repoVal);
		}


		const sakuraAnimStorageVal = localStorage.getItem(LocalStorageVariables.sakuraAnim);
		if (sakuraAnimStorageVal == null) {
			this.controls["sakura"] = new FormControl(true);
		} else {
			this.controls["sakura"] = new FormControl(sakuraAnimStorageVal == 'true');
		}

		const hideSpoilersVar = localStorage.getItem(LocalStorageVariables.hideSpoilers);
		if (hideSpoilersVar == null) {
			this.controls["spoiler"] = new FormControl(true);
			el.style.setProperty("--spoiler-color", "gray")
			el.style.setProperty("--spoiler-background", "gray")
		} else {
			const val = hideSpoilersVar == 'true'
			this.controls["spoiler"] = new FormControl(hideSpoilersVar == 'true');
			if (val) {
				el.style.setProperty("--spoiler-color", "gray")
				el.style.setProperty("--spoiler-background", "gray")
			}
		}

		const easterEggStorageVal = localStorage.getItem(LocalStorageVariables.easterEggs);
		if (easterEggStorageVal == null) {
			this.controls["easterEggs"] = new FormControl(true);
		} else {
			this.controls["easterEggs"] = new FormControl(easterEggStorageVal == 'true');
		}

		const fontMult = localStorage.getItem(LocalStorageVariables.fontSizeMul);
		if (fontMult == null) {
			this.controls["fontMul"] = new FormControl(100.0);
			el.style.setProperty("--reading-font-size", '1rem');
		} else {
			this.controls["fontMul"] = new FormControl(parseFloat(fontMult) * 100);
			el.style.setProperty("--reading-font-size", `${fontMult}rem`);
		}
	}

	private InitControls(): void {
		this.settingsForm = new FormGroup(this.controls)

		this.settingsForm.controls["repo"].valueChanges.subscribe((it)=>{
			localStorage.setItem(LocalStorageVariables.sourceRepo, `${it}`);
		})

		this.settingsForm.controls["sakura"].valueChanges.subscribe((it) => {
			if (it) {
				this.sakura.startSakura();
			} else {
				this.sakura.stopSakura();
			}
			localStorage.setItem(LocalStorageVariables.sakuraAnim, `${it}`);
		})

		this.settingsForm.controls["spoiler"].valueChanges.subscribe((it) => {
			let el: any = document.getElementsByClassName("root")[0];
			localStorage.setItem(LocalStorageVariables.hideSpoilers, `${it}`);
			if (it) {
				el.style.setProperty("--spoiler-color", "gray")
				el.style.setProperty("--spoiler-background", "gray")
				this.itemCard.ngOnInit();
			} else {
				el.style.removeProperty("--spoiler-color")
				el.style.removeProperty("--spoiler-background")
				this.itemCard.toggleSpoiler(new MouseEvent(""));
			}

		})


		this.settingsForm.controls["easterEggs"].valueChanges.subscribe((it) => {
			localStorage.setItem(LocalStorageVariables.easterEggs, `${it}`);
		})

		this.settingsForm.controls["fontMul"].valueChanges.subscribe((it) => {
			let el: any = document.getElementsByClassName("root")[0];
			if (this.sliderTimeout) {
				clearTimeout(this.sliderTimeout)
			}
			this.sliderTimeout = setTimeout(() => {
				const rem = it / 100;
				localStorage.setItem(LocalStorageVariables.fontSizeMul, rem.toString())
				el.style.setProperty("--reading-font-size", `${rem}rem`);
			}, 0)
		})
	}

	readonly change$ = this.night;

	readonly night$ = this.change$.pipe(
		startWith(null),
		map(() => this.night.value),
		distinctUntilChanged(),
		share()
	);

	@HostBinding('attr.data-mode')
	get mode(): TuiBrightness | null {
		return this.night.value ? 'onDark' : null;
	}
}
