import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'projects/example/src/app/services/auth.service';
import { UserService } from 'projects/example/src/app/services/user.service';
import { StorageService } from 'projects/example/src/app/shared/services/storage.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.scss']
})
export class AuthCallbackComponent implements OnInit {

  error: boolean | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private userService: UserService) { }

  async ngOnInit() {

    // check for error
    if (this.route!.snapshot!.fragment!.indexOf('error') >= 0) {
      this.error = true;
      return;
    }
    this.authService.completeAuthentication();
    this.authService.authNavStatus$.subscribe(f => {
      //console.log(f);
      if (f) {
        this.userService.getRights().subscribe(f => {
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
        })
      }
    })
  }
}
