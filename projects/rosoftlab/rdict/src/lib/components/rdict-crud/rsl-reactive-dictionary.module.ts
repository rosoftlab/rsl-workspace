import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FORMLY_CONFIG } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { registerTranslateExtension } from '../../../../../kendo/src/lib/translate.extension';

@NgModule({
  imports: [
    CommonModule,
   
  ],
  providers: [
    { provide: FORMLY_CONFIG, multi: true, useFactory: registerTranslateExtension, deps: [TranslateService] },
  ],
})
export class CrudFormlyTransaltionModule { }
