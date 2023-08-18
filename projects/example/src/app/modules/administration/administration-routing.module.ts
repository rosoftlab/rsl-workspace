import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../shared/authguard';

const routes: Routes = [
  { path: 'parking', loadChildren: () => import('./parking/parking.module').then(m => m.ParkingModule), canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
