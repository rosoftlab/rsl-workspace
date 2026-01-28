import type { HttpHeaders } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { BaseQueryData } from '../models/base-query-data';
import type { BaseModel } from '../models/base.model';

export type ModelType<T extends BaseModel> = new (data: any) => T;

export interface DatastorePort {
  findAll<T extends BaseModel>(
    modelType: ModelType<T>,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<BaseQueryData<T>>;

  findRecord<T extends BaseModel>(
    modelType: ModelType<T>,
    id?: string,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<T>;

  getCustom<U, T extends BaseModel>(
    modelType: ModelType<T>,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string,
    customResponseType?: any
  ): Observable<U>;

  postCustom<U, T extends BaseModel>(
    modelType: ModelType<T>,
    body: any,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<U>;

  patchCustom<U, T extends BaseModel>(
    modelType: ModelType<T>,
    body: any,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<U>;

  createRecord<T extends BaseModel>(modelType: ModelType<T>, data?: any): T;

  saveRecord<T extends BaseModel>(
    attributesMetadata: any,
    model: T,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string,
    customBody?: any
  ): Observable<T>;

  patchRecord<T extends BaseModel>(
    attributesMetadata: any,
    model: T,
    origModel?: T,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<T>;

  replaceRecord<T extends BaseModel>(
    attributesMetadata: any,
    model: T,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string,
    customBody?: any
  ): Observable<T>;

  deleteRecord<T extends BaseModel>(
    modelType: ModelType<T>,
    id: string,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<{}>;

  buildUrl<T extends BaseModel>(modelType: ModelType<T>, customUrl?: string): string;
  modelToEntity<T extends BaseModel>(model: T, attributesMetadata: any, allAttributes?: boolean): any;
}
