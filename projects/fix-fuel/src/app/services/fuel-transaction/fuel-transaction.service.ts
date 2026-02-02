import { Injectable } from '@angular/core';
import { BaseService, DatastoreCore } from '@rosoftlab/core';
import { FuelTransaction } from './fuel-transaction';

@Injectable({
  providedIn: 'root'
})
export class FuelTransactionService extends BaseService<FuelTransaction> {
  constructor(datastore: DatastoreCore) {
    super(datastore);
    this.setModelType(FuelTransaction);
  }
}
