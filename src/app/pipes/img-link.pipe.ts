import { Pipe, PipeTransform } from "@angular/core";
import { defaultRepo, LocalStorageVariables } from "../consts/general.const";


@Pipe({ name: "imgLink", pure: true, standalone: true })
export class ImgLinkPipe implements PipeTransform {
    transform(value: string) {
        let repoVal = localStorage.getItem(LocalStorageVariables.sourceRepo);
        if (repoVal == null) {
			repoVal = defaultRepo;
        }
      return value.replace("{assets}",repoVal);
  }
}