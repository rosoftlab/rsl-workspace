import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FORMLY_CONFIG, FormlyModule } from '@ngx-formly/core';
import { FormlyIonicModule } from '@ngx-formly/ionic';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonicDialogService } from './ionic-dialog.service';
import { registerTranslateExtension } from './translate.extension';
import { RepeatTypeComponent } from './types/repeat/repeat-section.type';
import { fieldMatchValidator } from './validators/must-match';
import { AccordionWrapperComponent } from './wrappers/accordion-wrapper.component';
import { PanelWrapperComponent } from './wrappers/panel-wrapper.component';
const COMMON_MODULES = [
  CommonModule,
  IonicModule,
  ReactiveFormsModule,
  FormlyIonicModule,
];

@NgModule({
  imports: [
    ...COMMON_MODULES,
    TranslateModule.forChild({
    }),
    FormlyModule.forRoot({
      types: [{ name: 'repeat', component: RepeatTypeComponent }],
      validators: [{ name: 'fieldMatch', validation: fieldMatchValidator }],
      wrappers: [
        { name: 'panel', component: PanelWrapperComponent },
        { name: 'accordion', component: AccordionWrapperComponent }],
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
