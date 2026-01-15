import { Routes } from '@angular/router';
import { EmployeeService, RoleService } from '@rosoftlab/core';
import { RoleFormComponent } from '../components/security/role/role-form/role-form.component';

export const SECURITY_ROUTES: Routes = [
  {
    path: 'user',
    children: [
      {
        path: '',
        loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.GenericTableComponent),
        data: {
          impl: 'KENDO',
          modelService: EmployeeService, // Provided via MODEL_SERVICE token
          model: 'user',
          showSearch: true,
          editColumn: 'firstName',
          fileLayout: 'assets/layouts/data.json'
        }
      },
      {
        path: 'add',
        component: RoleFormComponent,
        data: {
          // showSearch: true,
        }
      },
      {
        path: 'edit/:id',
        component: RoleFormComponent,
        data: {
          // showSearch: true,
        }
      }
    ]
  },
  {
    path: 'role',
    children: [
      {
        path: '',
        loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.GenericTableComponent),
        data: {
          impl: 'KENDO',
          modelService: RoleService, // Provided via MODEL_SERVICE token
          model: 'role',
          showSearch: true,
          editColumn: 'name',
          fileLayout: 'assets/layouts/data.json'
        }
      },
      {
        path: 'add',
        loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.GenericCrudComponent),
        data: {
          impl: 'KENDO',
          modelService: RoleService,
          customInclude:"RoleDetail",
          modelName:'role',
          fileLayout: 'assets/layouts/data.json'
        }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.GenericCrudComponent),
        data: {
          impl: 'KENDO',
          modelService: RoleService,
          modelName:'role',
          customInclude:"RoleDetail",
          fileLayout: 'assets/layouts/data.json'
        }
      }
    ]
  }
];
