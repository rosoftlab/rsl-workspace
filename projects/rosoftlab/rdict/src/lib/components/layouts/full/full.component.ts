import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { KENDO_SVGICON } from '@progress/kendo-angular-icons';
import { DrawerItemExpandedFn, DrawerSelectEvent, LayoutModule } from '@progress/kendo-angular-layout';
import { ToolBarModule } from '@progress/kendo-angular-toolbar';
import * as allIcons from "@progress/kendo-svg-icons";
import { menuIcon, SVGIcon } from "@progress/kendo-svg-icons";
import { map, Observable } from 'rxjs';
import { Menu } from '../../../models';
import { ReactiveDictionary } from '../../../reactive-dictionary';
import { SocketService, UserService, WsAuthService } from '../../../services';
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
        KENDO_SVGICON
    ]
})
export class FullComponent implements OnInit {
  public selected = "Inbox";
  public menuSvg: SVGIcon = menuIcon;
  public expandedIndices = [2];
  menu$!: Observable<Menu[]>;
  hasItems: boolean = false;
  public items: Array<{ [Key: string]: unknown }> = [];
  public icons = allIcons;
  private rdict: ReactiveDictionary | undefined;
  apptitle: string = "Test"
  constructor(
    private userService: UserService,
    private router: Router,
    private socketService: SocketService,
    public translate: TranslateService,
    private wsAuthService: WsAuthService
  ) {
    this.getMenu();
  }

  async ngOnInit() {
    this.rdict = ReactiveDictionary.getInstance(this.socketService,this.wsAuthService.Token);
    if (this.rdict.size == 0)
      await this.rdict.asyncInit();
    this.apptitle = await this.rdict.asyncGet("appname")

  }
  public isItemExpanded: DrawerItemExpandedFn = (item): boolean => {
    return this.expandedIndices.indexOf(item.id) >= 0;
  };
  getMenu() {
    this.userService.getMenus().subscribe(
      {
        next: value => {
          this.items = this.transformToDrawerItems(value.getModels())
        },
        error: err => console.error('Observable emitted an error: ' + err),
        complete: () => console.log('Observable emitted the complete notification')
      }
    )
    this.menu$ = this.userService.getMenus().pipe(map(f => {
      const data = f.getModels()
      this.hasItems = data.length > 0;
      return data;
    }));
  }
  // public items: Array<DrawerItem> //= items;

  public onSelect(ev: DrawerSelectEvent): void {
    this.selected = ev.item.text;
    const current = ev.item.id;

    if (this.expandedIndices.indexOf(current) >= 0) {
      this.expandedIndices = this.expandedIndices.filter(
        (id) => id !== current
      );
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

    data.forEach(item => {
      const drawerItem = {
        id: item.id,
        text: this.translate.instant(item.translationKey),
        // icon: item.icon,
        svgIcon: this.icons[item.icon],
        selected: false, // Set this based on your application's state or logic
        parentId: parentId,
        path: (item.sublinks && item.sublinks.length > 0) ? '' : item.link
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
