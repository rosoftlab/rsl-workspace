
import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldTypeConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { FieldType, FormlyFieldProps } from '@ngx-formly/kendo/form-field';
import { KENDO_TEXTBOX } from '@progress/kendo-angular-inputs';
import { cartIcon, eyeIcon, SVGIcon } from '@progress/kendo-svg-icons';

interface InputProps extends FormlyFieldProps {}

export interface FormlyInputFieldConfig extends FormlyFieldConfig<InputProps> {
  type: 'input' | Type<PasswordFieldInput>;
}

@Component({
  selector: 'formly-field-kendo-password',
  imports: [FormlyModule, ReactiveFormsModule, FormlyKendoModule, KENDO_TEXTBOX, FormlySelectModule],
  template: `
    <kendo-textbox [type]="showPassword ? 'text' : 'password'" [formlyAttributes]="field" [formControl]="formControl">
      <ng-template kendoTextBoxSuffixTemplate>
        <button kendoButton [svgIcon]="svgCart" (click)="togglePasswordVisibility()">Show</button>
      </ng-template>
    </kendo-textbox>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordFieldInput extends FieldType<FieldTypeConfig<InputProps>> {
  showPassword = false;
  public svgEye: SVGIcon = eyeIcon;
  public svgCart: SVGIcon = cartIcon;
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
