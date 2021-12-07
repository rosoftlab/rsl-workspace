import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { BaseQueryData } from '../models/base-query-data';
import { BaseModel } from '../models/base.model';
import { BaseDatastore, ModelType } from './base-datastore.service';


@Injectable({
  providedIn: 'root'
})
export abstract class BaseService<T extends BaseModel> {
  public modelType: ModelType<T>;
  constructor(public datastore: BaseDatastore) {
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

  save(docTypeOrFormGroup: T | FormGroup, id?: any, origModel?: T): Observable<T> {
    if (id == null) {
      let fromModel: T;
      if (docTypeOrFormGroup instanceof FormGroup) {
        fromModel = this.fromFormGroup(docTypeOrFormGroup, id);
      } else {
        fromModel = docTypeOrFormGroup;
      }
      const data = this.datastore.createRecord(this.modelType, fromModel);
      return data.save();
    } else {
      return this.patch(docTypeOrFormGroup, origModel, id);
    }
  }

  patch(docTypeOrFormGroup: T | FormGroup, origModel: T, id?: any): Observable<T> {
    let fromModel: T;
    if (docTypeOrFormGroup instanceof FormGroup) {
      fromModel = this.fromFormGroup(docTypeOrFormGroup, id);
    } else {
      fromModel = docTypeOrFormGroup;
    }
    const data = this.datastore.createRecord(this.modelType, fromModel);
    return data.patch(origModel);
  }

  newModel(data?: any): T {
    return new this.modelType(this.datastore, data);
  }

  toFormGroup(fb: FormBuilder, fromModel?: T): FormGroup {
    if (fromModel === undefined) {
      fromModel = this.newModel();
    }
    return fromModel.getFromGroup(fb);
  }

  fromFormGroup(formGroup: FormGroup, id?: any): T {
    const saveModel = this.newModel(formGroup.getRawValue());
    saveModel.id = id ? id : null;
    return saveModel;
  }
}