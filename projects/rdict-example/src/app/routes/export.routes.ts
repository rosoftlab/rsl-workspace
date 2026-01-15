import { Routes } from '@angular/router';
import { ReactiveDictionary } from '@rosoftlab/rdict';

export const EXPORT_ROUTES: Routes = [
  {
    path: 'export_layout',
    loadChildren: () => import('./standard.routes').then((m) => m.getStandardRdictRoutes())
  },
  {
    path: 'scheduled_exports',
    loadChildren: () => import('./standard.routes').then((m) => m.getStandardRdictRoutes())
  },
  {
    path: 'scheduler',
    loadComponent: () => import('../components/data-scheduler/data-scheduler.component').then((m) => m.DataSchedulerComponent),
    data: {
      from: 'administration.export.scheduled_exports'
    }
  },
  {
    path: 'export_runs',
    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.GenericTableComponent),
    data: {
      impl: 'KENDO',
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
];
