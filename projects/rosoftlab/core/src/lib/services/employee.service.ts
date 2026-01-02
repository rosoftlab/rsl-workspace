import { Injectable } from '@angular/core';
import { Employee } from '../models/employee';
import { BaseService } from './base.service';
import { DatastoreCore } from './datastore.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends BaseService<Employee> {

  constructor(datastore: DatastoreCore) {
    super(datastore);
    this.setModelType(Employee);
  }
}
