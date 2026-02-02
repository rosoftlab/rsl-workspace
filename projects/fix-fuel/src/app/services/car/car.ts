import { BaseModel, BaseModelConfig } from '@rosoftlab/core';

@BaseModelConfig({
  type: 'car',
  formTitle: 'Administration.Parking.Car.Title'
})
export class Car extends BaseModel {
  declare licensePlate: string | undefined;

  declare description: string | undefined;

  declare fields: any;
  //   @IonicDataTableLayout({ name: 'Car.ITP.ExpirationDate', pipe: new DatePipe('en', 'shortDate') })
  get itpExpirationDate(): Date | null {
    return this.fields?.itp?.expirationDate ? new Date(this.fields.itp.expirationDate) : null;
  }
  //   @IonicDataTableLayout({ name: 'Car.Rovinieta.ExpirationDate', pipe: new DatePipe('en', 'shortDate') })
  get rovinietaExpirationDate(): Date | null {
    return this.fields?.rovinieta?.expirationDate ? new Date(this.fields.rovinieta.expirationDate) : null;
  }
}
