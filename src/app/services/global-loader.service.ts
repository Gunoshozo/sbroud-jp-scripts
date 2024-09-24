import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";


@Injectable()
export class GlobalLoaderService {

    private loaderStateSubject: Subject<boolean> = new Subject<boolean>();

    public setGlobalLoader(bool: boolean) {
        this.loaderStateSubject.next(bool)
    }

    public getLoaderState(): Observable<boolean> {
        return this.loaderStateSubject.asObservable();
    }
}