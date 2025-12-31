
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { KENDO_SVGICON } from '@progress/kendo-angular-icons';
import { DrawerItemExpandedFn, DrawerSelectEvent, LayoutModule } from '@progress/kendo-angular-layout';
import { KENDO_TOOLBAR, ToolBarModule } from '@progress/kendo-angular-toolbar';
import * as allIcons from '@progress/kendo-svg-icons';
import { logoutIcon, menuIcon, SVGIcon, userIcon } from '@progress/kendo-svg-icons';
import { AuthService, Menu, UserService } from '@rosoftlab/core';
import { map, Observable } from 'rxjs';
import { ReactiveDictionary } from '../../../reactive-dictionary';
import { KendoToolbarSpanComponent } from './kendo-toolbar-span';

@Component({
  selector: 'rdict-full',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss'],
  imports: [
    RouterModule,
    TranslateModule,
    ButtonsModule,
    ToolBarModule,
    LayoutModule,
    KENDO_SVGICON,
    KENDO_TOOLBAR,
    KendoToolbarSpanComponent
]
})
export class FullComponent implements OnInit {
  public selected = 'Inbox';
  public menuSvg: SVGIcon = menuIcon;
  public userSvg: SVGIcon = userIcon;

  public expandedIndices = [2];
  menu$!: Observable<Menu[]>;
  hasItems: boolean = false;
  public items: Array<{ [Key: string]: unknown }> = [];
  public icons = allIcons;
  //private rdict: ReactiveDictionary | undefined;
  apptitle: string = 'Test';
  public user_menu = [
    {
      text: 'Logout',
      svgIcon: logoutIcon,
      click: (): void => {
        this.auth_service.logout();
      }
    }
  ];
  constructor(
    private userService: UserService,
    private router: Router,
    public translate: TranslateService,
    private rdict: ReactiveDictionary,
    public auth_service: AuthService
  ) {
    this.getMenu();
  }

  async ngOnInit() {
    this.apptitle = await this.rdict.asyncGet('appname');
  }
  public isItemExpanded: DrawerItemExpandedFn = (item): boolean => {
    return this.expandedIndices.indexOf(item.id) >= 0;
  };
  getMenu() {
    this.userService.getMenus().subscribe({
      next: (value) => {
        this.items = this.transformToDrawerItems(value.getModels());
      },
      error: (err) => console.error('Observable emitted an error: ' + err),
      complete: () => console.log('Observable emitted the complete notification')
    });
    this.menu$ = this.userService.getMenus().pipe(
      map((f) => {
        const data = f.getModels();
        this.hasItems = data.length > 0;
        return data;
      })
    );
  }
  // public items: Array<DrawerItem> //= items;

  public onSelect(ev: DrawerSelectEvent): void {
    this.selected = ev.item.text;
    const current = ev.item.id;

    if (this.expandedIndices.indexOf(current) >= 0) {
      this.expandedIndices = this.expandedIndices.filter((id) => id !== current);
    } else {
      this.expandedIndices.push(current);
    }
    if (ev.item.path && ev.item.path !== '') {
      this.router.navigate([ev.item.path]);
      // this.router.navigateByUrl(ev.item.path);
      // this.router.navigate(['/import_layout']);
    }
  }
  private transformToDrawerItems(data: Menu[], parentId?: string): any {
    let drawerItems: Array<{ [Key: string]: unknown }> = [];

    data.forEach((item) => {
      const drawerItem = {
        id: item.id,
        text: this.translate.instant(item.translationKey),
        // icon: item.icon,
        svgIcon: this.icons[item.icon],
        selected: false, // Set this based on your application's state or logic
        parentId: parentId,
        path: item.sublinks && item.sublinks.length > 0 ? '' : item.link
      };

      drawerItems.push(drawerItem);

      // Recursively process children and flatten them
      if (item.sublinks && item.sublinks.length > 0) {
        const childItems = this.transformToDrawerItems(item.sublinks, item.id);
        drawerItems = drawerItems.concat(childItems); // Add children to the drawerItems array
      }
    });

    return drawerItems;
  }
}
