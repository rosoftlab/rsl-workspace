import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import type { UserManagerSettings } from 'oidc-client-ts';
import { User, UserManager } from 'oidc-client-ts';
import { BehaviorSubject, Observable, firstValueFrom, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
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

  async restoreUserFromStorage(): Promise<boolean> {
    if (this.user) {
      return true;
    }
    try {
      const stored = await this.manager.getUser();
      if (stored) {
        this.user = stored;
        this._authNavStatusSource.next(this.isAuthenticated());
        return true;
      }
    } catch {
      // ignore
    }
    const raw = this.findOidcUserInWebStorage();
    if (!raw) {
      return false;
    }
    try {
      const parsed = JSON.parse(raw) as any;
      const profile = parsed?.profile ?? this.decodeJwt(parsed?.access_token) ?? this.decodeJwt(parsed?.id_token);
      const hydrated = new User({
        ...parsed,
        profile: profile ?? parsed?.profile ?? { sub: 'offline' }
      });
      this.user = hydrated;
      this._authNavStatusSource.next(this.isAuthenticated());
      return true;
    } catch {
      return false;
    }
  }

  private findOidcUserInWebStorage(): string | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const key = Object.keys(localStorage).find((k) => k.startsWith('oidc.user:'));
        if (key) {
          return localStorage.getItem(key);
        }
      }
    } catch {
      // ignore
    }
    try {
      if (typeof sessionStorage !== 'undefined') {
        const key = Object.keys(sessionStorage).find((k) => k.startsWith('oidc.user:'));
        if (key) {
          return sessionStorage.getItem(key);
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  private decodeJwt(token?: string | null): Record<string, any> | null {
    if (!token || typeof token !== 'string') {
      return null;
    }
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    try {
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
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
        switchMap((response: any) => {
          if (!response.access_token) {
            throw new Error('Login failed');
          }
          const headers = { Authorization: `Bearer ${response.access_token}` };
          return this.http.get<any>(`${authUrlToUse}/connect/userinfo`, { headers }).pipe(
            catchError(() => of(null)),
            map((profile) => ({ response, profile }))
          );
        }),
        map(({ response, profile }) => {
          const expires_at = response.expires_in ? Math.floor(Date.now() / 1000) + response.expires_in : 0;
          const user = new User({
            id_token: response.id_token || '',
            session_state: null,
            access_token: response.access_token,
            refresh_token: response.refresh_token || '',
            token_type: response.token_type || 'Bearer',
            scope: response.scope || '',
            profile: (profile ?? { sub: 'guest' }) as any,
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
