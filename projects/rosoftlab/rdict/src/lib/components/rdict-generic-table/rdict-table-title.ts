import {
    Component,
    Input,
    TemplateRef,
    ViewChild,
    forwardRef
} from '@angular/core';
import { KENDO_LABEL } from '@progress/kendo-angular-label';
import { ToolBarToolComponent } from '@progress/kendo-angular-toolbar';

@Component({
    providers: [{ provide: ToolBarToolComponent, useExisting: forwardRef(() => RdictTableTitle) }],
    selector: 'table-title',
    standalone: true,
    imports: [
        
        KENDO_LABEL,
        
      ],
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