import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { CronControlComponent } from './cron-control.component';

@Component({
  selector: 'formly-cron-type',
  standalone: true,
  imports: [
    CronControlComponent,
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyKendoModule,
  ],
  template: `<app-cron-control
    [formControl]="formControl"
    [formlyAttributes]="field"
  ></app-cron-control>`,
})
export class FormlyCronTypeComponent extends FieldType {}
