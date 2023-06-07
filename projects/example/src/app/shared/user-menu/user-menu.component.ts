import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Menu } from 'projects/example/src/app/models';
import { UserService } from 'projects/example/src/app/services';
import { Observable, map } from 'rxjs';
@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent {
  hasItems: boolean = false;
  menu$!: Observable<Menu[]>;

  constructor(private userService: UserService,
    private translate: TranslateService,) {
    this.getMenu();
  }
  getMenu() {
    this.menu$ = this.userService.getMenus().pipe(map(f => {
      const data = f.getModels()
      this.hasItems = data.length > 0;
      return data;
    }));
  }
  getMenuTranslation(menu: Menu) {
    const result = this.translate.instant(menu.translationKey!);
    if (result === menu.translationKey) {
      return menu.title;
    }
    return result;
  }
  onMenuItemSelected(menuItem: Menu): void {
    console.log(menuItem);
  }
}
