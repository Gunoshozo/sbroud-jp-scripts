import { Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { ReadableLine } from "../../models/lines.model";
import { TuiButtonModule, TuiHintModule } from "@taiga-ui/core";
import { NgClass } from "@angular/common";


@Component({
    selector: 'reading-line',
    templateUrl: './reading-line.component.html',
    standalone: true,
    imports: [
    NgClass,
    TuiHintModule,
    TuiButtonModule
]
})
export class ReadingLineComponent {

    @Input()
    public line: ReadableLine;

    @Input()
    public isBookmark: boolean;

    @Output()
    public addBookmark: EventEmitter<number> = new EventEmitter<number>()

    public hoveredLine: boolean = false;

    private timeout: any;

    constructor() { }

    @HostBinding("class")
    public get _classes() {
        return ["chapter-reading_line"]
    }

    onHover(val: boolean): void {
        if (!val) {
            if (!!this.timeout) {
                clearTimeout(this.timeout)
            }
            this.timeout = setTimeout(() => {
                this.hoveredLine = val;
            }, 0)
            return;
        }
        clearTimeout(this.timeout)
        this.hoveredLine = val
    }
}
