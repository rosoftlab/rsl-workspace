import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const storageService = inject(StorageService);

    let lang = storageService.retrieve('language', true);
    if (!lang) {
        lang = 'en';
    }

    const authReq = req.clone({
        withCredentials: true,
        setHeaders: {
            Authorization: authService.authorizationHeaderValue,
            'x-language': lang,
        },
    });

    if (req.url.includes('s3-de-central')) {
        return next(req); // Skip modification for specific URLs
    }

    return next(authReq);
};

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//     constructor(
//         private authService: AuthService,
//         private storageService: StorageService) { }

//     intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         const url: string = req.url;
//         let lang = this.storageService.retrieve('language', true);
//         if (!lang) {
//             lang = 'en';
//         }
//         const authReq = req.clone({
//             withCredentials: true,
//             setHeaders: {
//                 Authorization: this.authService.authorizationHeaderValue,
//                 'x-language': lang
//             }
//             // ,'x-organizationid': this.authService.organisationId
//         });

//         if (url.indexOf('s3-de-central') > -1) {
//             return next.handle(req);
//         } else {
//             return next.handle(authReq);
//         }

//     }
// }
