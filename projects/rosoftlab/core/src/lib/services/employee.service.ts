import { Inject, Injectable } from '@angular/core';
import { DATASTORE_PORT } from '../tokens/datastore-token';
import type { DatastorePort } from './datastore-port';
import { Employee } from '../models';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends BaseService<Employee> {

  constructor(@Inject(DATASTORE_PORT) datastore: DatastorePort) {
    super(datastore);
    this.setModelType(Employee);
  }
}
