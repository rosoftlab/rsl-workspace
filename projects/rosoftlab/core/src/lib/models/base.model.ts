import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModelConfig } from '../interfaces/model-config.interface';
import { MetadataStorage } from './metadata-storage';
export class BaseModel<TId = string> {
  public highlighted: boolean;

  public id: TId;
  
  [key: string]: any;

  // tslint:disable-next-line:variable-name
  constructor(data?: any) {
    if (data) {
      if (data.id) {
        this.id = data.id;
      }
      Object.assign(this, data);
    }
  }

  get modelConfig(): ModelConfig {
    return MetadataStorage.getMetadata('BaseModelConfig', this.constructor);
  }

  public getModelPropertyNames(model: BaseModel<any>) {
    const staticFields = (model.constructor as any).fields;
    if (Array.isArray(staticFields) && staticFields.length) {
      return staticFields.reduce((acc: any, key: string) => {
        acc[key] = key;
        return acc;
      }, {});
    }
    const properties: any = {};
    Object.keys(model)
      .filter((key) => !key.startsWith('_') && key !== 'highlighted')
      .forEach((key) => {
        properties[key] = key;
      });
    return properties;
  }
  public getModelRequiredPropertyNames(model: BaseModel<any>) {
    return (model.constructor as any).requiredFields || {};
  }
  public getModelDefaultPropertyValues(model: BaseModel<any>) {
    return (model.constructor as any).defaultValues || {};
  }

  public getModelSubGroupPropertyNames(model: BaseModel<any>) {
    return (model.constructor as any).formSubGroups || {};
  }

  public getFromGroup(fb: FormBuilder): FormGroup {
    const props = Object.keys(this.getModelPropertyNames(this));
    const requiredProps = this.getModelRequiredPropertyNames(this);
    const defaultValues = this.getModelDefaultPropertyValues(this);
    const formSubGroupsValues = this.getModelSubGroupPropertyNames(this);
    const controlsConfig: any = {};
    const that = this;
    if (props) {
      props.forEach((property) => {
        const value = that[property] !== undefined ? that[property] : defaultValues[property];
        const formSubGroup = formSubGroupsValues[property] ?? null;
        if (requiredProps[property]) {
          if (formSubGroup)
            this.getSubFromGroup(fb, controlsConfig, formSubGroup).addControl(property, fb.control(value, Validators.required));
          else controlsConfig[property] = [value, Validators.required];
        } else {
          if (formSubGroup) this.getSubFromGroup(fb, controlsConfig, formSubGroup).addControl(property, fb.control(value));
          else controlsConfig[property] = value;
        }
      });
    }
    return fb.group(controlsConfig);
  }
  private getSubFromGroup(fb: FormBuilder, controlsConfig: any, subGroup: string): FormGroup {
    if (!controlsConfig[subGroup]) controlsConfig[subGroup] = fb.group({});
    return controlsConfig[subGroup];
  }

  public getModelFromFormGroup(formGroup: FormGroup, id?: TId) {
    try {
      const props = Object.keys(this.getModelPropertyNames(this));
      const formSubGroupsValues = this.getModelSubGroupPropertyNames(this);
      const data: any = {};
      if (id) {
        data.id = id;
      }
      const that = this;
      if (props) {
        props.forEach((property) => {
          const formSubGroup = formSubGroupsValues[property] ?? null;
          if (!formSubGroup) data[property] = formGroup.controls[property].value ?? null;
          else data[property] = (formGroup.controls[formSubGroup] as FormGroup).controls[property].value ?? null;
        });
      }
      if (data) {
        if (id) {
          this.id = id;
        }
        Object.assign(this, data);
      }
    } catch (error) {
      Object.assign(this, formGroup.value);
    }
  }

  getCellClass(property: string) {
    return '';
  }
}
