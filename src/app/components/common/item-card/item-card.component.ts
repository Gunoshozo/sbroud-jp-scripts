import { Component, Input, OnInit } from '@angular/core';
import { ImgConsts, LocalStorageVariables, TextConsts } from '../../../consts/general.const';
import { TuiHintModule } from '@taiga-ui/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'item-card',
  templateUrl: './item-card.component.html',
  standalone: true,
  imports: [TuiHintModule, NgClass, RouterLink]
})
export class ItemCardComponent implements OnInit {

  @Input()
  public name: string = "";

  @Input()
  public link: string = "";

  @Input()
  public imageResource: string = '';

  @Input()
  public spoiler: boolean | undefined = false;

  @Input()
  public hideName: boolean = false;

  @Input()
  public hideTip: boolean = false;

  public image: string = '';
  public srcset: string = '';

  public hiddenBySpoiler: boolean = false;

  private intialImageResource: string = '';
  private initialName: string = "";


  ngOnInit(): void {
    this.intialImageResource = this.imageResource;
    this.initialName = this.name;

    const hideSpoilersVar = localStorage.getItem(LocalStorageVariables.hideSpoilers);

    if (this.spoiler && (hideSpoilersVar === "true" || !hideSpoilersVar)) {
      this.hiddenBySpoiler = !!this.spoiler;
      this.imageResource = ImgConsts.spoilerImg;
      this.name = TextConsts.spoilerPrompt;
    }
    this.setImg()
  }

  public toggleSpoiler(event: MouseEvent) {
    event.preventDefault()
    this.hiddenBySpoiler = false;
    this.imageResource = this.intialImageResource;
    this.name = this.initialName;
    this.setImg()
  }

  private setImg() {
    if (this.imageResource.includes("-1000w.webp")) {
      let res = ""
      ImgConsts.imgSizes.forEach((size) => {
        res += this.imageResource.replace("-1000w.webp", `-${size}w.webp`) + ` ${size}w, `
      })
      this.srcset = res;
    }
    this.image = this.imageResource;
  }
}
