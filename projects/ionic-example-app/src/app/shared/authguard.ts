import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserService } from '@rosoftlab/core';
import { StorageService } from './services/storage.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService); // Inject AuthService
  const userService = inject(UserService); // Inject UserService
  const storageService = inject(StorageService); // Inject StorageService
  const router = inject(Router); // Inject Router

  // Check if the user is authenticated
  if (authService.isAuthenticated()) {
    if (state.url !== '/dashboard') {
      if (userService.hasRightForLink(state.url)) {
        return true; // Allow navigation if the user has the right for the link
      } else {
        // Navigate to dashboard if the user does not have the right for the link
        router.navigate(['/dashboard']);
        return false;
      }
    } else {
      return true; // Allow navigation to dashboard
    }
  }
  // If not authenticated, store the selected menu and redirect to login
  storageService.store('selectedMenu', state.url, true);
  authService.login();
  return false; // Prevent navigation if the user is not authenticated
};
