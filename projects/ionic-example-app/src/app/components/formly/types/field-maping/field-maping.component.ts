import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyKendoModule } from '@ngx-formly/kendo';

@Component({
  selector: 'formly-field-maping',
  templateUrl: './field-maping.component.html',
  styleUrls: ['./field-maping.component.scss'],
  imports: [
    FormlyModule,
    ReactiveFormsModule,
    FormlyKendoModule,
  ]
})
export class FieldMapingComponent extends FieldType<FieldTypeConfig> {
}
