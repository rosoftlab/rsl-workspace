import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache: Map<string, { response: HttpResponse<any>, expiration: number }> = new Map();

  constructor(@Inject('CACHE_EXPIRATION_TIME') private expirationTime: number,
    private cacheService: CacheService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const bypassCache = request.params.get('bypassCache') || false;

    if (bypassCache || request.method !== 'GET') {
      return next.handle(request);
    }

    if (!bypassCache) {
      const cachedResponse = this.cacheService.get(request.urlWithParams);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    return next.handle(request).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.cacheService.set(request.urlWithParams, event, this.expirationTime);
        }
      })
    );

    // const cachedItem = this.cache.get(request.url);

    // if (cachedItem && cachedItem.expiration > Date.now()) {
    //   return of(cachedItem.response.clone());
    // }

    // return next.handle(request).pipe(
    //   tap(event => {
    //     if (event instanceof HttpResponse) {
    //       this.cache.set(request.url, { response: event.clone(), expiration: Date.now() + this.expirationTime });
    //     }
    //   })
    // );
  }
}