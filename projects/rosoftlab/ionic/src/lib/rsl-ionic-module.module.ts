import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FORMLY_CONFIG, FormlyModule } from '@ngx-formly/core';
import { FormlyIonicModule } from '@ngx-formly/ionic';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonicDialogService } from './ionic-dialog.service';
import { registerTranslateExtension } from './translate.extension';
const COMMON_MODULES = [
  CommonModule,
  IonicModule,
  ReactiveFormsModule,
  FormlyIonicModule,
];

@NgModule({
  imports: [
    ...COMMON_MODULES,
    TranslateModule.forRoot({      
    }),
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: 'This field is required' },
      ],
    }),
  ],
  providers: [
    IonicDialogService,
    { provide: FORMLY_CONFIG, multi: true, useFactory: registerTranslateExtension, deps: [TranslateService] },
  ],
  exports: [
    ...COMMON_MODULES,
    FormlyModule,
    TranslateModule
  ],
})
export class RslIonicModuleModule { }
