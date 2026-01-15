import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { BaseQueryData, BaseService, DatastoreCore, Menu, Right, User } from '../core';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<User> {
  userRights!: Right[];
  constructor(datastore: DatastoreCore) {
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
