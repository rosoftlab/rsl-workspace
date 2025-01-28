import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WsAuthService {
  private token: string = null
  constructor() { }
  get Token(): string {
    return this.token
  }
  set Token(token: string) {
    this.token = token
  }
}
