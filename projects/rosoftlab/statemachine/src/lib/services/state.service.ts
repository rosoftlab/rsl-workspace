import { Injectable } from '@angular/core';
import { BaseService, DatastoreCore } from '@rosoftlab/core';
import { State } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StateService extends BaseService<State> {

  constructor(datastore: DatastoreCore) {
    super(datastore);
    this.setModelType(State);
  }
}