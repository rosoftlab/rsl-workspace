import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { KENDO_LAYOUT } from '@progress/kendo-angular-layout';

@Component({
  selector: 'app-form-editor',
  templateUrl: './form-editor.component.html',
  styleUrls: ['./form-editor.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, FormlyKendoModule, KENDO_LAYOUT],
})
export class FormEditorComponent implements OnChanges {
  @Input() fieldConfig: any[] = [];

  form = new FormGroup({});
  model = {};
  fields: FormlyFieldConfig[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fieldConfig']) {
      // Create a fresh instance for the preview
      this.fields = JSON.parse(JSON.stringify(this.fieldConfig));
      this.model = {};
      this.form = new FormGroup({});
    }
  }
}
