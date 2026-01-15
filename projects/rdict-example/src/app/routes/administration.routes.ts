import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'import',
    loadChildren: () => import('./import.routes').then((m) => m.IMPORT_ROUTES)
  },
  {
    path: 'export',
    loadChildren: () => import('./export.routes').then((m) => m.EXPORT_ROUTES)
  },
  {
    path: 'locations',
    loadChildren: () => import('./standard.routes').then((m) => m.getStandardRdictRoutes())
  },
  {
    path: 'data_processing_layout',
    loadChildren: () => import('./standard.routes').then((m) => m.getStandardRdictRoutes())
  },
  {
    path: 'data_types',
    loadChildren: () => import('./standard.routes').then((m) => m.getStandardRdictRoutes())
  },
  {
    path: 'data_sources',
    loadChildren: () => import('./standard.routes').then((m) => m.getStandardRdictRoutes())
  },
  {
    path: 'security',
    loadChildren: () => import('./security.routes').then((m) => m.SECURITY_ROUTES)
  }
];
