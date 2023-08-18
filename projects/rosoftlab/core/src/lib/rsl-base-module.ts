import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Configurations } from './configurations';
import { PROVIDERS } from './providers';
import { TranslateloaderService } from './services/translate-loader.service';

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
      useDefaultLang: false,
    }),
    ReactiveFormsModule
  ],
  providers: [
    PROVIDERS
  ],
  exports: [
    HttpClientModule,
    TranslateModule,
  ]
})
export class RslBaseModule {
  public static forRoot(config: Configurations): ModuleWithProviders<RslBaseModule> {
    return {
      ngModule: RslBaseModule,
      providers: [
        PROVIDERS,
        { provide: Configurations, useValue: config }
      ]
    };
  }
}
