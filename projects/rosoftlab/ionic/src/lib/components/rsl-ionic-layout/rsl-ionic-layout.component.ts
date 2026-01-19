import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular'; // Ensure Ionic is installed
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService, UserService } from '@rosoftlab/core';
import { ReactiveDictionary } from '@rosoftlab/rdict';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-ionic-full-layout',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, TranslateModule, UserMenuComponent],
  templateUrl: './rsl-ionic-layout.component.html',
  styleUrls: ['./rsl-ionic-layout.component.scss']
})
export class RslIonicLayoutComponent implements OnInit {
  public items: any[] = [];
  public apptitle: string = 'Test';
  public expandedParents = new Set<string>();
  public expandedParentIds: string[] = []; // Controls which accordions are open
  constructor(
    private userService: UserService,
    private router: Router,
    public translate: TranslateService,
    private rdict: ReactiveDictionary,
    public auth_service: AuthService
  ) {}

  async ngOnInit() {
    this.apptitle = await this.rdict.asyncGet('appname');
    this.getMenu();
  }

  getMenu() {
    this.userService.getMenus().subscribe({
      next: (value) => {
        // We keep the hierarchy for Ionic's accordion or nested lists
        this.items = value.getModels();
        this.autoExpandCurrentRoute();
      }
    });
  }

  // Logic to ensure the parent accordion is open on refresh
  private autoExpandCurrentRoute() {
    const currentUrl = this.router.url;
    this.items.forEach((parent) => {
      if (parent.sublinks?.some((sub: any) => currentUrl.includes(sub.link))) {
        this.expandedParents.add(parent.id);
      }
    });
  }

  toggleParent(id: string) {
    if (this.expandedParents.has(id)) {
      this.expandedParents.delete(id);
    } else {
      this.expandedParents.add(id);
    }
  }

  logout() {
    this.auth_service.logout();
  }
}
