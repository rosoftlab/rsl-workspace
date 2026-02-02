import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { add, create, save, trash } from 'ionicons/icons';
import { register } from 'swiper/element/bundle';
import { OfflineQueueService } from './shared/offline-queue.service';
import { OfflineTransactionQueueService } from './shared/offline-transaction-queue.service';

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
  title = 'FixFuel';
  constructor(
    public translate: TranslateService,
    offlineQueue: OfflineQueueService,
    offlineTransactions: OfflineTransactionQueueService
  ) {
    addIcons({ add, create, save, trash });
    translate.setFallbackLang('ro');
    translate.use('ro');
    offlineQueue.init();
    offlineTransactions.init();
  }
}
