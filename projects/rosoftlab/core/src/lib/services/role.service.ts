import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DatastoreCore, Right } from '../core';
import { Role } from '../models/role';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService<Role> {
  constructor(datastore: DatastoreCore) {
    super(datastore);
    this.setModelType(Role);
  }
  public getRoleRights(roleId: string): Observable<Right[]> {
    const url = `${this.datastore.buildUrl(Role)}/${roleId}/rights`;
    return this.getCustom<Right[]>(null, null, url);
  }
}
