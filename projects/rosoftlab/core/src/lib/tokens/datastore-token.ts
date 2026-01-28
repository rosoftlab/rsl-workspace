import { InjectionToken } from '@angular/core';
import type { DatastorePort } from '../services/datastore-port';

export const DATASTORE_PORT = new InjectionToken<DatastorePort>('DATASTORE_PORT');
