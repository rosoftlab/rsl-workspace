import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import type { UserManagerSettings } from 'oidc-client-ts';
import { User, UserManager } from 'oidc-client-ts';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { OIDC_GUEST_CLIENT_SETTINGS } from './tokens';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Observable navItem source
  private _authNavStatusSource = new BehaviorSubject<boolean>(false);
  // Observable navItem stream
  authNavStatus$ = this._authNavStatusSource.asObservable();

  // private manager = new UserManager(getClientSettings());
  private user: User | null | undefined;

  constructor(
    private manager: UserManager,
    private http: HttpClient,
    @Optional() @Inject(OIDC_GUEST_CLIENT_SETTINGS) private guestSettings?: UserManagerSettings
  ) {
    this.manager.getUser().then((user) => {
      this.user = user;
      this._authNavStatusSource.next(this.isAuthenticated());
    });
  }
  login() {
    this.manager.clearStaleState().then(() => {
      this.manager.signinRedirect();
    });
  }
  logout() {
    this.manager.clearStaleState().then(() => {
      this.manager.signoutRedirect();
    });
  }
  async completeAuthentication() {
    // console.log("completeAuthentication")
    await this.manager.signinRedirectCallback().then((user) => {
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
    return this.user != null ? (this.user.profile as { [key: string]: any })['first_name'] : '';
  }
  set firstName(newValue: string) {
    this.user!.profile!['first_name'] = newValue;
  }
  get lastName(): string {
    return this.user != null ? (this.user.profile as { [key: string]: any })['last_name'] : '';
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

  async loginWithGuest(): Promise<void> {
    const token = localStorage.getItem('guest_token');
    if (!token) {
      throw new Error('No guest token found in local storage');
    }
    const authUrlToUse = this.guestSettings?.authority || this.manager.settings.authority;
    const body = new URLSearchParams();
    body.set('grant_type', 'guest');
    body.set('guest_token', token);
    body.set('client_id', this.guestSettings?.client_id || this.manager.settings.client_id);
    body.set('scope', this.guestSettings?.scope || 'openid profile offline_access');

    await firstValueFrom(
      this.http.post(`${authUrlToUse}/connect/token`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).pipe(
        map((response: any) => {
          if (!response.access_token) {
            throw new Error('Login failed');
          }
          const expires_at = response.expires_in ? Math.floor(Date.now() / 1000) + response.expires_in : 0;
          const user = new User({
            id_token: response.id_token || '',
            session_state: null,
            access_token: response.access_token,
            refresh_token: response.refresh_token || '',
            token_type: response.token_type || 'Bearer',
            scope: response.scope || '',
            profile: {
              sub: 'guest', // Dummy sub for guest
              iss: authUrlToUse,
              aud: this.manager.settings.client_id,
              exp: expires_at,
              iat: Math.floor(Date.now() / 1000)
            } as any, // Cast to any to avoid strict typing
            expires_at: expires_at,
            userState: null
          });
          this.manager.storeUser(user);
          this.user = user;
          this._authNavStatusSource.next(this.isAuthenticated());
        })
      )
    );
  }
}
