import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { MyMissingTranslationHandler } from '../../handler/my-missing-translation-handler';
import { SharedModule } from '../../shared/shared-module.module';
import { AdministrationRoutingModule } from './administration-routing.module';
import { ParkingModule } from './parking/parking.module';
import { SecurityModule } from './security/security.module';



@NgModule({
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler },
      useDefaultLang: false,
    }),
    SecurityModule,
    ParkingModule,
    IonicModule,
  ]
})
export class AdministrationModule { }
