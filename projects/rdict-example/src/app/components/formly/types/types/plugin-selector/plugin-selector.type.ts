import { CommonModule } from '@angular/common';
import { Component, Type } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { FormlyFieldSelectProps, FormlySelectModule } from '@ngx-formly/core/select';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { FormlyFieldSelect } from '@ngx-formly/kendo/select';
import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
import { DocParserService } from 'projects/rdict-example/src/app/services/doc-parser.service';
import { ReactiveDictionary } from 'projects/rosoftlab/rdict/src/lib/reactive-dictionary';
import { firstValueFrom, Subscription } from 'rxjs';
interface SelectProps extends FormlyFieldProps, FormlyFieldSelectProps {
  primitive?: boolean;
}

export interface FormlySelectFieldConfig extends FormlyFieldConfig<SelectProps> {
  type: 'select' | Type<FormlyFieldSelect>;
}
@Component({
  selector: 'formly-plugin-selector',
  imports: [FormlyModule, ReactiveFormsModule, FormlyKendoModule, KENDO_DROPDOWNLIST, FormlySelectModule, CommonModule],
  template: `
    <kendo-dropdownlist
      [formControl]="formControl"
      [formlyAttributes]="field"
      [data]="props.options | formlySelectOptions: field | async"
      [textField]="'label'"
      [valueField]="'value'"
      [valuePrimitive]="props.primitive ?? true"
      
      (valueChange)="props.change && props.change(field, $event)"
      (selectionChange)="selectionChange($event)"
    >
    </kendo-dropdownlist>

    <formly-form *ngIf="dynamicFields.length" [fields]="dynamicFields" [model]="model.parameters" [form]="form.get('parameters')"> </formly-form>
  `,
})
export class PluginSelectorTypeComponent extends FieldType<FieldTypeConfig<SelectProps>> {
  pluginSelectField!: FormlyFieldConfig;
  dynamicFields: any[] = [];
  pluginList: any[] = [];
  pluginOptionsSub?: Subscription;
  plugins: any[] = [];
  constructor(
    private rdict: ReactiveDictionary,
    private docParserService: DocParserService,
  ) {
    super();
  }
  public selectionChange(value: any): void {}
  private create_pluginSelectField(plugin_name: any): any {
    const plugin = this.plugins.find((p) => p.name === plugin_name);
    const fields = this.docParserService.parse(plugin?.description || '');
    // console.log('fields', fields);
    this.dynamicFields = fields;
    const configForm = this.form.get('parameters') as FormGroup;
    // Clean up old controls
    Object.keys(configForm.controls).forEach((k) => configForm.removeControl(k));
    // Add new controls
    fields.forEach((f) => {
      configForm.addControl(f.key as string, new FormControl());
    });
  }
  async ngOnInit() {
    if (this.field.props?.options && typeof this.field.props.options === 'string') {
      const key = this.field.props.options;
      this.field.props.options = this.rdict.getArray$(key);
      this.plugins = await firstValueFrom(this.rdict.getArray$(key));
    } else {
      if (this.field.props.options && typeof this.field.props.options !== 'string') {
        this.plugins = Array.isArray(this.field.props.options) ? this.field.props.options : await firstValueFrom(this.field.props.options);
      } else {
        this.plugins = [];
      }
    }
    // console.log('plugins', this.plugins);
    // // Ensure config FormGroup exists
    if (!this.form.get('parameters')) {
      this.formGroup.addControl('parameters', new FormGroup({}));
    }
    // this.form.valueChanges.subscribe((value) => {
    //   console.log('form value change:', value);
    // });
    this.formControl.valueChanges.subscribe((value) => {
      // console.log('Custom value change:', value);
      if (value != undefined) this.create_pluginSelectField(value);
    });
  }
  get formGroup(): FormGroup {
    return this.form as FormGroup;
  }
  ngOnDestroy() {
    this.pluginOptionsSub?.unsubscribe();
  }
}
