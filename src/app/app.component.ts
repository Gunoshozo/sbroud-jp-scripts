import {
	ChangeDetectorRef, Component, HostBinding, Inject, OnDestroy

} from '@angular/core';
import { GlobalLoaderService } from './services/global-loader.service';
import { Subject, distinctUntilChanged, map, share, startWith, takeUntil } from 'rxjs';

import { TuiBrightness, TuiDialogModule, TuiLoaderModule, TuiRootModule, TuiThemeNightModule } from '@taiga-ui/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TuiThemeService, TuiThemeNightService } from '@taiga-ui/addon-doc';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	standalone: true,
	imports: [
		CommonModule,
		RouterOutlet,
		TuiRootModule,
		TuiDialogModule,
		TuiLoaderModule,
		TuiThemeNightModule
	],
	providers: [
		GlobalLoaderService
	]
})
export class AppComponent implements OnDestroy {

	@HostBinding('attr.data-mode')
	get mode(): TuiBrightness | null {
		return this.night.value ? 'onDark' : null;
	}

	@HostBinding('class') get classes() {
		let res = []
		if (this.night.value) {
			res.push('dark')
		}
		return res;
	}

	public _loader: boolean = false;

	private unsubscribe: Subject<void> = new Subject();

	constructor(private globalLoaderService: GlobalLoaderService, private cdr: ChangeDetectorRef,
		@Inject(TuiThemeService) readonly theme: TuiThemeService,
		@Inject(TuiThemeNightService) readonly night: TuiThemeNightService) {
		this.globalLoaderService.getLoaderState().pipe(
			takeUntil(this.unsubscribe)
		).subscribe((res: boolean) => {
			this._loader = res;
			this.cdr.detectChanges();
		})
	}

	ngOnDestroy(): void {
		this.unsubscribe.next();
	}

	readonly change$ = this.night;

	readonly night$ = this.change$.pipe(
		startWith(null),
		map(() => this.night.value),
		distinctUntilChanged(),
		share()
	);
}
