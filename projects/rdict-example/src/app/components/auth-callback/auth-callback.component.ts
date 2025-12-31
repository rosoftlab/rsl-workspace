import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { UserService } from '@rosoftlab/rdict';
import { ReactiveDictionary } from 'projects/rosoftlab/rdict/src/lib/reactive-dictionary';
// import { AuthService } from '../../shared/services/auth.service';
import { AuthService, UserService } from 'dist/@rosoftlab/core';
import { StorageService } from '../../shared/services/storage.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  standalone: false,
})
export class AuthCallbackComponent implements OnInit {
  error: boolean | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private userService: UserService,
    private rdict: ReactiveDictionary,
  ) {}

  async ngOnInit() {
    // check for error
    try {
      if (this.route!.snapshot!.fragment!.indexOf('error') >= 0) {
        this.error = true;
        return;
      }
    } catch (e) {}
    await this.authService.completeAuthentication();
    await this.rdict.initialize(this.authService.getToken);
    this.authService.authNavStatus$.subscribe((f) => {
      //console.log(f);
      if (f) {
        this.userService.getRights().subscribe((f) => {
          this.userService.userRights = f.getModels();
          const lastpath = this.storageService.retrieve('selectedMenu', true);
          if (this.userService.hasRightForLink(lastpath)) {
            if (lastpath) {
              this.router.navigate([lastpath]);
            } else {
              this.router.navigate(['']);
            }
          } else {
            this.router.navigate(['']);
          }
        });
      }
    });
  }
}
