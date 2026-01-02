// rdict-formly-wrapper.module.ts
import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';

@NgModule({
  imports: [
    // Use forChild to isolate local library configuration
    FormlyModule.forChild({
      // You can define local validation messages or types here
      validationMessages: [
        { name: 'required', message: 'This field is required' },
      ],
    }),
    // FormlyKendoModule
  ],
  exports: [
    FormlyModule,
    // FormlyKendoModule
  ]
})
export class RdictFormlyWrapperModule {}