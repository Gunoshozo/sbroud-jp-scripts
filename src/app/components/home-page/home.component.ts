import { Component, HostBinding, OnInit } from '@angular/core';
import { GameItem } from '../../models/reading.models';
import { RestApiService } from '../../services/rest.service';
import { SakuraService } from '../../services/sakura.service';
import { ItemCardComponent } from '../common/item-card/item-card.component';
import { HeaderControlsComponent } from '../common/header-controls/header-controls.component';
import { FooterControlsComponent } from '../common/footer-controls/footer-controls.component';
import { NgStyle } from '@angular/common';


@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    NgStyle,
    ItemCardComponent,
    HeaderControlsComponent,
    FooterControlsComponent
],
  providers: [
    RestApiService
  ]
})
export class HomeComponent implements OnInit {

  @HostBinding('class') get classes() {
    return 'root';
  }

  constructor(private sakura: SakuraService,
    private apiService: RestApiService) { }

  public gameItems: GameItem[] = [];

  ngOnInit(): void {
    window.scroll(0, 0);
    this.sakura.bindSakura("home")

    this.apiService.get("gamesListConfig").subscribe((games: any) => {
      this.gameItems = (<any[]>games).map((game) => {
        return <GameItem>{
          routerLink: game.link,
          name: game.name,
          imgSrc: game.logo
        }
      })
    })
  }
}
