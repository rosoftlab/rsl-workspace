import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { KENDO_SVGICON } from '@progress/kendo-angular-icons';
import { DrawerItemExpandedFn, DrawerSelectEvent, LayoutModule } from '@progress/kendo-angular-layout';
import { KENDO_TOOLBAR, ToolBarModule } from '@progress/kendo-angular-toolbar';
import * as allIcons from '@progress/kendo-svg-icons';
import { logoutIcon, menuIcon, SVGIcon, userIcon } from '@progress/kendo-svg-icons';
import { AuthService, Menu, UserService } from '@rosoftlab/core';
import { ReactiveDictionary } from '@rosoftlab/rdict';
import { filter, Observable } from 'rxjs';
import { KendoToolbarSpanComponent } from './kendo-toolbar-span';

@Component({
  selector: 'rdict-full',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    CommonModule,
    ButtonsModule,
    ToolBarModule,
    LayoutModule,
    KENDO_SVGICON,
    KENDO_TOOLBAR,
    KendoToolbarSpanComponent
  ]
})
export class KendoFullLayoutComponent implements OnInit {
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
  public isExpanded = true;
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
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.syncDrawerWithUrl(event.urlAfterRedirects);
    });
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
        // 2. Trigger sync immediately after data loads
        // (Handles the initial "Refresh" or direct link scenario)
        // Now that this.items is populated, sync the state
        this.syncDrawerWithUrl(this.router.url);
      },
      error: (err) => console.error('Observable emitted an error: ' + err),
      complete: () => console.log('Observable emitted the complete notification')
    });
    // this.menu$ = this.userService.getMenus().pipe(
    //   map((f) => {
    //     const data = f.getModels();
    //     this.hasItems = data.length > 0;
    //     return data;
    //   })
    // );
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
  private syncDrawerWithUrl(url: string): void {
    if (!this.items || this.items.length === 0) return;

    // 1. Find the item matching the current URL
    // We use .includes() or .endsWith() to match the path regardless of the base URL
    const foundItem = this.items.find((item: any) => item.path && url.includes(item.path)) as any;

    if (foundItem) {
      // 2. Set the 'selected' property for the red background
      this.items.forEach((item: any) => (item.selected = false)); // Reset others
      foundItem.selected = true;

      // 3. Keep your existing logic for text and expansion
      this.selected = foundItem.text;

      const newExpandedIndices: any[] = [];
      let currentParentId = foundItem.parentId;

      while (currentParentId !== undefined) {
        newExpandedIndices.push(currentParentId);
        const parentItem = this.items.find((i: any) => i.id === currentParentId) as any;
        currentParentId = parentItem ? parentItem.parentId : undefined;
      }

      this.expandedIndices = [...newExpandedIndices];
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkWidth();
  }

  private checkWidth() {
    const width = window.innerWidth;
    if (width < 768) {
      this.isExpanded = false;
    } else {
      this.isExpanded = true;
    }
  }
}
