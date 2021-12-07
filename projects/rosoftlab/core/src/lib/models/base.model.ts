import { HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AttributeMetadata } from '../constants/symbols';
import { ModelConfig } from '../interfaces/model-config.interface';
import { BaseDatastore, ModelType } from '../services/base-datastore.service';
import { GridLayout } from './grid-layout';
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

  private getModelPropertyNames(model: BaseModel) {
    return Reflect.getMetadata('AttributeMapping', model);
  }
  private getModelRequiredPropertyNames(model: BaseModel) {
    return Reflect.getMetadata('AttributeRequired', model);
  }
  private getModelDefaultPropertyValues(model: BaseModel) {
    return Reflect.getMetadata('AttributedefaultValue', model);
  }
  public getFromGroup(fb: FormBuilder): FormGroup {
    const props = Object.keys(this.getModelPropertyNames(this));
    const requiredProps = this.getModelRequiredPropertyNames(this);
    const defaultValues = this.getModelDefaultPropertyValues(this);
    const controlsConfig: any = {};
    const that = this;
    if (props) {
      props.forEach(property => {
        const value = that[property] !== undefined ? that[property] : defaultValues[property];
        if (requiredProps[property]) {
          controlsConfig[property] = [value, Validators.required];
        } else {
          controlsConfig[property] = value;
        }
      });

    }
    return fb.group(controlsConfig);
  }

  public getGridLayout(): GridLayout[] {
    const result = Array<GridLayout>();
    const gridLayout: any = Reflect.getMetadata('GridLayout', this);
    if (gridLayout) {
      for (const layout of gridLayout) {
        const data = new GridLayout(layout.propertyName, layout.translateKey,
          layout.width, layout.shrink, layout.grow,
          layout.formating, layout.format, layout.order, layout.textAlign);
        result.push(data);
      }
    }
    return result.sort(function (a, b) { return a.order - b.order; })
    //result;
  }

  public getSerializedModel() {
    const attributesMetadata: any = this[AttributeMetadata];
    return this._datastore.modelToEntity(this, attributesMetadata, true);
  }
}
