import { HttpHeaders } from '@angular/common/http';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AttributeMetadata } from '../constants/symbols';
import { ModelConfig } from '../interfaces/model-config.interface';
import { BaseDatastore, ModelType } from '../services/base-datastore.service';
export class BaseModel {
  public highlighted: boolean;
  public id: any;
  [key: string]: any;

  // tslint:disable-next-line:variable-name
  constructor(protected _datastore: BaseDatastore, data?: any) {
    if (data) {
      if (data.id) {
        this.id = data.id;
      }
      Object.assign(this, data);
    }
  }

  save(
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string,
    customBody?: any): Observable<this> {
    const attributesMetadata: any = this[AttributeMetadata];
    return this._datastore.saveRecord(attributesMetadata, this, params, headers, customUrl, customBody);
  }

  patch(
    origModel: this,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<this> {
    const attributesMetadata: any = this[AttributeMetadata];
    return this._datastore.patchRecord(attributesMetadata, this, origModel, params, headers, customUrl);
  }

  replace(
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string,
    customBody?: any): Observable<this> {
    const attributesMetadata: any = this[AttributeMetadata];
    return this._datastore.replaceRecord(attributesMetadata, this, params, headers, customUrl, customBody);
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
    return Reflect.getMetadata('BaseModelConfig', this.constructor);
  }


  protected deserializeModel<T extends BaseModel>(modelType: ModelType<T>, data: any) {
    data = this.transformSerializedNamesToPropertyNames(modelType, data);
    return new modelType(this._datastore, data);
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

  public getModelPropertyNames(model: BaseModel) {
    return Reflect.getMetadata('AttributeMapping', model);
  }
  public getModelRequiredPropertyNames(model: BaseModel) {
    return Reflect.getMetadata('AttributeRequired', model);
  }
  public getModelDefaultPropertyValues(model: BaseModel) {
    return Reflect.getMetadata('AttributedefaultValue', model);
  }

  public getModelSubGroupPropertyNames(model: BaseModel) {
    return Reflect.getMetadata('AttributeformSubGroup', model);
  }

  public getFromGroup(fb: UntypedFormBuilder): UntypedFormGroup {
    const props = Object.keys(this.getModelPropertyNames(this));
    const requiredProps = this.getModelRequiredPropertyNames(this);
    const defaultValues = this.getModelDefaultPropertyValues(this);
    const formSubGroupsValues = this.getModelSubGroupPropertyNames(this);
    const controlsConfig: any = {};
    const that = this;
    if (props) {
      props.forEach(property => {
        const value = that[property] !== undefined ? that[property] : defaultValues[property];
        const formSubGroup = formSubGroupsValues[property] ?? null;
        if (requiredProps[property]) {
          if (formSubGroup)
            this.getSubFromGroup(fb, controlsConfig, formSubGroup).addControl(property, fb.control(value, Validators.required));
          else
            controlsConfig[property] = [value, Validators.required];
        } else {
          if (formSubGroup)
            this.getSubFromGroup(fb, controlsConfig, formSubGroup).addControl(property, fb.control(value));
          else
            controlsConfig[property] = value;
        }
      });

    }
    return fb.group(controlsConfig);
  }
  private getSubFromGroup(fb: UntypedFormBuilder, controlsConfig: any, subGroup: string): UntypedFormGroup {
    if (!controlsConfig[subGroup])
      controlsConfig[subGroup] = fb.group({});
    return controlsConfig[subGroup];
  }

  public getModelFromFormGroup(formGroup: UntypedFormGroup, id?: any) {
    const props = Object.keys(this.getModelPropertyNames(this));
    const formSubGroupsValues = this.getModelSubGroupPropertyNames(this);
    const data: any = {};
    if (id) {
      data.id = id;
    }
    const that = this;
    if (props) {
      props.forEach(property => {
        const formSubGroup = formSubGroupsValues[property] ?? null;
        if (!formSubGroup)
          data[property] = formGroup.controls[property].value ?? null;
        else
          data[property] = (formGroup.controls[formSubGroup] as UntypedFormGroup).controls[property].value ?? null;
      });
    }
    if (data) {
      if (id) {
        this.id = id;
      }
      Object.assign(this, data);
    }
  }

 

  public getSerializedModel() {
    const attributesMetadata: any = this[AttributeMetadata];
    return this._datastore.modelToEntity(this, attributesMetadata, true);
  }
  getCellClass(property: string) {
    return '';
  }
}
