import { FormlyFieldConfig } from "@ngx-formly/core";
// import { BaseModel, BaseService } from "@rosoftlab/core";
import { BaseModel, BaseService, MetadataStorage } from "@rosoftlab/core";
import { FormlyModelConfig } from "./interfaces/formly-model-config";


export class BaseModelFormly extends BaseModel {
  public showErrorState: false
  getFormlyFields(baseService: BaseService<BaseModelFormly>) {    
    return this.getFormlyFieldsForObject(baseService, this);
  }
  private getFormlyFieldsForObject(baseService: BaseService<BaseModelFormly>, instance: any) {
    const formlyLayout: FormlyModelConfig[] = MetadataStorage.getMetadata('FormlyLayout', instance);
    const formlyFields: FormlyFieldConfig[] = [];
    const that = instance;
    if (formlyLayout) {
      formlyLayout.forEach(property => {
        if (property.key !== 'id') {
          const value = that[property.key] !== undefined ? that[property.key] : property.defaultValue;
          const propType = MetadataStorage.getMetadata('design:type', instance, property.key)
          const required = property.required !== undefined ? property.required : false
          if (typeof propType === 'function' &&
            propType.prototype &&
            propType.prototype.constructor === propType &&
            propType.prototype.constructor.toString().startsWith('class ')) {
            const fields = this.getFormlyFieldsForObject(baseService, new propType())
            if (fields)
              formlyFields.push(
                {
                  key: property.key,
                  props: {
                    translate: true,
                    label: property.label
                  },
                  wrappers: ['panel'],
                  fieldGroup: fields
                }
              )
          } else {
            switch (property.type) {
              case "select": {
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
                      placeholder: property.placeholder,
                      options: baseService.getSelectValues(property.key),
                      valueProp: property.valueProp || 'value',
                      labelProp: property.labelProp || 'label',
                    },
                  })
                break;
              }
              case "toggle": {
                formlyFields.push(
                  {
                    key: property.key,
                    type: property.type,
                    defaultValue: value,
                    props: {
                      translate: true,
                      label: property.label,
                      required,
                      description: property.description,
                      placeholder: property.placeholder,
                    },
                  })
                break;
              }
              default: {
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
                break;
              }
            }
          }
        }
      });
    }
    return formlyFields;
  }

}