import { Injectable } from '@angular/core';
import { Gate } from '@models/administration';
import { BaseServiceFormly } from '@rosoftlab/formly';
import { Observable, of } from 'rxjs';
import { Datastore } from './datastore.service';



@Injectable({
  providedIn: 'root'
})
export class GateService extends BaseServiceFormly<Gate> {
  direction = [
    { value: 0, label: 'In' },
    { value: 1, label: 'Out' },
  ];
  constructor(datastore: Datastore) {
    super(datastore);
    this.setModelType(Gate);
  }
  getSelectValues(property: string): Observable<any[]> {
    switch (property) {
      case 'gateDirection':
        return of(this.direction);
      default:
        return null;
    }
  }
}
