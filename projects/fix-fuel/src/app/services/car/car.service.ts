import { Injectable } from '@angular/core';
import { BaseService, DatastoreCore } from '@rosoftlab/core';
import { Car } from './car';

@Injectable({
  providedIn: 'root'
})
export class CarService extends BaseService<Car> {
  constructor(datastore: DatastoreCore) {
    super(datastore);
    this.setModelType(Car);
  }
  // override getFormlyFields(model: Car): FormlyFieldConfig<FormlyFieldProps & { [additionalProperties: string]: any; }>[] {
  //   return CarFieldsConfig(this);
  // }
}
