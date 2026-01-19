import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FORMLY_CONFIG, FormlyModule } from '@ngx-formly/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

import { BaseDatastore, Configurations, DatastoreCore, provideAuth, RSL_FORM_IMPLEMENTATIONS_TOKEN } from '@rosoftlab/core';
import { GenericKendoCrudComponent, GenericKendoTableComponent } from '@rosoftlab/kendo';
import { SOCKET_URL } from '@rosoftlab/rdict';
import { UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { FormlyCronTypeComponent } from './components/formly/types/cron-control/cron-type.component';
import { RoleRightsComponent } from './components/formly/types/role-rights/role-rights.component';
import { ColumnMappingComponent } from './components/formly/types/types/column-mapping/column-mapping.component';
import { FormlySpreadsheetComponent } from './components/formly/types/types/formly-spreadsheet/formly-spreadsheet.component';
import { PasswordFieldInput } from './components/formly/types/types/password/password.component';
import { PluginSelectorTypeComponent } from './components/formly/types/types/plugin-selector/plugin-selector.type';
import { authInterceptor } from './shared/auth.interceptor';
import { TranslateloaderService } from './shared/services/translate-loader.service';
import { registerTranslateExtension } from './translate.extension';

const oid_settings: UserManagerSettings = {
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  authority: environment.authUrl,
  client_id: 'WebApp',
  redirect_uri: location.origin + '/auth-callback',
  post_logout_redirect_uri: location.origin,
  response_type: 'code',
  scope: 'openid profile common file repom',
  filterProtocolClaims: true,
  loadUserInfo: true,
  automaticSilentRenew: false
  //,    silent_redirect_uri: origin + '/silent-refresh.html'
};
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: Configurations,
      useValue: {
        baseUrl: environment.baseUrl,
        authUrl: environment.authUrl,
        apiVersion: 'api/v1'
      }
    },
    ...provideAuth(oid_settings),
    { provide: SOCKET_URL, useValue: environment.rdictApi },
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
        // missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler },
        useDefaultLang: false
      }),
      FormlyModule.forRoot({
        types: [
          // { name: 'fieldMaping', component: FieldMapingComponent },
          {
            name: 'cron',
            component: FormlyCronTypeComponent,
            wrappers: ['form-field']
          },
          {
            name: 'plugin-selector',
            component: PluginSelectorTypeComponent,
            wrappers: ['form-field']
          },
          {
            name: 'password',
            component: PasswordFieldInput,
            wrappers: ['form-field']
          },
          {
            name: 'spreadsheet',
            component: FormlySpreadsheetComponent,
            wrappers: ['form-field']
          },
          {
            name: 'column-mapping',
            component: ColumnMappingComponent,
            wrappers: ['form-field']
          },
          { name: 'kendo-treeview', component: RoleRightsComponent, wrappers: ['form-field'] }
        ]
      })
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
