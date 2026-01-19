import { Injectable } from '@angular/core';
import { DatastoreCore } from '@rosoftlab/core';
import { BaseServiceFormly } from '@rosoftlab/formly';
import { Employee } from './employee';



@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends BaseServiceFormly<Employee> {

  constructor(datastore: DatastoreCore) {
    super(datastore);
    this.setModelType(Employee);
  }

}
