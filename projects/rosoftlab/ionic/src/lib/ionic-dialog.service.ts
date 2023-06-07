import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IonicDialogService {

  constructor(private alertController: AlertController) { }
  async confirm(message?: string, title?: string,
    confirmButtonText: string = 'Delete',
    cancelButtonText: string = 'Cancel'): Promise<boolean> {
    let choice
    const alert = await this.alertController.create({
      header: title,
      subHeader: message,
      buttons: [{
        text: cancelButtonText,
        handler: () => {
          alert.dismiss(false)
          return false
        }
      }, {
        text: confirmButtonText,
        handler: () => {
          alert.dismiss(true);
          return false;
        }
      }]
    });

    await alert.present();
    await alert.onDidDismiss().then((data) => {
      choice = data
    })
    return choice

  }
  async showSaveMessage(message?: string, title?: string) {
    const alert = await this.alertController.create({
      header: title,
      subHeader: message,
      buttons: ['OK']
    });

    await alert.present();

  }

}
