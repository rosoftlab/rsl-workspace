import { Injectable } from '@angular/core';
import { DatastoreCore } from '../core';
import { Employee } from '../models';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends BaseService<Employee> {

  constructor(datastore: DatastoreCore) {
    super(datastore);
    this.setModelType(Employee);
  }
}
