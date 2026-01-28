import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonContent, IonFooter, IonIcon } from '@ionic/angular/standalone';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { addIcons } from 'ionicons';
import { cameraOutline, checkmarkCircle, sendOutline, timeOutline } from 'ionicons/icons';
import { Car } from '../../services/car/car';
import { CarService } from '../../services/car/car.service';

@Component({
  selector: 'app-fill-gas',
  templateUrl: './fill-gas.component.html',
  styleUrls: ['./fill-gas.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, IonContent, IonButton, IonIcon, IonCard, IonCardContent, IonFooter]
})
export class FillGasComponent implements OnInit {
  form = new FormGroup({});
  model: Car;
  // any = {
  //   vehicleId: '',
  //   fuelType: '',
  //   liters: 0,
  //   date: new Date().toISOString(),
  //   photoTimestamp: null
  // };

  fields: FormlyFieldConfig[] = [
    // {
    //   key: 'licensePlate',
    //   type: 'input',
    //   templateOptions: {
    //     label: 'ID Vehicul/Utilaj',
    //     placeholder: 'Scanează QR sau introdu manual',
    //     required: true,
    //     readonly: true
    //   }
    // },
    {
      key: 'fuelType',
      type: 'input',
      templateOptions: {
        label: 'Tip Combustibil',
        placeholder: 'Ex: Motorină, Benzină',
        readonly: true
      }
    },
    {
      key: 'kmReading',
      type: 'input',
      templateOptions: {
        label: 'Nr. Kilometri/ Nr. Ore',
        placeholder: '0.00',
        type: 'number',
        required: true
      }
    },
    {
      key: 'liters',
      type: 'input',
      templateOptions: {
        label: 'Litri',
        placeholder: '0.00',
        type: 'number',
        required: true
      }
    },
    {
      key: 'description',
      type: 'textarea',
      templateOptions: {
        label: 'Descriere Alimentare'
      }
    }
  ];

  isProcessing = false;

  constructor(private carService: CarService) {
    addIcons({ cameraOutline, sendOutline, checkmarkCircle, timeOutline });
  }

  ngOnInit() {
    this.carService.get('a5e2eaba-2256-4ff6-8ff0-e26d4a0a31d6').subscribe((data) => (this.model = data));
  }

  async takePicture() {
    // try {
    //   const image = await Camera.getPhoto({
    //     quality: 90,
    //     allowEditing: false,
    //     resultType: CameraResultType.DataUrl,
    //     source: CameraSource.Camera
    //   });
    //   if (image.dataUrl) {
    //     this.isProcessing = true;
    //     this.model.photoTimestamp = new Date().toISOString();
    //     const result = await this.ocrService.recognizePumpData(image.dataUrl);
    //     this.model = {
    //       ...this.model,
    //       liters: result.liters || this.model.liters
    //     };
    //     // Update form model reference to trigger Formly detection if needed
    //     this.model = { ...this.model };
    //     this.isProcessing = false;
    //   }
    // } catch (error) {
    //   console.error('Camera error', error);
    //   this.isProcessing = false;
    // }
  }

  submit() {
    if (this.form.valid) {
      console.log('Fuel Entry Submitted:', this.model);
      // In a real app, send to API
      alert('Alimentare Înregistrată cu Succes!');
    }
  }
}
