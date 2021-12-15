import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BlockUIModule } from 'ng-block-ui';
import { GenericTableComponent } from './base-components/generic-table/generic-table.component';
import { MaterialModule } from './material';
import { PROVIDERS } from './providers';

@NgModule({
  declarations: [
    GenericTableComponent
  ],
  imports:[
    CommonModule,
    TranslateModule.forChild({}),
    MaterialModule,
    BlockUIModule.forRoot(),
  ],
  providers: [
    PROVIDERS
  ],
  exports: [
    HttpClientModule,
    GenericTableComponent
  ]
})
export class RslBaseModule {
}
