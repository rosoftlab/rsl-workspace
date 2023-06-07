import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Car } from 'projects/example/src/app/models';
import { CarService } from 'projects/example/src/app/services';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.css']
})
export class CarListComponent {

  CarRef: Car;
  constructor(
    public carService: CarService,
    private router: Router) { }

  addForm() {
    this.router.navigate(['administration/parking/car/add']);
  }
}
