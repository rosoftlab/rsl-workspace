import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { WrappersModule } from './wrappers.module';

@Component({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'formly-accordion-panel',
  template: `

  <ion-accordion-group  [value]="['first']">
    <ion-accordion value="first">
        <ion-item slot="header">
            <ion-card-title>{{ props.label}}</ion-card-title>
        </ion-item>
        <div class="ion-padding" slot="content">
            <ng-container #fieldComponent></ng-container>
        </div>
    </ion-accordion>
  </ion-accordion-group>


            
  `,
  imports: [WrappersModule]
})
export class AccordionWrapperComponent extends FieldWrapper { }
