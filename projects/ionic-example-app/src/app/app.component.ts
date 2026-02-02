import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { add, create, save, trash } from 'ionicons/icons';
import { register } from 'swiper/element/bundle';

register();

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
    addIcons({ add, create, save, trash });
    translate.setFallbackLang('ro');
    translate.use('ro');
  }
}
