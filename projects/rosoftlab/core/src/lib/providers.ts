import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { BaseDatastore } from './services/base-datastore.service';
import { DatastoreCore } from './services/datastore.service';
import { DATASTORE_PORT } from './tokens/datastore-token';
export * from './services';
export const PROVIDERS: any[] = [
  BaseDatastore,
  DatastoreCore,
  { provide: DATASTORE_PORT, useExisting: DatastoreCore },
  DatePipe,
  DecimalPipe,
  PercentPipe
];
