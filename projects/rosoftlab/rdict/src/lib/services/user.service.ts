import { Injectable } from '@angular/core';
import { BaseQueryData, BaseService, DatastoreCore } from "@rosoftlab/core";
import { Observable } from 'rxjs';
import { Menu } from '../models/menu';
import { Right } from '../models/right';
import { User } from '../models/user';

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
    const response = this.datastore.findAll(Right);
    return response;
  }
  hasRightForLink(link: string): boolean {

    if (this.userRights && link) {
      const right = this.userRights.find(f => link.indexOf(f.pagePath) >= 0);
      return true;
    }
    return false;
  }
  getMenus(): Observable<BaseQueryData<Menu>> {
    const response = this.datastore.findAll(Menu);
    return response;
  }  
}
