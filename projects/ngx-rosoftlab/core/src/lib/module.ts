import { NgModule } from '@angular/core';
import { PROVIDERS } from './providers';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  providers: [PROVIDERS],
  exports: [HttpClientModule]
})
export class JsonBaseModule {
}
