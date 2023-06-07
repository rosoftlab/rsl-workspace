import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CarModule } from './car/car.module';
import { ParkingRoutingModule } from './parking-routing.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ParkingRoutingModule,
    CarModule,
  ]
})
export class ParkingModule { }
