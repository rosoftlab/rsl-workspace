import { Injectable } from '@angular/core';
import { BaseService } from '@rosoftlab/core';
import { Employee } from '../models';
import { Datastore } from './datastore.service';


@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends BaseService<Employee> {

  constructor(datastore: Datastore) {
    super(datastore);
    this.setModelType(Employee);
  }
}
