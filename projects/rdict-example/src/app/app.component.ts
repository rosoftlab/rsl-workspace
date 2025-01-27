import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        TranslateModule
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
