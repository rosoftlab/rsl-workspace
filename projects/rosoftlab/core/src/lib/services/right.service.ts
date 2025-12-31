import { Injectable } from '@angular/core';
import { DatastoreCore, Right } from '../core';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class RightService  extends BaseService<Right> {

  constructor(datastore: DatastoreCore) {
    super(datastore);
    this.setModelType(Right);
  }

}
