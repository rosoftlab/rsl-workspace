import { Injectable } from '@angular/core';
import { BaseQueryData, BaseService } from '@rosoftlab/core';
import { Observable } from 'rxjs';
import { Menu, Right, User } from '../models';
import { Datastore } from './datastore.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<User> {
  userRights!: Right[];  
  constructor(datastore: Datastore) {
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
  // getMenusByParentKey(parentKey: string, checkAlsoRight: boolean = false) {
  //   var parent = this.menus.find(f => f.rightKey === parentKey);
  //   if (parent)
  //     return this.getMenus(parent.id!, checkAlsoRight);
  //   else
  //     return null;
  // }
  // getMenus(parentId: string | null, checkAlsoRight: boolean = false): UserMenu[] {
  //   var data = this.menus.filter(f => f.parentId == parentId).sort((a, b) => (a.order > b.order) ? 1 : -1);
  //   if (checkAlsoRight) {
  //     var rights = this.userRights.filter(f => f.parentId == parentId).sort((a, b) => (a.order > b.order) ? 1 : -1).map(f => {
  //       {
  //         var userMenu = new UserMenu();
  //         userMenu.id = f.id;
  //         userMenu.icon = f.icon
  //         userMenu.translationKey = f.resourceName;
  //         userMenu.link = f.pagePath
  //         userMenu.parentId = f.parentId ?? null;
  //         userMenu.order = f.order;
  //         userMenu.rightKey = f.rightKey;
  //         return userMenu;
  //       }
  //     });
  //     data.push(...rights);
  //   }
  //   return data;
  // }
  // get menus(): UserMenu[] {
  //   if (!this.userMenus) {
  //     this.userMenus = this.userRights.filter(f => f.isMenu).map(f => {
  //       var userMenu = new UserMenu();
  //       userMenu.id = f.id;
  //       userMenu.icon = f.icon
  //       userMenu.translationKey = f.resourceName;
  //       userMenu.link = f.pagePath
  //       userMenu.parentId = f.parentId ?? null;
  //       userMenu.order = f.order;
  //       userMenu.rightKey = f.rightKey;
  //       return userMenu;
  //     })
  //     // console.log(this.userMenus);
  //   }
  //   return this.userMenus;
  // }
}
