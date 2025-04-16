import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FORMLY_CONFIG, FormlyModule } from '@ngx-formly/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
// import { BaseDatastore, Configurations, DatastoreCore } from 'dist/@rosoftlab/core';
// import { SOCKET_URL } from 'dist/@rosoftlab/rdict';
import { BaseDatastore, Configurations, DatastoreCore } from '@rosoftlab/core';
import { SOCKET_URL } from 'projects/rosoftlab/rdict/src/public-api';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AddressTypeComponent } from './components/formly/types/address/address.component';
import { FormlyCronTypeComponent } from './components/formly/types/cron-control/cron-type.component';
import { FieldMapingComponent } from './components/formly/types/field-maping/field-maping.component';
import { SchedulerComponent } from './components/formly/types/scheduler/scheduler.component';
import { authInterceptor } from './shared/auth.interceptor';
import { TranslateloaderService } from './shared/services/translate-loader.service';
import { registerTranslateExtension } from './translate.extension';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: Configurations, useValue: {
        baseUrl: environment.baseUrl,
        authUrl: environment.authUrl,
        apiVersion: 'api/v1',
      }
    },

    // { provide: SOCKET_URL, useValue: "http://localhost:5200" }, // environment.baseUrl
    { provide: SOCKET_URL, useValue:  environment.baseUrl }, //
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
        useDefaultLang: false,
      }),
      FormlyModule.forRoot({
        types: [
          { name: 'fieldMaping', component: FieldMapingComponent },
          { name: 'scheduler', component: SchedulerComponent, wrappers: ['form-field'] },
          { name: 'address', component: AddressTypeComponent, wrappers: ['form-field']  },
          { name: 'cron', component: FormlyCronTypeComponent, wrappers: ['form-field']  },
        ],
      }),
    ),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    { provide: FORMLY_CONFIG, multi: true, useFactory: registerTranslateExtension, deps: [TranslateService] },
  ]
};

