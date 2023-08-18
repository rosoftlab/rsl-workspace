import { InjectionToken, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Gate } from '@models/administration';
import { GenericIonicCrudComponent, RslIonicGridComponent } from '@rosoftlab/ionic';
import { GateService } from '@services/gate.service';
const GateSERVICE = new InjectionToken<string>('GateService');
const routes: Routes = [

  {
    path: '',
    component: RslIonicGridComponent<Gate, GateService>,
    data: {
      showSerach: true,
      searchFields: 'name',
      customInclude: "",
      defaultSort: 'name',
      defaultSortDirection: 'asc',
      deletePropertyName: 'name',
      requiredService: GateSERVICE
    }
  },
  {
    path: 'add',
    component: GenericIonicCrudComponent<Gate, GateService>,
    data: { requiredService: GateSERVICE }
  },
  {
    path: 'edit/:id',
    component: GenericIonicCrudComponent<Gate, GateService>,
    data: { requiredService: GateSERVICE }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: GateSERVICE,
      useClass: GateService
    }]
})
export class GateRoutes { }
