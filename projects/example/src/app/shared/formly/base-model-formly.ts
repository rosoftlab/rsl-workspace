import { FormlyFieldConfig } from "@ngx-formly/core";
import { BaseModel } from "@rosoftlab/core";
import { FormlyModelConfig } from "./interfaces/formly-model-config";


export class BaseModelFormly extends BaseModel {
  getFormlyFields() {
    const formlyLayout: FormlyModelConfig[] = Reflect.getMetadata('FormlyLayout', this);
    // const props = Object.keys(this.getModelPropertyNames(this));
    // const requiredProps = this.getModelRequiredPropertyNames(this);
    // const defaultValues = this.getModelDefaultPropertyValues(this);
    // const formSubGroupsValues = this.getModelSubGroupPropertyNames(this);
    const formlyFields: FormlyFieldConfig[] = [];
    const that = this;
    if (formlyLayout) {
      formlyLayout.forEach(property => {
        if (property.key !== 'id') {
          const value = that[property.key] !== undefined ? that[property.key] : property.defaultValue;
          // const formSubGroup = formSubGroupsValues[property] ?? null;
          const required = property.required !== undefined ? property.required : false
          formlyFields.push(
            {
              key: property.key,
              type: property.type,
              defaultValue: value,
              props: {
                translate: true,
                label: property.label,
                required,
                labelPosition: 'floating',
                description: property.description,
                placeholder: property.placeholder
              },
            })
        }
        // if (requiredProps[property]) {
        //   // if (formSubGroup)
        //   //   this.getSubFromGroup(fb, formlyFields, formSubGroup).addControl(property, fb.control(value, Validators.required));
        //   // else
        //   //formlyFields[property] = [value, Validators.required];
        //   formlyFields.push(fb.build<string>(
        //     {
        //       key: property,
        //       type: 'input',
        //       defaultValue: value,
        //       props: {
        //         translate: true,
        //         label: property,
        //         required: true,
        //         labelPosition: 'floating'
        //       },
        //     }))
        // } else {
        //   // if (formSubGroup)
        //   //   this.getSubFromGroup(fb, formlyFields, formSubGroup).addControl(property, fb.control(value));
        //   // else
        //   // formlyFields[property] = value;
        //   formlyFields.push(fb.build<string>(
        //     {
        //       key: property,
        //       type: 'input',
        //       defaultValue: value,
        //       props: {
        //         translate: true,
        //         label: property,
        //         labelPosition: 'floating'
        //       },
        //     }))
        // }
      });

    }
    return formlyFields;
  }
}