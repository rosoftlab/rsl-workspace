import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { TranslateModule } from '@ngx-translate/core';
;
@Component({
  standalone: true,
  selector: 'app-rdict-crud',
  templateUrl: './rdict-crud.component.html',
  styleUrls: ['./rdict-crud.component.scss'],
  imports: [
    FormlyModule,
    ReactiveFormsModule,
    FormlyKendoModule,
    TranslateModule
  ]
})
export class RdictCrudComponent implements OnInit {
  baseForm = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'name',
      type: 'input',
      props: {
        label: 'General.Name',
        translate: true,
        required: true,
      },
    },
  ];


  constructor() { }

  ngOnInit() {
  }
  onSubmit(model) {
  }
}
