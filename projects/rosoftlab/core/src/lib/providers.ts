import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { BaseDatastore } from './services/base-datastore.service';
import { DatastoreCore } from './services/datastore.service';
export const PROVIDERS: any[] = [
  BaseDatastore,
  DatastoreCore,
  DatePipe,
  DecimalPipe,
  PercentPipe
];
