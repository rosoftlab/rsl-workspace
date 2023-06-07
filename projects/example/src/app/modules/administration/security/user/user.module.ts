import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyIonicModule } from '@ngx-formly/ionic';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MyMissingTranslationHandler } from 'projects/example/src/app/handler/my-missing-translation-handler';
import { EmployeeService } from 'projects/example/src/app/services';
import { SharedModule } from 'projects/example/src/app/shared/shared-module.module';
import { UserFormComponent } from './user-form/user-form.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserRoutingModule } from './user-routing.module';



@NgModule({
  declarations: [
    UserListComponent,
    UserFormComponent,
  ],
  providers: [
    EmployeeService
  ],

  imports: [
    UserRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler },
      useDefaultLang: false,
    }),
    IonicModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    FormlyModule.forRoot(),
    FormlyIonicModule

  ]

})
export class UserModule { }
