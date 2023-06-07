import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { GenericTableComponent } from './base-components/generic-table/generic-table.component';
import { SearchableDropdownComponent } from './base-components/searchable-dropdown/searchable-dropdown.component';
import { Configurations } from './configurations';
import { MaterialModule } from './material';
import { PROVIDERS } from './providers';
import { TranslateloaderService } from './services/translate-loader.service';

@NgModule({
  declarations: [
    GenericTableComponent,
    SearchableDropdownComponent
  ],
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
    MaterialModule,
    ReactiveFormsModule
  ],
  providers: [
    PROVIDERS
  ],
  exports: [
    HttpClientModule,
    TranslateModule,
    GenericTableComponent,
    SearchableDropdownComponent
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
