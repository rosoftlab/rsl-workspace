import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef, ViewChild, forwardRef } from '@angular/core';
import { ToolBarToolComponent } from '@progress/kendo-angular-toolbar';

@Component({
  providers: [{ provide: ToolBarToolComponent, useExisting: forwardRef(() => KendoToolbarSpanComponent) }],
  selector: 'kendo-toolbar-span',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #toolbarTemplate>
      <span [ngClass]="cssClass" [textContent]="text"></span>
    </ng-template>
  `
})
export class KendoToolbarSpanComponent extends ToolBarToolComponent {
  public tabindex = -1;
  @Input() text = '';
  @Input() cssClass: string | string[] | { [klass: string]: boolean } = '';
  @ViewChild('toolbarTemplate', { static: true }) public declare toolbarTemplate: TemplateRef<any>;
  constructor() {
    super();
  }
}
