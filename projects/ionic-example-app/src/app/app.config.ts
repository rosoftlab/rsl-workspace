import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FORMLY_CONFIG, FormlyModule } from '@ngx-formly/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

import { provideIonicAngular } from '@ionic/angular/standalone';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { BaseDatastore, Configurations, DATASTORE_PORT, DatastoreCore, provideAuth, RSL_FORM_IMPLEMENTATIONS_TOKEN } from '@rosoftlab/core';
import { GenericKendoCrudComponent, GenericKendoTableComponent } from '@rosoftlab/kendo';
import { UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { FormlyCronTypeComponent } from './components/formly/types/cron-control/cron-type.component';
import { FormlyKendoDatePickerComponent } from './components/formly/types/date-picker';

import { PasswordFieldInput } from './components/formly/types/password/password.component';

import { SOCKET_URL } from '@rosoftlab/rdict';
import { RoleRightsComponent } from './components/formly/types/role-rights/role-rights.component';
import { MyMissingTranslationHandler } from './handler/my-missing-translation-handler';
import { authInterceptor } from './shared/auth.interceptor';
import { TranslateloaderService } from './shared/services/translate-loader.service';
import { registerTranslateExtension } from './translate.extension';
import { fieldMatchValidator } from './validators/field-match-validator';
const oid_settings: UserManagerSettings = {
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
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
    {
      provide: Configurations,
      useValue: {
        baseUrl: environment.baseUrl,
        authUrl: environment.authUrl,
        apiVersion: 'api/v1'
      }
    },
    ...provideAuth(oid_settings, guest_oid_settings),
    { provide: SOCKET_URL, useValue: '' },
    {
      provide: RSL_FORM_IMPLEMENTATIONS_TOKEN,
      useValue: {
        // Values are the string keys used in Route Data mapped to the Component Classes
        'KENDO-GRID': GenericKendoTableComponent,
        'KENDO-CRUD': GenericKendoCrudComponent
      }
    },
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
      }),
      FormlyModule.forRoot({
        validators: [
          // This maps the string "fieldMatch" used in your employee-config.ts
          // to the actual function we just wrote
          { name: 'fieldMatch', validation: fieldMatchValidator }
        ],
        types: [
          // { name: 'fieldMaping', component: FieldMapingComponent },
          {
            name: 'cron',
            component: FormlyCronTypeComponent,
            wrappers: ['form-field']
          },
          {
            name: 'password',
            component: PasswordFieldInput,
            wrappers: ['form-field']
          },
          { name: 'kendo-treeview', component: RoleRightsComponent, wrappers: ['form-field'] },
          { name: 'datepicker', component: FormlyKendoDatePickerComponent, wrappers: ['form-field'] }
        ]
      }),
      FormlyKendoModule
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: FORMLY_CONFIG,
      multi: true,
      useFactory: registerTranslateExtension,
      deps: [TranslateService]
    }
  ]
};
