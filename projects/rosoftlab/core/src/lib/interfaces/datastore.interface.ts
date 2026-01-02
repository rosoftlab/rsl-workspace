import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
export type ModelType<T> = new (datastore: IDatastore, data: any) => T;
export const DATASTORE_TOKEN = new InjectionToken<IDatastore>('IDatastore');

export interface IDatastore {
  saveRecord(attributesMetadata: any, model: any, params?: any, headers?: any, customUrl?: string, customBody?: any): Observable<any>;
  patchRecord(attributesMetadata: any, model: any, origModel: any, params?: any, headers?: any, customUrl?: string): Observable<any>;
  replaceRecord(attributesMetadata: any, model: any, params?: any, headers?: any, customUrl?: string, customBody?: any): Observable<any>;
  modelToEntity(model: any, attributesMetadata: any, allAttributes?: boolean): any;
}