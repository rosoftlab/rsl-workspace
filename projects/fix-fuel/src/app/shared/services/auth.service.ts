import { Injectable } from '@angular/core';

import { User, UserManager, UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Observable navItem source
  private _authNavStatusSource = new BehaviorSubject<boolean>(false);
  // Observable navItem stream
  authNavStatus$ = this._authNavStatusSource.asObservable();

  private manager = new UserManager(getClientSettings());
  private user: User | null | undefined;

  constructor() {
    this.manager.getUser().then((user: User | null) => {
      this.user = user;
      this._authNavStatusSource.next(this.isAuthenticated());
    });
  }
  login() {
    this.manager.clearStaleState().then(() => {
      this.manager.signinRedirect();
    });
  }
  async completeAuthentication() {
    // console.log("completeAuthentication")
    await this.manager.signinRedirectCallback().then((user: User) => {
      this.user = user;
      this._authNavStatusSource.next(this.isAuthenticated());
    });
  }

  isAuthenticated(): boolean {
    return this.user != null && !this.user.expired;
  }

  get authorizationHeaderValue(): string {
    return this.user != null ? `${this.user.token_type} ${this.user.access_token}` : '';
  }
  get getToken(): string {
    return this.user != null ? `${this.user.access_token}` : '';
  }
  get getId(): string | null {
    return this.user != null ? this.user.profile.sub : null;
  }
  get name(): string {
    return this.user != null ? this.user.profile?.['first_name'] + ' ' + this.user.profile?.['last_name'] : '';
  }
  get email(): string | null | undefined {
    return this.user != null ? this.user.profile?.email : '';
  }
  get firstName(): string {
    return this.user != null ? (this.user.profile as any)['first_name'] : '';
  }
  set firstName(newValue: string) {
    this.user!.profile!['first_name'] = newValue;
  }
  get lastName(): string {
    return this.user != null ? (this.user.profile?.['last_name'] as string) : '';
  }
  set lastName(newValue: string) {
    this.user!.profile!['last_name'] = newValue;
  }
  get userCode(): string {
    return this.user != null ? (this.user.profile?.['user_code'] as string) : '';
  }
  get roles(): string {
    return this.user != null ? (this.user.profile?.['roles'] as string) : '';
  }

  get organisationId(): string {
    return this.user != null ? (this.user.profile?.['organization_id'] as string) : '';
  }
  get organisationName(): string {
    return this.user != null ? (this.user.profile?.['organization_name'] as string) : '';
  }
  async signout() {
    await this.manager.signoutRedirect();
  }
}

export function getClientSettings(): UserManagerSettings {
  const origin = location.origin;
  const identityUrl = environment.authUrl;
  return {
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    authority: identityUrl,
    client_id: 'WebApp',
    redirect_uri: origin + '/auth-callback',
    post_logout_redirect_uri: origin,
    response_type: 'code',
    scope: 'openid profile common file optiPark',
    filterProtocolClaims: true,
    loadUserInfo: true,
    automaticSilentRenew: false,
    //,    silent_redirect_uri: origin + '/silent-refresh.html'
  };
}
