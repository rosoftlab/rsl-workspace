import { InjectionToken, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GenericIonicCrudComponent, RslIonicGridComponent } from '@rosoftlab/ionic';
import { Car } from 'projects/example/src/app/models';
import { CarService } from 'projects/example/src/app/services';
const CARSERVICE = new InjectionToken<string>('CarService');
const routes: Routes = [

  {
    path: '',
    component: RslIonicGridComponent<Car, CarService>,
    data: {
      showSerach: true,
      searchFields: 'licensePlate,description',
      customInclude: "",
      defaultSort: 'licensePlate',
      defaultSortDirection: 'asc',
      deletePropertyName: 'licensePlate',
      requiredService: CARSERVICE
    }
  },
  // {
  //   path: '',
  //   component: GenericIonicCrudComponent<Car, CarService>,
  //   data: { requiredService: CARSERVICE }
  // },
  {
    path: 'add',
    component: GenericIonicCrudComponent<Car, CarService>,
    data: { requiredService: CARSERVICE }
  },
  {
    path: 'edit/:id',
    component: GenericIonicCrudComponent<Car, CarService>,
    data: { requiredService: CARSERVICE }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: CARSERVICE,
      useClass: CarService
    }]
})
export class CarRoutingRoutes { }
