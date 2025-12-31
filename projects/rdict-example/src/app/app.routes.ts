import { Routes } from '@angular/router';
import { FullComponent, GenericRdictTableComponent, RdictCrudComponent } from 'projects/rosoftlab/rdict/src/public-api';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { DataSchedulerComponent } from './components/data-scheduler/data-scheduler.component';
import { ImportPluginEditorComponent } from './components/import-plugin-editor/import-plugin-editor.component';
import { RoleFormComponent } from './components/security/role/role-form/role-form.component';
import { TestComponent } from './components/test/test.component';
import { UnderConstructionComponent } from './components/under-construction/under-construction.component';
import { authGuard } from './shared/authguard';
export const routes: Routes = [
  { path: 'auth-callback', component: AuthCallbackComponent },
  {
    path: '',
    component: FullComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./components/data-processing/data-processing.component').then((c) => c.DataProcessingComponent),
        // component: DataProcessingComponent,
      },
      {
        path: 'data_processing',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'test',
        component: TestComponent,
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
                    component: GenericRdictTableComponent,
                    data: {
                      showSerach: true,
                      editColumn: 'name',
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                  {
                    path: 'add',
                    component: ImportPluginEditorComponent,
                    data: {
                      // showSerach: true,
                    },
                  },
                  {
                    path: 'edit/:id',
                    component: ImportPluginEditorComponent,
                    data: {
                      // showSerach: true,
                    },
                  },
                ],
              },
              {
                path: 'scheduled_imports',
                children: [
                  {
                    path: '',
                    component: GenericRdictTableComponent,
                    data: {
                      fileLayout: 'assets/layouts/data.json',
                      editColumn: 'name',
                    },
                  },
                  {
                    path: 'add',
                    component: RdictCrudComponent,
                    data: {
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                  {
                    path: 'edit/:id',
                    component: RdictCrudComponent,
                    data: {
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                ],
              },
              {
                path: 'scheduler',
                component: DataSchedulerComponent,
                data: {
                  from: 'administration.import.scheduled_imports',
                },
              },
              {
                path: 'import_runs',
                component: GenericRdictTableComponent,
                data: {
                  fileLayout: 'assets/layouts/data.json',
                  hasAdd: false,
                  canDelete: false,
                  canEdit: false,
                  showSerach: true,
                  defaultSort: [{ field: 'import_date', dir: 'desc' }],
                  useView: true,
                  pageable: true,
                  pageSizes: [10, 20, 50, 100],
                },
              },
              // {
              //   path: 'import_layout',
              //   component: ImportPluginEditorComponent
              // },
            ],
          },
          {
            path: 'export',
            children: [
              {
                path: 'export_layout',
                children: [
                  {
                    path: '',
                    component: GenericRdictTableComponent,
                    data: {
                      fileLayout: 'assets/layouts/data.json',
                      editColumn: 'name',
                    },
                  },
                  {
                    path: 'add',
                    component: RdictCrudComponent,
                    data: {
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                  {
                    path: 'edit/:id',
                    component: RdictCrudComponent,
                    data: {
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                ],
              },
              {
                path: 'scheduled_exports',
                children: [
                  {
                    path: '',
                    component: GenericRdictTableComponent,
                    data: {
                      fileLayout: 'assets/layouts/data.json',
                      editColumn: 'name',
                    },
                  },
                  {
                    path: 'add',
                    component: RdictCrudComponent,
                    data: {
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                  {
                    path: 'edit/:id',
                    component: RdictCrudComponent,
                    data: {
                      fileLayout: 'assets/layouts/data.json',
                    },
                  },
                ],
              },
              {
                path: 'scheduler',
                component: DataSchedulerComponent,
                data: {
                  from: 'administration.export.scheduled_exports',
                },
              },
              {
                path: 'export_runs',
                component: GenericRdictTableComponent,
                data: {                  
                  fileLayout: 'assets/layouts/data.json',
                  editColumn: 'file_name',
                  hasAdd: false,
                  canDelete: false,
                  canEdit: false,
                  showSerach: true,
                  defaultSort: [{ field: 'import_date', dir: 'desc' }],
                  useView: true,
                  pageable: true,
                  pageSizes: [10, 20, 50, 100],
                },
              },
            ],
          },
          {
            path: 'locations',
            children: [
              {
                path: '',
                component: GenericRdictTableComponent,
                data: {
                  showSerach: true,
                  editColumn: 'name',
                },
              },
              {
                path: 'add',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                },
              },
              {
                path: 'edit/:id',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                },
              },
            ],
          },
          {
            path: 'data_processing_layout',
            children: [
              {
                path: '',
                component: GenericRdictTableComponent,
                data: {
                  showSerach: true,
                  editColumn: 'name',
                  fileLayout: 'assets/layouts/data.json',
                },
              },
              {
                path: 'add',
                component: RdictCrudComponent,
                data: {
                  fileLayout: 'assets/layouts/data.json',
                },
              },
              {
                path: 'edit/:id',
                component: RdictCrudComponent,
                data: {
                  fileLayout: 'assets/layouts/data.json',
                },
              },
            ],
          },
          {
            path: 'data_types',
            children: [
              {
                path: '',
                component: GenericRdictTableComponent,
                data: {
                  showSerach: true,
                  editColumn: 'name',
                },
              },
              {
                path: 'add',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                },
              },
              {
                path: 'edit/:id',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                },
              },
            ],
          },
          {
            path: 'data_sources',
            children: [
              {
                path: '',
                component: GenericRdictTableComponent,
                data: {
                  showSerach: true,
                  editColumn: 'name',
                },
              },
              {
                path: 'add',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                },
              },
              {
                path: 'edit/:id',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                },
              },
            ],
          },
          {
            path: 'security',
            children: [
              {
                path: 'role',
                component: RoleFormComponent,
              },
            ],
          },

          {
            path: '**',
            component: GenericRdictTableComponent,
            data: {
              showSerach: true,
            },
          },
        ],
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: '**',
    component: UnderConstructionComponent,
  },
];
