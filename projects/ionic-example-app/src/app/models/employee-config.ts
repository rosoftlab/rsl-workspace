import { AbstractControl } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";

export function EmployeefieldsAdd(): FormlyFieldConfig[] {
  var x = EmployeefieldsEdit();
  x.push(
    {
      validators: {
        validation: [{ name: 'fieldMatch', options: { errorPath: 'confirmPassword' } }],
      },
      fieldGroup: [
        {
          "key": "password",
          "type": "input",
          "props": {
            "translate": true,
            "label": "Account.Form.Password",
            "required": true,
            "labelPosition": "floating",
            "type": 'password',
            minLength: 6,
          },
          validators: {
            hasNumber: {
              expression: (c: AbstractControl) => !c.value || /\d/.test(c.value),
              message: (error: any, field: FormlyFieldConfig) => `"${field.formControl.value}" 1`,
            },
            hasCapitalCase: {
              expression: (c: AbstractControl) => !c.value || /[A-Z]/.test(c.value),
              message: (error: any, field: FormlyFieldConfig) => `"${field.formControl.value}" 2`,
            },
            hasSmallCase: {
              expression: (c: AbstractControl) => !c.value || /[a-z]/.test(c.value),
              message: (error: any, field: FormlyFieldConfig) => `"${field.formControl.value}" 3`,
            },
            hasSpecialCharacters: {
              expression: (c: AbstractControl) => !c.value || /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(c.value),
              message: (error: any, field: FormlyFieldConfig) => `"${field.formControl.value}" 3`,
            },

          },
        },
        {
          "key": "confirmPassword",
          "type": "input",
          "props": {
            "translate": true,
            "label": "User.ConfirmPassword",
            "required": true,
            "labelPosition": "floating",
            "type": 'password'
          }
        },

      ]
    }
  )
  return x;
}


export function EmployeefieldsEdit(): FormlyFieldConfig[] {
  return [
    {
      "key": "userName",
      "type": "input",
      "props": {
        "translate": true,
        "label": "Account.UserName",
        "required": true,
        "labelPosition": "floating",
      }
    },
    {
      "key": "firstName",
      "type": "input",
      "props": {
        "translate": true,
        "label": "General.FirstName",
        "required": true,
        "labelPosition": "floating",
      }
    },
    {
      "key": "lastName",
      "type": "input",
      "props": {
        "translate": true,
        "label": "General.LastName",
        "required": true,
        "labelPosition": "floating",
      }
    },
    {
      "key": "email",
      "type": "input",
      "props": {
        "translate": true,
        "label": "General.Email",
        "required": true,
        "labelPosition": "floating",
      }
    }
  ]
}