import { Injectable } from "@angular/core";
import { LocalStorageVariables } from "../consts/general.const";
declare var Sakura: any;

@Injectable()
export class SakuraService {

    private sakuraAnim: any;

    public bindSakura(selector: string) {
        const sakuraAnimStorageVal = localStorage.getItem(LocalStorageVariables.sakuraAnim);
        this.sakuraAnim = new Sakura(selector);
        if (sakuraAnimStorageVal != null && sakuraAnimStorageVal == 'false') {
            this.stopSakura();
        }
    }

    public stopSakura(): void {
        this.sakuraAnim.stop(true);
    }

    public startSakura(): void {
        this.sakuraAnim.start();
    }
}