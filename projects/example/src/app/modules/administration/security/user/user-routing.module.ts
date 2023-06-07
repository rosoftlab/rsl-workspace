import { InjectionToken, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeService } from 'projects/example/src/app/services';
import { AuthGuard } from 'projects/example/src/app/shared/authguard';
import { UserFormComponent } from './user-form/user-form.component';
const PROJECTS = new InjectionToken<string>('EmployeeService');
const routes: Routes = [

  // {
  //   path: '',
  //   component: GenericIonicCrudComponent<Employee, EmployeeService>,
  //   canActivate: [AuthGuard],
  //   data: {
  //     requiredService: PROJECTS
  //   }
  // },
  { path: 'add', component: UserFormComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: UserFormComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    {
        provide: PROJECTS,
        useClass: EmployeeService
    }  ]
})
export class UserRoutingModule { }
