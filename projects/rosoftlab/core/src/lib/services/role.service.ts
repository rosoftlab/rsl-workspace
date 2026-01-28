import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DATASTORE_PORT } from '../tokens/datastore-token';
import type { DatastorePort } from './datastore-port';
import { Right } from '../core';
import { Role } from '../models/role';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService<Role> {
  constructor(@Inject(DATASTORE_PORT) datastore: DatastorePort) {
    super(datastore);
    this.setModelType(Role);
  }
  public getRoleRights(roleId: string): Observable<Right[]> {
    const url = `${this.datastore.buildUrl(Role)}/${roleId}/rights`;
    return this.getCustom<Right[]>(null, null, url);
  }
}
