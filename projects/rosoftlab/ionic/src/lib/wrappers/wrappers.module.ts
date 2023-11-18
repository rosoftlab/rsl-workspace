import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FORMLY_CONFIG, FormlyModule } from '@ngx-formly/core';
import { FormlyIonicModule } from '@ngx-formly/ionic';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SmActionService } from '@rosoftlab/statemachine';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { registerTranslateExtension } from '../translate.extension';

const COMMON_MODULES = [
  CommonModule,
  IonicModule,
  ReactiveFormsModule,
  FormlyIonicModule,
  NgxDatatableModule
];

@NgModule({
  imports: [
    ...COMMON_MODULES,
    TranslateModule
  ],
  providers: [
    { provide: FORMLY_CONFIG, multi: true, useFactory: registerTranslateExtension, deps: [TranslateService] },
    SmActionService
  ],
  exports: [
    ...COMMON_MODULES,
    FormlyModule,
    TranslateModule
  ],
})
export class WrappersModule { }
