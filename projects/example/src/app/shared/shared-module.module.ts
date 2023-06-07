import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { MaterialModule, RslBaseModule } from '@rosoftlab/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MyMissingTranslationHandler } from '../handler/my-missing-translation-handler';

const COMMON_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MaterialModule,
  RslBaseModule,
];
const COMMON_COMPONENTS = [];
@NgModule({
  imports: [
    ...COMMON_MODULES,
    TranslateModule.forChild({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MyMissingTranslationHandler,
      },
      useDefaultLang: false,
    }),
  ],
  declarations: [...COMMON_COMPONENTS],
  exports: [
    ...COMMON_COMPONENTS,
    ...COMMON_MODULES,
    NgxMatSelectSearchModule,
  ],
})
export class SharedModule { }
