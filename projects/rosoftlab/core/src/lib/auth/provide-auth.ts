// library/src/lib/auth/provide-auth.ts
import { Provider } from '@angular/core';
import type { UserManagerSettings } from 'oidc-client-ts';
import { OIDC_CLIENT_SETTINGS, OIDC_GUEST_CLIENT_SETTINGS } from './tokens';
import { provideOidcUserManager } from './user-manager.factory';

export function provideAuth(settings: UserManagerSettings, guest_settings?: UserManagerSettings): Provider[] {
  return [
    { provide: OIDC_CLIENT_SETTINGS, useValue: settings },
    { provide: OIDC_GUEST_CLIENT_SETTINGS, useValue: guest_settings },
    provideOidcUserManager()
  ];
}
