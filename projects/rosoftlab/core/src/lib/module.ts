import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { GenericTableComponent } from './base-components/generic-table/generic-table.component';
import { MaterialModule } from './material';
import { PROVIDERS } from './providers';

@NgModule({
  declarations: [
    GenericTableComponent
  ],
  imports:[
    MaterialModule
  ],
  providers: [PROVIDERS],
  exports: [
    HttpClientModule
  ]
})
export class RslBaseModule {
}
