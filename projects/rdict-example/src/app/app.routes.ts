import { Routes } from '@angular/router';
import { FullComponent } from '@rosoftlab/rdict';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { TestComponent } from './components/test/test.component';
import { UnderConstructionComponent } from './components/under-construction/under-construction.component';
import { authGuard } from './shared/authguard';



export const routes: Routes = [
  { path: 'auth-callback', component: AuthCallbackComponent },
  {
    path: 'editor',
    loadComponent: () => import('./components/model-designer/model-editor/model-editor.component').then((c) => c.ModelEditorComponent)
  },
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
        loadComponent: () => import('./components/data-processing/data-processing.component').then((c) => c.DataProcessingComponent)
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
        loadChildren: () => import('./routes/administration.routes').then((m) => m.ADMIN_ROUTES),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: '**',
    component: UnderConstructionComponent
  }
];
