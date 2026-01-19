import { importProvidersFrom } from '@angular/core';
import { Routes } from '@angular/router';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveDictionary } from '@rosoftlab/rdict';
import { FormlyCronTypeComponent } from '../components/formly/types/cron-control/cron-type.component';

export const IMPORT_ROUTES: Routes = [
  {
    path: 'import_layout',
    children: [
      {
        path: '',
        loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.GenericTableComponent),
        data: {
          impl: 'KENDO',
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
          import('../components/import-plugin-editor/import-plugin-editor.component').then((c) => c.ImportPluginEditorComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('../components/import-plugin-editor/import-plugin-editor.component').then((c) => c.ImportPluginEditorComponent)
      }
    ]
  },
  {
    path: 'scheduled_imports',
    loadChildren: () =>
      import('./standard.routes').then((m) =>
        m.getStandardRdictRoutes({
          extraProviders: [
            importProvidersFrom(
              FormlyModule.forChild({
                types: [
                  {
                    name: 'cron',
                    component: FormlyCronTypeComponent,
                    wrappers: ['form-field']
                  }
                ]
              })
            )
          ]
        })
      )
  },
  {
    path: 'scheduler',
    loadComponent: () => import('../components/data-scheduler/data-scheduler.component').then((c) => c.DataSchedulerComponent),
    data: {
      from: 'administration.import.scheduled_imports'
    }
  },
  {
    path: 'import_runs',
    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.GenericTableComponent),
    data: {
      impl: 'KENDO',
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
];
