import { AfterViewInit, Component, HostBinding } from "@angular/core";
import { SakuraService } from "../../services/sakura.service";
import { HeaderControlsComponent } from "../common/header-controls/header-controls.component";
import { FooterControlsComponent } from "../common/footer-controls/footer-controls.component";
import { TuiBlockStatusModule } from "@taiga-ui/layout";

@Component({
  selector: 'error',
  templateUrl: './error.component.html',
  standalone: true,
  imports: [
    HeaderControlsComponent,
    FooterControlsComponent,
    TuiBlockStatusModule
  ]
})
export class ErrorComponent implements AfterViewInit {

  @HostBinding('class') get classes() {
    return 'root';
  }

  constructor(private sakura: SakuraService) { }

  ngAfterViewInit(): void {
    window.scroll(0, 0);
    this.sakura.bindSakura("error")
  }
}