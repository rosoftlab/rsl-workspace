export class Tokens {
}
// library/src/lib/auth/tokens.ts
import { InjectionToken } from '@angular/core';
import type { UserManagerSettings } from 'oidc-client-ts';

export const OIDC_CLIENT_SETTINGS =  new InjectionToken<UserManagerSettings>('OIDC_CLIENT_SETTINGS');
export const OIDC_GUEST_CLIENT_SETTINGS =  new InjectionToken<UserManagerSettings>('OIDC_GUEST_CLIENT_SETTINGS');
