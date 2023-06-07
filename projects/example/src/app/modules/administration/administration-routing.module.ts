import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../shared/authguard';

const routes: Routes = [
  { path: 'security', loadChildren: () => import('./security/security.module').then(m => m.SecurityModule), canActivate: [AuthGuard] },
  { path: 'parking', loadChildren: () => import('./parking/parking.module').then(m => m.ParkingModule), canActivate: [AuthGuard] },
  // { path: 'currency', loadChildren: () => import('./currency/currency.module').then(m => m.CurrencyModule), canActivate: [AuthGuard] },
  // { path: 'organization', loadChildren: () => import('./organization/organization.module').then(m => m.OrganizationModule), canActivate: [AuthGuard] },
  // { path: 'documenttype', loadChildren: () => import('./documenttype/documenttype.module').then(m => m.DocumenttypeModule), canActivate: [AuthGuard] },
  // { path: 'contractterms', loadChildren: () => import('./contractterms/contractterms.module').then(m => m.ContracttermsModule), canActivate: [AuthGuard] },
  // {
  //   path: '',
  //   component: TabLayoutComponent,
  //   data: { parentKey: 'Administration.UserManagement' },
  //   children: [
  //     { path: 'usermanagement', loadChildren: () => import('./usermanagement/usermanagement.module').then(m => m.UsermanagementModule), canActivate: [AuthGuard] }
  //   ]
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
