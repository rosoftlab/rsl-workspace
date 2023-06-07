import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'projects/example/src/app/shared/authguard';

const routes: Routes = [
    { path: 'car', loadChildren: () => import('./car/car.module').then(m => m.CarModule), canActivate: [AuthGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParkingRoutingModule { }