import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AttributeMetadata } from '../constants/symbols';
import { Attribute } from '../core';
import { ModelConfig } from '../interfaces/model-config.interface';
import type { ModelType } from '../services/datastore-port';
import { MetadataStorage } from './metadata-storage';
export class BaseModel<TId = string> {
  public highlighted: boolean;

  @Attribute({ serializedName: 'id' })
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

  get attributeMetadata(): any {
    const attributesMetadata: any = this[AttributeMetadata];
    return attributesMetadata;
  }
  set attributeMetadata(val: any) {
    this[AttributeMetadata] = val;
  }
  get hasDirtyAttributes() {
    const attributesMetadata: any = this[AttributeMetadata];
    let hasDirtyAttributes = false;
    for (const propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        const metadata: any = attributesMetadata[propertyName];

        if (metadata.hasDirtyAttributes) {
          hasDirtyAttributes = true;
          break;
        }
      }
    }
    return hasDirtyAttributes;
  }

  rollbackAttributes(): void {
    const attributesMetadata: any = this[AttributeMetadata];
    let metadata: any;
    for (const propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        if (attributesMetadata[propertyName].hasDirtyAttributes) {
          this[propertyName] = attributesMetadata[propertyName].oldValue;
          metadata = {
            hasDirtyAttributes: false,
            newValue: attributesMetadata[propertyName].oldValue,
            oldValue: undefined
          };
          attributesMetadata[propertyName] = metadata;
        }
      }
    }

    this[AttributeMetadata] = attributesMetadata;
  }

  get modelConfig(): ModelConfig {
    return MetadataStorage.getMetadata('BaseModelConfig', this.constructor);
  }

  protected deserializeModel<T extends BaseModel>(modelType: ModelType<T>, data: any) {
    data = this.transformSerializedNamesToPropertyNames(modelType, data);
    return new modelType(data);
  }

  protected transformSerializedNamesToPropertyNames<T extends BaseModel>(modelType: ModelType<T>, attributes: any) {
    const serializedNameToPropertyName = this.getModelPropertyNames(modelType.prototype);
    const properties: any = {};

    Object.keys(serializedNameToPropertyName).forEach((serializedName) => {
      if (attributes[serializedName] !== null && attributes[serializedName] !== undefined) {
        properties[serializedNameToPropertyName[serializedName]] = attributes[serializedName];
      }
    });

    return properties;
  }

  public getModelPropertyNames(model: BaseModel<any>) {
    return MetadataStorage.getMergedMetadata('AttributeMapping', model);
  }
  public getModelRequiredPropertyNames(model: BaseModel<any>) {
    return MetadataStorage.getMergedMetadata('AttributeRequired', model);
  }
  public getModelDefaultPropertyValues(model: BaseModel<any>) {
    return MetadataStorage.getMergedMetadata('AttributedefaultValue', model);
  }

  public getModelSubGroupPropertyNames(model: BaseModel<any>) {
    return MetadataStorage.getMergedMetadata('AttributeformSubGroup', model);
  }

  public getFromGroup(fb: UntypedFormBuilder): UntypedFormGroup {
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
  private getSubFromGroup(fb: UntypedFormBuilder, controlsConfig: any, subGroup: string): UntypedFormGroup {
    if (!controlsConfig[subGroup]) controlsConfig[subGroup] = fb.group({});
    return controlsConfig[subGroup];
  }

  public getModelFromFormGroup(formGroup: UntypedFormGroup, id?: TId) {
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
          else data[property] = (formGroup.controls[formSubGroup] as UntypedFormGroup).controls[property].value ?? null;
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
