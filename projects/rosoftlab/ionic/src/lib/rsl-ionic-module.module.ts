import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FORMLY_CONFIG, FormlyModule } from '@ngx-formly/core';
import { FormlyIonicModule } from '@ngx-formly/ionic';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RslIonicSmButtonsComponent } from './components/rsl-ionic-sm-buttons/ionic-sm-buttons.component';
import { IonicDialogService } from './ionic-dialog.service';
import { registerTranslateExtension } from './translate.extension';
import { RepeatDatatableComponent } from './types/repeat-datatable/repeat-datatable.component';
import { RepeatTypeComponent } from './types/repeat/repeat-section.type';
import { fieldMatchValidator } from './validators/must-match';
import { AccordionWrapperComponent } from './wrappers/accordion-wrapper.component';
import { PanelWrapperComponent } from './wrappers/panel-wrapper.component';
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
    TranslateModule,
    FormlyModule.forRoot({
      types: [
        { name: 'repeat', component: RepeatTypeComponent },
        { name: 'repeat-data-table', component: RepeatDatatableComponent },
        { name: 'sm-buttons', component: RslIonicSmButtonsComponent }
      ],
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
