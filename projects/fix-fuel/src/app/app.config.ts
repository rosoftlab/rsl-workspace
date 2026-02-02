import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { provideIonicAngular } from '@ionic/angular/standalone';
import { BaseDatastore, Configurations, DATASTORE_PORT, DatastoreCore, provideAuth } from '@rosoftlab/core';
import { UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { MyMissingTranslationHandler } from './handler/my-missing-translation-handler';
import { authInterceptor } from './shared/auth.interceptor';
import { offlineQueueInterceptor } from './shared/offline-queue.interceptor';
import { TranslateloaderService } from './shared/services/translate-loader.service';
const oid_settings: UserManagerSettings = {
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  authority: environment.authUrl,
  client_id: 'Opti_web',
  redirect_uri: location.origin + '/auth-callback',
  post_logout_redirect_uri: location.origin,
  response_type: 'code',
  scope:
    'openid  profile  optiLogistic  optiPark optifile common optiGPS optiParkTransaction reports inventory partner catalog statemachine',
  filterProtocolClaims: true,
  loadUserInfo: true,
  automaticSilentRenew: false
  //,    silent_redirect_uri: origin + '/silent-refresh.html'
};
const guest_oid_settings: UserManagerSettings = {
  ...oid_settings,
  client_id: 'Opti_web_guest',
  scope:
    'openid profile offline_access optiLogistic  optiPark optifile common optiGPS optiParkTransaction reports inventory partner catalog statemachine'
};
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideIonicAngular(),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    {
      provide: Configurations,
      useValue: {
        baseUrl: environment.baseUrl,
        authUrl: environment.authUrl,
        apiVersion: 'api/v1'
      }
    },
    ...provideAuth(oid_settings, guest_oid_settings),
    provideAnimations(),
    BaseDatastore,
    DatastoreCore,
    { provide: DATASTORE_PORT, useExisting: DatastoreCore },
    DatePipe,
    DecimalPipe,
    PercentPipe,
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateloaderService,
          deps: [HttpClient]
        },
        missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler },
        useDefaultLang: false
      })
    ),
    provideHttpClient(withInterceptors([authInterceptor, offlineQueueInterceptor]))
  ]
};
