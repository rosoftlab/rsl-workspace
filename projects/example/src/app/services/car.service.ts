import { Injectable } from '@angular/core';
import { BaseService } from '@rosoftlab/core';
import { Car } from '../models/car';
import { Datastore } from './datastore.service';



@Injectable({
  providedIn: 'root'
})
export class CarService extends BaseService<Car> {

  constructor(datastore: Datastore) {
    super(datastore);
    this.setModelType(Car);
  }
}
