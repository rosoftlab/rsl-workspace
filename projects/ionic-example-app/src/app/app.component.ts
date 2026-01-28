import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [
    IonApp,
    IonRouterOutlet,
    TranslateModule,
    // RslSharedModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'rdict-example';
  constructor(public translate: TranslateService) {
    translate.setDefaultLang('ro');
    translate.use('ro');
  }
}
