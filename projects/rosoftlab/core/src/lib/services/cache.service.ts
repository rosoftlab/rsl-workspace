import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: { [key: string]: { data: any, expiration: number } } = {};

  constructor() {}

  private pruneExpired(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach((key) => {
      if (this.cache[key].expiration <= now) {
        delete this.cache[key];
      }
    });
  }

  get(key: string): any {
    const cachedItem = this.cache[key];
    if (cachedItem && cachedItem.expiration > Date.now()) {
      return cachedItem.data;
    }
    this.delete(key);
    return null;
  }

  set(key: string, data: any, expiresInMs: number): void {
    this.pruneExpired();
    const expiration = Date.now() + expiresInMs;
    this.cache[key] = { data, expiration };
  }

  delete(key: string): void {
    delete this.cache[key];
  }

  clearCacheContainingKeyword(keyword: string): void {
    const keysToDelete = Object.keys(this.cache).filter(key => key.includes(keyword));
    keysToDelete.forEach(key => this.delete(key));
  }
}
