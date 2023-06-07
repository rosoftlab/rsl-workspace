import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CarRoutingRoutes } from './car.routing';

import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { RslBaseModule } from '@rosoftlab/core';
import { MyMissingTranslationHandler } from 'projects/example/src/app/handler/my-missing-translation-handler';
import { CarListComponent } from './car-list/car-list.component';

@NgModule({
  declarations: [CarListComponent    ],
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
