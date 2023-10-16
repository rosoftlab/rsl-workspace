import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RslBaseModule } from '@rosoftlab/core';
import { OAuthModule } from 'angular-oauth2-oidc';
import { CacheInterceptor } from 'dist/@rosoftlab/core';
import { ClipboardModule } from 'ngx-clipboard';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { MyMissingTranslationHandler } from './handler/my-missing-translation-handler';
import { AuthService } from './services/auth.service';
import { Datastore } from './services/datastore.service';
import { LanguageService } from './services/language.service';
import { UserService } from './services/user.service';
import { AuthInterceptor } from './shared/auth.interceptor';
import { AuthGuard } from './shared/authguard';
import { CanDeactivateGuard } from './shared/can-deactivate-guard';
import { FullComponent } from './shared/layouts/full/full.component';
import { StorageService } from './shared/services/storage.service';
import { TranslateloaderService } from './shared/services/translateloader.service';
import { UserMenuComponent } from './shared/user-menu/user-menu.component';
export let InjectorInstance: Injector;

const declarations: any[] = [
  AppComponent,
  AuthCallbackComponent,
  UserMenuComponent,
  FullComponent
];

const providers: any[] = [
  { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  AuthGuard,
  AuthService,
  StorageService,
  UserService,
  Datastore,
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true, },
  { provide: 'CACHE_EXPIRATION_TIME', useValue: 3600000 },
  { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
  TranslateloaderService,
  DatePipe,
  DecimalPipe,
  PercentPipe,
  LanguageService,
  CanDeactivateGuard
]

const imports: any[] = [
  BrowserModule,
  BrowserAnimationsModule,
  IonicModule.forRoot(),
  AppRoutingModule,
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  LayoutModule,
  HttpClientModule,
  RslBaseModule,
  TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useClass: TranslateloaderService,
      deps: [HttpClient]
    },
    missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler },
    useDefaultLang: false,
  }),
  ClipboardModule,
  OAuthModule.forRoot()
]

@NgModule({
  declarations: declarations,
  imports: imports,
  providers: providers,
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private injector: Injector) {
    InjectorInstance = this.injector;
  }
}
