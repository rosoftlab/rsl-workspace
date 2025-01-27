import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { WrappersModule } from './wrappers.module';

@Component({
    selector: 'formly-wrapper-panel',
    template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{ props.label}}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ng-container #fieldComponent></ng-container>
      </ion-card-content>
    </ion-card>
  `,
    imports: [WrappersModule]
})
export class PanelWrapperComponent extends FieldWrapper { }
