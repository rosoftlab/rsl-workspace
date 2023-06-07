import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { StorageService } from 'projects/example/src/app/shared/services/storage.service';
import { AuthService, UserService } from '../services/index';
@Injectable()
export class AuthGuard implements CanActivate {
    private storage: any;
    constructor(private storageService: StorageService,
        private authService: AuthService,
        private userService: UserService,
        private router: Router) { }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.authService.isAuthenticated()) {
            if (state.url !== '/dashboard') {
                if (this.userService.hasRightForLink(state.url)) {
                    return true;
                } else {
                    // return false;
                    this.router.navigate(['/dashboard'])
                }
            } else {
                return true;
            }
        }
        this.storageService.store('selectedMenu', state.url, true)
        this.authService.login();
        return false;
    }
}
