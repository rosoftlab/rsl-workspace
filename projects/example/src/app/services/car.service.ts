import { Injectable } from '@angular/core';
import { BaseServiceFormly } from '@rosoftlab/formly';
import { Car } from '../models/administration/car';
import { Datastore } from './datastore.service';



@Injectable({
  providedIn: 'root'
})
export class CarService extends BaseServiceFormly<Car> {

  constructor(datastore: Datastore) {
    super(datastore);
    this.setModelType(Car);
  }
}
