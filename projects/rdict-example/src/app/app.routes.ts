import { Routes } from '@angular/router';
import { FullComponent, GenericRdictTableComponent, RdictCrudComponent } from 'projects/rosoftlab/rdict/src/public-api';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { DataProcessingComponent } from './components/data-processing/data-processing.component';
import { DataSchedulerComponent } from './components/data-scheduler/data-scheduler.component';
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
                path: 'home', component: DataProcessingComponent
            },
            {
                path: 'data_processing', component: DataProcessingComponent
            },
            {
                path: "administration",
                children: [
                    {
                        path: "import_layout",
                        children: [
                            {
                                path: '',
                                component: GenericRdictTableComponent,
                                data: {
                                    // showSerach: true,
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
                                component: GenericRdictTableComponent,
                                data: {
                                    // showSerach: true,
                                }
                            }
                        ]
                    },
                    {
                        path: "export_layout",
                        component: GenericRdictTableComponent,
                        data: {
                            showSerach: true,
                        }
                    },
                    {
                        path: "locations",
                        component: GenericRdictTableComponent,
                        data: {
                            showSerach: true,
                        }
                    },
                    {
                        path: "data_processing_layout",
                        component: GenericRdictTableComponent,
                        data: {
                            showSerach: true,
                        }
                    },
                    {
                        path: "scheduler",
                        component: DataSchedulerComponent
                    },
                    {
                        path: "**",
                        component: GenericRdictTableComponent,
                        data: {
                            showSerach: true,
                        }
                    }
                ],
                canActivate: [authGuard]

            },
            // {
            //     path: '**',
            //     redirectTo: ''
            // }
        ]
    }
];
