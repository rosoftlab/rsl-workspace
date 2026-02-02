import { Routes } from '@angular/router';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { FillGasComponent } from './components/fill-gas/fill-gas.component';
import { GuestRegistrationComponent } from './components/guest-registration/guest-registration.component';
import { authGuardGuest } from './shared/auth-guard-guest.service';

export const routes: Routes = [
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: 'guest-registration', component: GuestRegistrationComponent },
  { path: 'fill-gas', component: FillGasComponent, canActivate: [authGuardGuest] },
  { path: 'fill-gas/:id', component: FillGasComponent, canActivate: [authGuardGuest] },
  { path: '', redirectTo: 'fill-gas', pathMatch: 'full' },
  { path: '**', redirectTo: 'fill-gas' }
];
