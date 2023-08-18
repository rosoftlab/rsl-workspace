import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CarRoutingRoutes } from './car.routing';

import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { RslBaseModule } from '@rosoftlab/core';
import { MyMissingTranslationHandler } from 'projects/example/src/app/handler/my-missing-translation-handler';

@NgModule({  
  imports: [
    CommonModule,
    RslBaseModule,
    CarRoutingRoutes,
    TranslateModule.forChild({
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler },
      useDefaultLang: false,
    }),

  ]
})
export class CarModule { }
