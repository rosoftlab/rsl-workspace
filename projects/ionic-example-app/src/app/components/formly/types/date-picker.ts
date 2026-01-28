// app-date-picker.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { KENDO_DATEPICKER } from '@progress/kendo-angular-dateinputs';
import { KENDO_LABEL } from '@progress/kendo-angular-label';

@Component({
  selector: 'formly-date-picker',
  imports: [FormlyModule, ReactiveFormsModule, FormlyKendoModule, KENDO_DATEPICKER, KENDO_LABEL, FormlySelectModule, CommonModule],
  template: `
    <kendo-datepicker
      [formControl]="formControl"
      [formlyAttributes]="field"
      [format]="props['format'] || 'dd/MM/yyyy'"
      [placeholder]="props.placeholder"
      [min]="props['min']"
      [max]="props['max']"
      (valueChange)="props.change && props.change(field, $event)"
    >
    </kendo-datepicker>
  `
})
export class FormlyKendoDatePickerComponent extends FieldType<FieldTypeConfig> implements OnInit {
  /**
   *
   */
  constructor() {
    super();
  }
  ngOnInit(): void {
    if (this.formControl.value) {
      const dateValue = new Date(this.formControl.value);
      if (isNaN(dateValue.getTime())) {
        console.warn('Data inițială nu este validă');
      } else {
        this.formControl.setValue(dateValue);
      }
    }
    this.formControl.valueChanges.subscribe((value) => {
      // 1. Verificăm dacă valoarea există
      debugger;
      if (value) {
        const dateValue = new Date(value);

        // 2. Verificăm dacă data este validă
        if (isNaN(dateValue.getTime())) {
          // Dacă e invalidă, putem reseta sau seta o eroare manuală
          // this.formControl.setErrors({ 'invalidDate': true });
          console.warn('Data introdusă nu este validă');
        } else {
          // 3. Dacă vrei să transformi valoarea (ex: doar data fără oră)
          // Atenție: patchValue declanșează valueChanges din nou,
          // de aceea folosim emitEvent: false
          /* const cleanDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
          if (value !== cleanDate) {
             this.formControl.patchValue(cleanDate, { emitEvent: false });
          }
          */
        }
      }
    });
  }
  verifyDate(value: any): boolean {
    const dateValue = new Date(value);
    return !isNaN(dateValue.getTime());
  }
}
