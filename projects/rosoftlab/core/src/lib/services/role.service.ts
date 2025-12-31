import { Injectable } from '@angular/core';
import { DatastoreCore } from '../core';
import { Role } from '../models/role';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService  extends BaseService<Role> {

  constructor(datastore: DatastoreCore) {
    super(datastore);
    this.setModelType(Role);
  }

}
