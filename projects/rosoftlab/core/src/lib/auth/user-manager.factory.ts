// library/src/lib/auth/user-manager.factory.ts
import { inject } from '@angular/core';
import { UserManager } from 'oidc-client-ts';
import { OIDC_CLIENT_SETTINGS } from './tokens';

export function provideOidcUserManager() {
  return {
    provide: UserManager,
    useFactory: () => new UserManager(inject(OIDC_CLIENT_SETTINGS)),
  };
}
