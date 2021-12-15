import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { BaseDatastore } from './services/base-datastore.service';
export * from './services';

export const PROVIDERS: any[] = [
  BaseDatastore,
  DatePipe,
  DecimalPipe,
  PercentPipe,
];
