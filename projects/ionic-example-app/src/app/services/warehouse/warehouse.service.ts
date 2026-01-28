import { Injectable } from '@angular/core';
import { BaseService, DatastoreCore } from '@rosoftlab/core';
import { Warehouse } from './warehouse';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService extends BaseService<Warehouse> {
  constructor(datastore: DatastoreCore) {
    super(datastore);
    this.setModelType(Warehouse);
  }
}
