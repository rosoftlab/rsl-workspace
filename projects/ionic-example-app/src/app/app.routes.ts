import { InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';
import { RoleService } from '@rosoftlab/core';
import { RslIonicDataTableComponent, RslIonicLayoutComponent } from '@rosoftlab/ionic';
import { ReactiveDictionary } from '@rosoftlab/rdict';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { TestComponent } from './components/test/test.component';
import { UnderConstructionComponent } from './components/under-construction/under-construction.component';
import { Employee } from './models/employee';
import { EmployeeService } from './models/employee.service';
import { authGuard } from './shared/authguard';
const EmployeeSERVICE = new InjectionToken<string>('EmployeeService');
export const routes: Routes = [
  { path: 'auth-callback', component: AuthCallbackComponent },
  {
    path: 'editor',
    loadComponent: () => import('./components/model-designer/model-editor/model-editor.component').then((c) => c.ModelEditorComponent)
  },
  {
    path: '',
    component: RslIonicLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./components/data-processing/data-processing.component').then((c) => c.DataProcessingComponent),
        canActivate: [authGuard]
        // component: DataProcessingComponent,
      },
      {
        path: 'data_processing',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'test',
        component: TestComponent
      },
      {
        path: 'administration',
        children: [
          {
            path: 'import',
            children: [
              {
                path: 'import_layout',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-GRID',
                      modelService: ReactiveDictionary,
                      showSearch: true,
                      editColumn: 'name',
                      idProperty: 'oid',
                      fileLayout: 'assets/layouts/data.json'
                    }
                  },
                  {
                    path: 'add',
                    loadComponent: () =>
                      import('./components/import-plugin-editor/import-plugin-editor.component').then((c) => c.ImportPluginEditorComponent)
                  },
                  {
                    path: 'edit/:id',
                    loadComponent: () =>
                      import('./components/import-plugin-editor/import-plugin-editor.component').then((c) => c.ImportPluginEditorComponent)
                  }
                ]
              },
              {
                path: 'scheduled_imports',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-GRID',
                      modelService: ReactiveDictionary,
                      showSearch: true,
                      editColumn: 'name',
                      idProperty: 'oid',
                      fileLayout: 'assets/layouts/data.json'
                    },
                    canActivate: [authGuard]
                  },
                  {
                    path: 'add',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: ReactiveDictionary,
                      fileLayout: 'assets/layouts/data.json'
                    },
                    canActivate: [authGuard]
                  },
                  {
                    path: 'edit/:id',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: ReactiveDictionary,
                      fileLayout: 'assets/layouts/data.json'
                    },
                    canActivate: [authGuard]
                  }
                ]
              },
              {
                path: 'scheduler',
                loadComponent: () => import('./components/data-scheduler/data-scheduler.component').then((c) => c.DataSchedulerComponent),
                data: {
                  from: 'administration.import.scheduled_imports'
                }
              },
              {
                path: 'import_runs',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-GRID',
                  modelService: ReactiveDictionary,
                  fileLayout: 'assets/layouts/data.json',
                  hasAdd: false,
                  canDelete: false,
                  canEdit: false,
                  showSearch: true,
                  defaultSort: [{ field: 'import_date', dir: 'desc' }],
                  useView: true,
                  pageable: true,
                  pageSizes: [10, 20, 50, 100]
                }
              }
            ]
          },
          {
            path: 'export',
            children: [
              {
                path: 'export_layout',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-GRID',
                      modelService: ReactiveDictionary,
                      showSearch: true,
                      editColumn: 'name',
                      idProperty: 'oid',
                      fileLayout: 'assets/layouts/data.json'
                    },
                    canActivate: [authGuard]
                  },
                  {
                    path: 'add',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: ReactiveDictionary,
                      fileLayout: 'assets/layouts/data.json'
                    },
                    canActivate: [authGuard]
                  },
                  {
                    path: 'edit/:id',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: ReactiveDictionary,
                      fileLayout: 'assets/layouts/data.json'
                    },
                    canActivate: [authGuard]
                  }
                ]
              },
              {
                path: 'scheduled_exports',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-GRID',
                      modelService: ReactiveDictionary,
                      showSearch: true,
                      editColumn: 'name',
                      idProperty: 'oid',
                      fileLayout: 'assets/layouts/data.json'
                    },
                    canActivate: [authGuard]
                  },
                  {
                    path: 'add',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: ReactiveDictionary,
                      fileLayout: 'assets/layouts/data.json'
                    },
                    canActivate: [authGuard]
                  },
                  {
                    path: 'edit/:id',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: ReactiveDictionary,
                      fileLayout: 'assets/layouts/data.json'
                    },
                    canActivate: [authGuard]
                  }
                ]
              },
              {
                path: 'scheduler',
                loadComponent: () => import('./components/data-scheduler/data-scheduler.component').then((m) => m.DataSchedulerComponent),
                data: {
                  from: 'administration.export.scheduled_exports'
                }
              },
              {
                path: 'export_runs',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-GRID',
                  modelService: ReactiveDictionary,
                  fileLayout: 'assets/layouts/data.json',
                  editColumn: 'file_name',
                  hasAdd: false,
                  canDelete: false,
                  canEdit: false,
                  showSearch: true,
                  defaultSort: [{ field: 'import_date', dir: 'desc' }],
                  useView: true,
                  pageable: true,
                  pageSizes: [10, 20, 50, 100]
                }
              }
            ]
          },
          {
            path: 'locations',
            children: [
              {
                path: '',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-GRID',
                  modelService: ReactiveDictionary,
                  showSearch: true,
                  editColumn: 'name',
                  idProperty: 'oid',
                  fileLayout: 'assets/layouts/data.json'
                },
                canActivate: [authGuard]
              },
              {
                path: 'add',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-CRUD',
                  modelService: ReactiveDictionary,
                  fileLayout: 'assets/layouts/data.json'
                },
                canActivate: [authGuard]
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-CRUD',
                  modelService: ReactiveDictionary,
                  fileLayout: 'assets/layouts/data.json'
                },
                canActivate: [authGuard]
              }
            ],
            canActivate: [authGuard]
          },
          {
            path: 'data_processing_layout',
            children: [
              {
                path: '',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-GRID',
                  modelService: ReactiveDictionary,
                  showSearch: true,
                  editColumn: 'name',
                  idProperty: 'oid',
                  fileLayout: 'assets/layouts/data.json'
                },
                canActivate: [authGuard]
              },
              {
                path: 'add',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-CRUD',
                  modelService: ReactiveDictionary,
                  fileLayout: 'assets/layouts/data.json'
                },
                canActivate: [authGuard]
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-CRUD',
                  modelService: ReactiveDictionary,
                  fileLayout: 'assets/layouts/data.json'
                },
                canActivate: [authGuard]
              }
            ]
          },
          {
            path: 'data_types',
            children: [
              {
                path: '',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-GRID',
                  modelService: ReactiveDictionary,
                  showSearch: true,
                  editColumn: 'name',
                  idProperty: 'oid',
                  fileLayout: 'assets/layouts/data.json'
                },
                canActivate: [authGuard]
              },
              {
                path: 'add',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-CRUD',
                  modelService: ReactiveDictionary,
                  fileLayout: 'assets/layouts/data.json'
                },
                canActivate: [authGuard]
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-CRUD',
                  modelService: ReactiveDictionary,
                  fileLayout: 'assets/layouts/data.json'
                },
                canActivate: [authGuard]
              }
            ]
          },
          {
            path: 'data_sources',
            children: [
              {
                path: '',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-GRID',
                  modelService: ReactiveDictionary,
                  showSearch: true,
                  editColumn: 'name',
                  idProperty: 'oid',
                  fileLayout: 'assets/layouts/data.json'
                },
                canActivate: [authGuard]
              },
              {
                path: 'add',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-CRUD',
                  modelService: ReactiveDictionary,
                  fileLayout: 'assets/layouts/data.json'
                },
                canActivate: [authGuard]
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                data: {
                  impl: 'KENDO-CRUD',
                  modelService: ReactiveDictionary,
                  fileLayout: 'assets/layouts/data.json'
                },
                canActivate: [authGuard]
              }
            ]
          },
          {
            path: 'security',
            children: [
              {
                path: 'user',
                children: [
                  {
                    path: '',
                    component: RslIonicDataTableComponent<Employee, EmployeeService>,
                    data: {
                      showSerach: true,
                      searchFields: 'name',
                      customInclude: '',
                      defaultSort: 'name',
                      defaultSortDirection: 'asc',
                      deletePropertyName: 'name',
                      requiredService: EmployeeSERVICE
                    }
                  },
                  {
                    path: 'add',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: EmployeeService,
                      modelName: 'user',
                      fileLayout: 'assets/layouts/data.json'
                    }
                  },
                  {
                    path: 'edit/:id',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: EmployeeService,
                      modelName: 'user',
                      fileLayout: 'assets/layouts/data.json'
                    }
                  }
                ]
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
                      fileLayout: 'assets/layouts/data.json'
                    }
                  },
                  {
                    path: 'add',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: RoleService,
                      customInclude: 'RoleDetail',
                      modelName: 'role',
                      fileLayout: 'assets/layouts/data.json'
                    }
                  },
                  {
                    path: 'edit/:id',
                    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.RSLDynamicComponent),
                    data: {
                      impl: 'KENDO-CRUD',
                      modelService: RoleService,
                      modelName: 'role',
                      customInclude: 'RoleDetail',
                      fileLayout: 'assets/layouts/data.json'
                    }
                  }
                ]
              }
            ]
          }
        ],
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: '**',
    component: UnderConstructionComponent
  }
];
