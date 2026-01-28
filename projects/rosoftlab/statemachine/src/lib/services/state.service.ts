import { Inject, Injectable } from '@angular/core';
import { BaseService, DATASTORE_PORT } from '@rosoftlab/core';
import type { DatastorePort } from '@rosoftlab/core';
import { State } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StateService extends BaseService<State> {

  constructor(@Inject(DATASTORE_PORT) datastore: DatastorePort) {
    super(datastore);
    this.setModelType(State);
  }
}
