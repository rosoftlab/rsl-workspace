import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FORMLY_CONFIG, FormlyModule } from '@ngx-formly/core';
import { FormlyIonicModule } from '@ngx-formly/ionic';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MyMissingTranslationHandler } from 'projects/example/src/app/handler/my-missing-translation-handler';
import { TranslateloaderService } from '../services/translateloader.service';
import { registerTranslateExtension } from './translate.extension';
const COMMON_MODULES = [
  CommonModule,
  FormlyModule,
  IonicModule,
  ReactiveFormsModule,
  FormlyIonicModule,
];

@NgModule({
  imports: [
    ...COMMON_MODULES,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateloaderService,
        deps: [HttpClient]
      },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler },
      useDefaultLang: false,
    }),
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: 'This field is required' },
      ],
    }),
  ],
  providers: [
    { provide: FORMLY_CONFIG, multi: true, useFactory: registerTranslateExtension, deps: [TranslateService] },
  ],
  exports: [
    ...COMMON_MODULES,
    FormlyModule,
    TranslateModule
  ],
})
export class RslIonicModuleModule { }
