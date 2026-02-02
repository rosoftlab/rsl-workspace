import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { OfflineQueueService } from './offline-queue.service';

const OFFLINE_HEADER = 'x-offline-queued';

export const offlineQueueInterceptor: HttpInterceptorFn = (req, next) => {
  const queue = inject(OfflineQueueService);

  if (req.method === 'GET' || req.headers.has(OFFLINE_HEADER)) {
    return next(req);
  }

  const baseUrl = environment.baseUrl?.replace(/\/+$/, '') || '';
  if (!baseUrl || !req.url.startsWith(baseUrl)) {
    return next(req);
  }

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (isOffline) {
    return of(queueRequest(queue, req));
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return of(queueRequest(queue, req));
      }
      return throwError(() => error);
    })
  );
};

function queueRequest(queue: OfflineQueueService, req: any) {
  const headers = req.headers?.keys?.().reduce((acc: Record<string, string>, key: string) => {
    const value = req.headers.get(key);
    if (value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});

  void queue.enqueue({
    url: req.url,
    method: req.method,
    body: req.body,
    headers,
    createdAt: Date.now()
  });

  return new HttpResponse({
    status: 202,
    body: { queued: true }
  });
}
