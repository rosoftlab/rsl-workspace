import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../shared/services/storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthService,
        private storageService: StorageService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const url: string = req.url;
        let lang = this.storageService.retrieve('language', true);
        if (!lang) {
            lang = 'en';
        }
        const authReq = req.clone({
            withCredentials: true,
            setHeaders: {
                Authorization: this.authService.authorizationHeaderValue,
                'x-language': lang
            }
            // ,'x-organizationid': this.authService.organisationId
        });

        if (url.indexOf('s3-de-central') > -1) {
            return next.handle(req);
        } else {
            return next.handle(authReq);
        }

    }
}
