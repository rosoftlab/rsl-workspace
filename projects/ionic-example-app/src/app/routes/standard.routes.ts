import { EnvironmentProviders, Provider } from '@angular/core';
import { Routes } from '@angular/router';
import { ReactiveDictionary } from '@rosoftlab/rdict';

export const getStandardRdictRoutes = (
  {
    layoutPath = 'assets/layouts/data.json',
    editCol = 'name',
    idProperty = 'oid',
    extraProviders = [],
    modelService = ReactiveDictionary
  }: {
    layoutPath?: string;
    editCol?: string;
    idProperty?: string;
    extraProviders?: (Provider | EnvironmentProviders)[];
    modelService?: any;
  } = {} // New argument
): Routes => [
  {
    path: '',
    // Apply the providers at the top level of this route branch
    providers: extraProviders,
    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.GenericTableComponent),
    data: {
      impl: 'KENDO',
      modelService: modelService,
      showSearch: true,
      editColumn: editCol,
      idProperty: idProperty,
      fileLayout: layoutPath
    }
  },
  {
    path: 'add',
    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.GenericCrudComponent),
    data: {
      impl: 'KENDO',
      modelService: modelService,
      fileLayout: layoutPath
    }
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.GenericCrudComponent),
    data: {
      impl: 'KENDO',
      modelService: modelService,
      fileLayout: layoutPath
    }
  }
];
// export const STANDARD_RDICT_ROUTES: Routes = [
//   {
//     path: '',
//     loadComponent: () => import('@rosoftlab/shared-ui').then((c) => c.GenericTableComponent),
//     data: {
//       impl: 'KENDO',
//       modelService: ReactiveDictionary,
//       showSearch: true,
//       editColumn: 'name',
//       idProperty: 'oid',
//       fileLayout: 'assets/layouts/data.json'
//     }
//   },
//   {
//     path: 'add',
//     component: RdictCrudComponent,
//     data: {
//       fileLayout: 'assets/layouts/data.json'
//     }
//   },
//   {
//     path: 'edit/:id',
//     component: RdictCrudComponent,
//     data: {
//       fileLayout: 'assets/layouts/data.json'
//     }
//   }
// ];
