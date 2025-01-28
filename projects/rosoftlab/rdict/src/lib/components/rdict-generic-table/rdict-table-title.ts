import {
    Component,
    Input,
    TemplateRef,
    ViewChild,
    forwardRef
} from '@angular/core';
import { ToolBarToolComponent } from '@progress/kendo-angular-toolbar';

@Component({
    providers: [{ provide: ToolBarToolComponent, useExisting: forwardRef(() => RdictTableTitle) }],
    selector: 'table-title',
    standalone: true,
    template: `
        <ng-template #toolbarTemplate>
            <kendo-label>{{text}}</kendo-label>
        </ng-template>
    `
})
export class RdictTableTitle extends ToolBarToolComponent {
    public tabindex = -1;
    @ViewChild('toolbarTemplate', { static: true }) public declare toolbarTemplate: TemplateRef<any>;
    @Input() public text: string;
    constructor() {
        super();
    }
}