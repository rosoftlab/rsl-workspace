import { HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { BaseQueryData } from '../models/base-query-data';
import { BaseModel } from '../models/base.model';
import { DATASTORE_PORT } from '../tokens/datastore-token';
import type { DatastorePort, ModelType } from './datastore-port';


@Injectable({
  providedIn: 'root'
})
export class BaseService<T extends BaseModel> {
  public modelType: ModelType<T>;
  constructor(@Inject(DATASTORE_PORT) public datastore: DatastorePort) {
  }
  setModelType(modelType: ModelType<T>) {
    this.modelType = modelType;
  }

  get(id?: any, customInclude: string = ''): Observable<T> {
    const response = this.datastore.findRecord(this.modelType, id, { customInclude });
    return response;
  }

  getAll(page: number,
    pageSize: number,
    sort: string = '',
    filters: string = '',
    customInclude: string = ''): Observable<BaseQueryData<T>> {
    const response = this.datastore.findAll(this.modelType,
      {
        Page: page,
        PageSize: pageSize,
        Sorts: sort,
        Filters: filters,
        customInclude
      });
    return response;
  }
  delete(id: any): Observable<{}> {
    const response = this.datastore.deleteRecord(this.modelType, id);
    return response;
  }
  getCustom<U>(params?: any,
    headers?: HttpHeaders,
    customUrl?: string,
    customResponseType?: any): Observable<U> {
    return this.datastore.getCustom<U, T>(this.modelType, params, headers, customUrl, customResponseType);
  }
  postCustom<U>(
    body: any,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string): Observable<U> {
    return this.datastore.postCustom<U, T>(this.modelType, body, params, headers, customUrl);
  }
  patchCustom<U>(
    body: any,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string): Observable<U> {
    return this.datastore.patchCustom<U, T>(this.modelType, body, params, headers, customUrl);
  }
  // checkIfPropertyUnique(property: string, value: any): Observable<boolean> {

  // }

  save(docTypeOrFormGroup: T | UntypedFormGroup, id?: any, origModel?: T): Observable<T> {
    if (id == null) {
      let fromModel: T;
      if (docTypeOrFormGroup instanceof UntypedFormGroup) {
        fromModel = this.fromFormGroup(docTypeOrFormGroup, id);
      } else {
        fromModel = docTypeOrFormGroup;
      }
      return this.datastore.saveRecord(fromModel.attributeMetadata, fromModel);
    } else {
      return this.patch(docTypeOrFormGroup, origModel, id);
    }
  }

  patch(docTypeOrFormGroup: T | UntypedFormGroup, origModel?: T, id?: any): Observable<T> {
    let fromModel: T;
    if (docTypeOrFormGroup instanceof UntypedFormGroup) {
      fromModel = this.fromFormGroup(docTypeOrFormGroup, id);
    } else {
      fromModel = docTypeOrFormGroup;
    }
    return this.datastore.patchRecord(fromModel.attributeMetadata, fromModel, origModel);
  }

  newModel(data?: any): T {
    return new this.modelType(data);
  }

  toFormGroup(fb: UntypedFormBuilder, fromModel?: T): UntypedFormGroup {
    if (fromModel === undefined) {
      fromModel = this.newModel();
    }
    return fromModel.getFromGroup(fb);
  }

  fromFormGroup(formGroup: UntypedFormGroup, id?: any): T {
    // const saveModel = this.newModel(formGroup.getRawValue());
    // saveModel.id = id ? id : null;
    // return saveModel;
    const saveModel = this.newModel();
    saveModel.getModelFromFormGroup(formGroup)
    saveModel.id = id ? id : null;
    return saveModel;
  }
  serializeModel(model: T): any {
    return this.datastore.modelToEntity(model, model.attributeMetadata, true);
  }
  getSelectValues(property: string): Observable<any[]> {
    return null;
  }
}
