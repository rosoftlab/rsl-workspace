import { Routes } from '@angular/router';
import { FullComponent, GenericRdictTableComponent, RdictCrudComponent } from 'projects/rosoftlab/rdict/src/public-api';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { DataProcessingComponent } from './components/data-processing/data-processing.component';
import { DataSchedulerComponent } from './components/data-scheduler/data-scheduler.component';
import { TestComponent } from './components/test/test.component';
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
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: DataProcessingComponent
      },
      {
        path: 'data_processing',
        component: DataProcessingComponent
      },
      {
        path: 'test',
        component: TestComponent
      },
      {
        path: 'administration',
        children: [
          {
            path: 'import_layout',
            children: [
              {
                path: '',
                component: GenericRdictTableComponent,
                data: {
                  fileLayout: 'assets/layouts/data.json',
                  editColumn: 'name'
                }
              },
              {
                path: 'add',
                component: RdictCrudComponent,
                data: {
                  fileLayout: 'assets/layouts/data.json'
                }
              },
              {
                path: 'edit/:id',
                component: RdictCrudComponent,
                data: {
                  fileLayout: 'assets/layouts/data.json'
                }
              }
            ]
          },
          {
            path: 'export_layout',
            children: [
              {
                path: '',
                component: GenericRdictTableComponent,
                data: {
                  showSerach: true,
                  editColumn: 'name'
                }
              },
              {
                path: 'add',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                }
              },
              {
                path: 'edit/:id',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                }
              }
            ]
          },
          {
            path: 'locations',
            children: [
              {
                path: '',
                component: GenericRdictTableComponent,
                data: {
                  showSerach: true,
                  editColumn: 'name'
                }
              },
              {
                path: 'add',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                }
              },
              {
                path: 'edit/:id',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                }
              }
            ]
          },
          {
            path: 'data_processing_layout',
            children: [
              {
                path: '',
                component: GenericRdictTableComponent,
                data: {
                  showSerach: true,
                  editColumn: 'name'
                }
              },
              {
                path: 'add',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                }
              },
              {
                path: 'edit/:id',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                }
              }
            ]
          },
          {
            path: 'data_types',
            children: [
              {
                path: '',
                component: GenericRdictTableComponent,
                data: {
                  showSerach: true,
                  editColumn: 'name'
                }
              },
              {
                path: 'add',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                }
              },
              {
                path: 'edit/:id',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                }
              }
            ]
          },
          {
            path: 'data_sources',
            children: [
              {
                path: '',
                component: GenericRdictTableComponent,
                data: {
                  showSerach: true,
                  editColumn: 'name'
                }
              },
              {
                path: 'add',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                }
              },
              {
                path: 'edit/:id',
                component: RdictCrudComponent,
                data: {
                  // showSerach: true,
                }
              }
            ]
          },
          {
            path: 'plugins',
            children: [
              {
                path: 'scheduled',
                component: DataSchedulerComponent
              },
              {
                path: 'runs',
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
                  pageSizes: [10, 20, 50, 100]
                }
              }
            ]
          },

          {
            path: '**',
            component: GenericRdictTableComponent,
            data: {
              showSerach: true
            }
          }
        ],
        canActivate: [authGuard]
      }
      // {
      //     path: '**',
      //     redirectTo: ''
      // }
    ]
  }
];
