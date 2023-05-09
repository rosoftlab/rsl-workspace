import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GenericTableComponent } from './base-components/generic-table/generic-table.component';
import { SearchableDropdownComponent } from './base-components/searchable-dropdown/searchable-dropdown.component';
import { MaterialModule } from './material';
import { PROVIDERS } from './providers';

@NgModule({
  declarations: [
    GenericTableComponent,
    SearchableDropdownComponent
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild({}),
    MaterialModule,
    ReactiveFormsModule
  ],
  providers: [
    PROVIDERS
  ],
  exports: [
    HttpClientModule,
    GenericTableComponent,
    SearchableDropdownComponent
  ]
})
export class RslBaseModule {
}
