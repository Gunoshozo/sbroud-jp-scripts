import { Component, HostBinding, Inject } from "@angular/core";
import { TuiThemeService, TuiThemeNightService } from "@taiga-ui/addon-doc";
import { SakuraService } from "../../services/sakura.service";
import { TuiHintModule, TuiSvgModule } from "@taiga-ui/core";
import { TuiIslandModule } from "@taiga-ui/kit";
import { HeaderControlsComponent } from "../common/header-controls/header-controls.component";
import { FooterControlsComponent } from "../common/footer-controls/footer-controls.component";

@Component({
    selector: 'gen-info',
    templateUrl: './general-info.component.html',
    standalone: true,
    imports: [
        HeaderControlsComponent,
        FooterControlsComponent,
        TuiSvgModule,
        TuiHintModule,
        TuiIslandModule,
    ]
})
export class GeneralInfoComponent {

    @HostBinding('class') get classes() {
        return 'root';
    }

    constructor(
        private sakura: SakuraService,
        @Inject(TuiThemeService) readonly theme: TuiThemeService,
        @Inject(TuiThemeNightService) readonly night: TuiThemeNightService) { }


    ngAfterViewInit(): void {
        this.sakura.bindSakura("gen-info")
    }
}