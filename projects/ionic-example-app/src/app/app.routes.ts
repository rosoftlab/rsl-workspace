import { Routes } from '@angular/router';
import { EmployeeService, RoleService } from '@rosoftlab/core';
import { KendoFullLayoutComponent } from '@rosoftlab/kendo';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { FillGasComponent } from './components/fill-gas/fill-gas.component';
import { GuestRegistrationComponent } from './components/guest-registration/guest-registration.component';
import { UnderConstructionComponent } from './components/under-construction/under-construction.component';
import { EmployeefieldsAdd, EmployeefieldsEdit } from './configs/employee-config';
import { CarService } from './services/car/car.service';
import { WarehouseService } from './services/warehouse/warehouse.service';
import { authGuardGuest } from './shared/auth-guard-guest.service';
import { authGuard } from './shared/authguard';

export const routes: Routes = [
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: 'guest-registration', component: GuestRegistrationComponent },
  { path: 'fill-gas', component: FillGasComponent, canActivate: [authGuardGuest] },
  { path: 'fill-gas/:id', component: FillGasComponent, canActivate: [authGuardGuest] },

  {
    path: '',
    component: KendoFullLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./components/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        canActivate: [authGuard],
        // component: DataProcessingComponent,
      },
      {
        path: 'overview',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'administration',
        children: [
          {
            path: 'parking',
            children: [
              {
                path: 'car',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-GRID',
                      modelService: CarService, // Provided via MODEL_SERVICE token
                      model: 'car',
                      showSearch: true,
                      editColumn: 'licensepalte',
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                  {
                    path: 'add',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: CarService,
                      modelName: 'car',
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                  {
                    path: 'edit/:id',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: CarService,
                      modelName: 'car',
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                ],
              },
            ],
          },
          {
            path: 'catalog',
            children: [
              {
                path: 'warehouse',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-GRID',
                      modelService: WarehouseService, // Provided via MODEL_SERVICE token
                      model: 'warehouse',
                      showSearch: true,
                      editColumn: 'name',
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                  {
                    path: 'add',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: WarehouseService,
                      modelName: 'warehouse',
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                  {
                    path: 'edit/:id',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: WarehouseService,
                      modelName: 'warehouse',
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                ],
              },
            ],
          },
          {
            path: 'security',
            children: [
              {
                path: 'user',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-GRID',
                      modelService: EmployeeService, // Provided via MODEL_SERVICE token
                      model: 'user',
                      showSearch: true,
                      editColumn: 'firstName',
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                  {
                    path: 'add',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: EmployeeService,
                      modelName: 'user',
                      fileLayout: 'assets/layouts/data.json',
                      modelFnConfig: EmployeefieldsAdd,
                    },
                  },
                  {
                    path: 'edit/:id',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: EmployeeService,
                      modelName: 'user',
                      fileLayout: 'assets/layouts/data.json',
                      modelFnConfig: EmployeefieldsEdit,
                    },
                  },
                ],
              },
              {
                path: 'role',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-GRID',
                      modelService: RoleService, // Provided via MODEL_SERVICE token
                      model: 'role',
                      showSearch: true,
                      editColumn: 'name',
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                  {
                    path: 'add',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: RoleService,
                      customInclude: 'RoleDetail',
                      modelName: 'role',
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                  {
                    path: 'edit/:id',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: RoleService,
                      modelName: 'role',
                      customInclude: 'RoleDetail',
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                ],
              },
            ],
          },
        ],
        canActivate: [authGuard],
      },
      {
        path: '**',
        component: UnderConstructionComponent,
      },
    ],
  },
];
