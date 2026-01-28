import { Inject, Injectable } from '@angular/core';
import { DATASTORE_PORT } from '../tokens/datastore-token';
import type { DatastorePort } from './datastore-port';
import { Right } from '../core';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class RightService  extends BaseService<Right> {

  constructor(@Inject(DATASTORE_PORT) datastore: DatastorePort) {
    super(datastore);
    this.setModelType(Right);
  }

}
