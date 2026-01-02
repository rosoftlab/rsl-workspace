import { CommonModule, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Configurations } from './configurations';

import { BaseDatastore } from './services/base-datastore.service';
import { DatastoreCore } from './services/datastore.service';
import { TranslateloaderService } from './services/translate-loader.service';
export const PROVIDERS: any[] = [
  BaseDatastore,
  DatastoreCore,
  DatePipe,
  DecimalPipe,
  PercentPipe
];

@NgModule({
  imports: [
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateloaderService,
        deps: [HttpClient]
      },
      // missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler },
      useDefaultLang: false
    }),
    ReactiveFormsModule
  ],
  providers: [PROVIDERS],
  exports: [ TranslateModule]
})
export class RslBaseModule {
  public static forRoot(config: Configurations): ModuleWithProviders<RslBaseModule> {
    return {
      ngModule: RslBaseModule,
      providers: [PROVIDERS, { provide: Configurations, useValue: config }]
    };
  }
}
