import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular'; // Ensure Ionic is installed
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        TranslateModule,
        IonicModule
        // RslSharedModule
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'rdict-example';
  constructor(
    public translate: TranslateService,
  ) {
    translate.setDefaultLang('ro');
    translate.use('ro');
  }
}
