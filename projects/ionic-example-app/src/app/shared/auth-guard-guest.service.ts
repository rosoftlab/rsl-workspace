// import { Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// import { AuthService } from '@rosoftlab/core';
// import { Observable, of } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuardGuest implements CanActivate {
//   constructor(private authService: AuthService, private router: Router) {}

//   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
//     if (this.authService.isAuthenticated()) {
//       return of(true);
//     }

//     const token = localStorage.getItem('guest_token');
//     if (token) {
//       return this.authService.loginWithGuest().pipe(
//         map(() => true),
//         catchError(() => {
//           this.router.navigate(['/guest-registration'], { queryParams: { returnUrl: state.url } });
//           return of(false);
//         })
//       );
//     } else {
//       this.router.navigate(['/guest-registration'], { queryParams: { returnUrl: state.url } });
//       return of(false);
//     }
//   }
// }
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@rosoftlab/core';
import { StorageService } from './services/storage.service';

export const authGuardGuest: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService); // Inject AuthService
  const storageService = inject(StorageService); // Inject StorageService
  const router = inject(Router); // Inject Router

  // Check if the user is authenticated
  if (authService.isAuthenticated()) {
    return true; // Allow navigation to dashboard
  }
  // If not authenticated, store the selected menu and redirect to login
  storageService.store('selectedMenu', state.url, true);
  const token = localStorage.getItem('guest_token');
  if (!token) {
    return router.createUrlTree(['/guest-registration'], { queryParams: { returnUrl: state.url } });
  }

  try {
    await authService.loginWithGuest();
    return true;
  } catch {
    return router.createUrlTree(['/guest-registration'], { queryParams: { returnUrl: state.url } });
  }
};
