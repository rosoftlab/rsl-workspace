import { Inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { BaseQueryData, BaseService, Menu, Right, User } from '../core';
import { DATASTORE_PORT } from '../tokens/datastore-token';
import type { DatastorePort } from './datastore-port';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<User> {
  userRights!: Right[];
  constructor(@Inject(DATASTORE_PORT) datastore: DatastorePort) {
    super(datastore);
    this.setModelType(User);
  }
  getRights(): Observable<BaseQueryData<Right>> {
    const url = `${this.datastore.buildUrl(User)}/rights`;
    const response = this.datastore.findAll(Right, null, null, url);
    return response;
  }
  hasRightForLink(link: string): boolean {
    if (this.userRights && link) {
      const right = this.userRights.find((f) => link.indexOf(f.pagePath) >= 0);
      return true;
    }
    return false;
  }
  getMenus(): Observable<BaseQueryData<Menu>> {
    const response = this.datastore.findAll(Menu);
    return response;
  }
}
