// address-type.component.ts (Standalone Component)

import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';
import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
import {
  KENDO_FORMFIELD,
  KENDO_NUMERICTEXTBOX,
  KENDO_TEXTBOX,
} from '@progress/kendo-angular-inputs';
import { KENDO_LABEL } from '@progress/kendo-angular-label';

@Component({
  selector: 'app-address-type',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    KENDO_FORMFIELD,
    KENDO_LABEL,
    KENDO_TEXTBOX,
    KENDO_DROPDOWNLIST,
    KENDO_NUMERICTEXTBOX
],
  template: `
    <div [formGroup]="formGroup" class="address-fields">
      <kendo-formfield>
        <kendo-label
          for="street"
          text="Street"
          labelCssClass="k-form-label"
        ></kendo-label>
        <kendo-textbox
          id="street"
          formControlName="street"
          placeholder="Street"
        ></kendo-textbox>
      </kendo-formfield>

      <kendo-formfield>
        <kendo-label
          for="city"
          text="City"
          labelCssClass="k-form-label"
        ></kendo-label>
        <kendo-dropdownlist
          id="city"
          [data]="cities"
          formControlName="city"
        ></kendo-dropdownlist>
      </kendo-formfield>

      <kendo-formfield>
        <kendo-label
          for="zipCode"
          text="Zip Code"
          labelCssClass="k-form-label"
        ></kendo-label>
        <kendo-numerictextbox
          id="zipCode"
          formControlName="zipCode"
          placeholder="Zip Code"
          [min]="0"
          [format]="'n0'"
        ></kendo-numerictextbox>
      </kendo-formfield>
    </div>
  `,
  
})
export class AddressTypeComponent extends FieldType {
  cities = ['New York', 'Los Angeles', 'Chicago', 'Houston']; // Example list of cities
  get formGroup(): FormGroup {
    // console.log(this.formControl);
    // console.log(this.formControl as FormGroup);
    return this.formControl as FormGroup;
  }
}
