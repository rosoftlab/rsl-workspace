import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { BaseDatastore } from './services/base-datastore.service';
import { DatastoreCore } from './services/datastore.service';
export * from './services';
export const PROVIDERS: any[] = [
  BaseDatastore,
  DatastoreCore,
  DatePipe,
  DecimalPipe,
  PercentPipe
];
