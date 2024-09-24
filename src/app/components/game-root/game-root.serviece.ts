import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";


@Injectable()
export class GameRootService {

    private headerSubject: Subject<string> = new Subject<string>();
    private bookmarkSubject: Subject<void> = new Subject<void>();

    public pushHeader(str: string) {
        this.headerSubject.next(str);
    }

    public getHeader(): Observable<string> {
        return this.headerSubject.asObservable();
    }

    public emitBookmarkChange() {
        this.bookmarkSubject.next();
    }

    public getBookmarkState(): Observable<void> {
        return this.bookmarkSubject.asObservable();
    }
}