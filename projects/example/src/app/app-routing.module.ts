import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '@rosoftlab/core';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { TestComponent } from './components/test/test.component';
import { AuthGuard } from './shared/authguard';
import { FullComponent } from './shared/layouts/full/full.component';
;

const modelsImport = import('./models')
const datastoreImport = import(`./services`)
const routes: Routes = [
  { path: 'auth-callback', component: AuthCallbackComponent },

  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: 'folder/Inbox',
        pathMatch: 'full'
      },

      {
        path: 'folder/:id',
        loadChildren: () => import('./folder/folder.module').then(m => m.FolderPageModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'your-route/:className',
        component: TestComponent,
        // resolve: {
        //   modelInstance: DynamicallyModelResolver(modelsImport),
        //   serviceInstance: DynamicallyServiceResolver(datastoreImport, 'Datastore'),
        // }
      },
      {
        path: 'administration',
        loadChildren: () => import('./modules/administration/administration.module').then(m => m.AdministrationModule),
        canActivate: [AuthGuard],
      },

      {
        path: '**', component: PageNotFoundComponent, canActivate: [AuthGuard],
      },
      { path: 'notfound', component: PageNotFoundComponent, canActivate: [AuthGuard], },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
