import { FormlyFieldConfig } from "@ngx-formly/core";
import { BaseModel } from "@rosoftlab/core";
import { FormlyModelConfig } from "./interfaces/formly-model-config";


export class BaseModelFormly extends BaseModel {
  getFormlyFields() {
    const formlyLayout: FormlyModelConfig[] = Reflect.getMetadata('FormlyLayout', this);
    const formlyFields: FormlyFieldConfig[] = [];
    const that = this;
    if (formlyLayout) {
      formlyLayout.forEach(property => {
        const propertyType = Reflect.getMetadata('design:type', that, property.key);
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
      });

    }
    return formlyFields;
  }
}