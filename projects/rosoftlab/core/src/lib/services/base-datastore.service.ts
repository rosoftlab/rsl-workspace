import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { compare } from 'fast-json-patch';
import * as qs from 'qs';
import { Observable, Observer, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DatastoreConfig } from '../interfaces/datastore-config.interface';
import { ModelConfig } from '../interfaces/model-config.interface';
import { BaseQueryData } from '../models/base-query-data';
import { BaseModel } from '../models/base.model';
export type ModelType<T extends BaseModel> = new (datastore: BaseDatastore, data: any) => T;

@Injectable()
export class BaseDatastore {
  protected config!: DatastoreConfig;
  // tslint:disable-next-line:variable-name
  private _store: { [type: string]: { [id: string]: BaseModel } } = {};
  // tslint:enable:max-line-length
  // tslint:disable-next-line:ban-types
  private toQueryString: Function = this.datastoreConfig.overrides
    && this.datastoreConfig.overrides.toQueryString ?
    this.datastoreConfig.overrides.toQueryString : this._toQueryString;
  // tslint:enable:max-line-length

  private get getDirtyAttributes() {
    if (this.datastoreConfig.overrides
      && this.datastoreConfig.overrides.getDirtyAttributes) {
      return this.datastoreConfig.overrides.getDirtyAttributes;
    } else {
      return BaseDatastore.getDirtyAttributes;
    }
  }

  public get getAllAttributes() {
    if (this.datastoreConfig.overrides
      && this.datastoreConfig.overrides.getAllAttributes) {
      return this.datastoreConfig.overrides.getAllAttributes;
    } else {
      return BaseDatastore.getAllAttributes;
    }
  }

  // protected config: DatastoreConfig;

  private static getDirtyAttributes(attributesMetadata: any): { string: any } {
    const dirtyData: any = {};

    for (const propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        const metadata: any = attributesMetadata[propertyName];

        if (metadata.hasDirtyAttributes) {
          const attributeName = metadata.serializedName != null ? metadata.serializedName : propertyName;
          dirtyData[attributeName] = metadata.serialisationValue ? metadata.serialisationValue : metadata.newValue;
        }
      }
    }
    return dirtyData;
  }

  private static getAllAttributes(attributesMetadata: any): { string: any } {
    const dirtyData: any = {};

    for (const propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        const metadata: any = attributesMetadata[propertyName];
        const attributeName = metadata.serializedName != null ? metadata.serializedName : propertyName;
        dirtyData[attributeName] = metadata.serialisationValue ? metadata.serialisationValue : metadata.newValue;
      }
    }
    return dirtyData;
  }

  constructor(protected httpClient: HttpClient) {
  }

  findAll<T extends BaseModel>(
    modelType: ModelType<T>,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<BaseQueryData<T>> {
    const customHeadhers: HttpHeaders = this.buildHeaders(headers);
    const htmlParams = this.buildParams(params);
    const url: string = this.buildUrl(modelType, customUrl);

    const response = this.httpClient.get(url,
      { headers: customHeadhers, params: htmlParams, withCredentials: true })
      .pipe(
        map(res => this.extractQueryData(res, modelType)),
        catchError(this.handleError)
      );
    return response;
  }

  findRecord<T extends BaseModel>(
    modelType: ModelType<T>,
    id?: string,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<T> {
    const customHeadhers: HttpHeaders = this.buildHeaders(headers);
    let url: string = this.buildUrl(modelType, customUrl);
    if (id) {
      url += '/' + id;
    }

    const htmlParams = this.buildParams(params, undefined);
    return this.httpClient.get(url, { headers: customHeadhers, params: htmlParams, withCredentials: true })
      .pipe(map(res => this.entityToModel(res, modelType, undefined)),
        catchError(this.handleError)
      );
  }
  getCustom<U, T extends BaseModel>(modelType: ModelType<T>,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string,
    customResponseType?: any): Observable<U> {
    const customHeadhers: HttpHeaders = this.buildHeaders(headers);
    const url: string = this.buildUrl(modelType, customUrl);
    const htmlParams = this.buildParams(params, undefined);
    if (!customResponseType)
      customResponseType = 'json';
    return this.httpClient.get<U>(url, { headers: customHeadhers, params: htmlParams, withCredentials: true, responseType: customResponseType });
  }

  postCustom<U, T extends BaseModel>(modelType: ModelType<T>,
    body: any,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string): Observable<U> {
    const customHeadhers: HttpHeaders = this.buildHeaders(headers);
    const url: string = this.buildUrl(modelType, customUrl);
    const htmlParams = this.buildParams(params, undefined);
    return this.httpClient.post<U>(url, body, { headers: customHeadhers, params: htmlParams, reportProgress: true, withCredentials: true });
  }

  patchCustom<U, T extends BaseModel>(modelType: ModelType<T>,
    body: any,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string): Observable<U> {
    const customHeadhers: HttpHeaders = this.buildHeaders(headers);
    const url: string = this.buildUrl(modelType, customUrl);
    const htmlParams = this.buildParams(params, undefined);
    return this.httpClient.patch<U>(url, body, { headers: customHeadhers, params: htmlParams, withCredentials: true });
  }
  createRecord<T extends BaseModel>(modelType: ModelType<T>, data?: any): T {
    return new modelType(this, data);
  }

  saveRecord<T extends BaseModel>(
    attributesMetadata: any, model: T,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string,
    customBody?: any
  ): Observable<T> {
    const modelType = model.constructor as ModelType<T>;
    const modelConfig: ModelConfig = model.modelConfig;
    const customHeadhers: HttpHeaders = this.buildHeaders(headers);
    const url: string = this.buildUrl(modelType, customUrl);
    const htmlParams = this.buildParams(params);

    let httpCall: Observable<any>;

    const body = customBody || this.modelToEntity(model, attributesMetadata);

    if (model.id) {
      // tslint:disable-next-line:max-line-length
      httpCall = this.httpClient.patch(url + '/' + model.id, body, { headers: customHeadhers, params: htmlParams, withCredentials: true });
    } else {
      httpCall = this.httpClient.post(url, body, { headers: customHeadhers, params: htmlParams, withCredentials: true });
    }

    return httpCall
      .pipe(
        map(res => {
          const data = this.resetMetadataAttributes(res, attributesMetadata, modelType);
          return this.entityToModel(data, modelType);
        }),
        catchError(this.handleError)
      );
  }

  patchRecord<T extends BaseModel>(
    attributesMetadata: any, model: T,
    origModel: T,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<T> {
    const modelType = model.constructor as ModelType<T>;
    const modelConfig: ModelConfig = model.modelConfig;
    const customHeadhers: HttpHeaders = this.buildHeaders(headers);
    const url: string = this.buildUrl(modelType, customUrl);
    const htmlParams = this.buildParams(params);

    let httpCall: Observable<any>;
    let origData = { id: '' };
    if (origModel)
      origData = this.modelToEntity(origModel, origModel.attributeMetadata, true);
    const newData = this.modelToEntity(model, attributesMetadata, true);
    newData.id = origData.id;
    const patch = compare(origData, newData);
    if (patch.length > 0) {
      httpCall = this.httpClient.patch(url + '/' + model.id, patch, { headers: customHeadhers, params: htmlParams, withCredentials: true });

      return httpCall
        .pipe(
          map(res => {
            const data = this.resetMetadataAttributes(res, attributesMetadata, modelType);
            return this.entityToModel(data, modelType);
          }),
          catchError(this.handleError)
        );
    } else {
      return new Observable((observer: Observer<T>) => {
        observer.next(model);
        observer.complete();
      });
    }
  }
  // getPatch<T extends BaseModel>(
  //   model: T,
  //   origModel: T): any {

  // }
  replaceRecord<T extends BaseModel>(
    attributesMetadata: any, model: T,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string,
    customBody?: any
  ): Observable<T> {
    const modelType = model.constructor as ModelType<T>;
    const modelConfig: ModelConfig = model.modelConfig;
    const customHeadhers: HttpHeaders = this.buildHeaders(headers);
    const url: string = this.buildUrl(modelType, customUrl);
    const htmlParams = this.buildParams(params);

    let httpCall: Observable<any>;

    const body = customBody || this.modelToEntity(model, attributesMetadata, true);

    if (model.id) {
      httpCall = this.httpClient.put(url + '/' + model.id, body, { headers: customHeadhers, params: htmlParams, withCredentials: true });
    } else {
      httpCall = this.httpClient.post(url, body, { headers: customHeadhers, params: htmlParams, withCredentials: true });
    }

    return httpCall
      .pipe(
        map(res => {
          const data = this.resetMetadataAttributes(res, attributesMetadata, modelType);
          return this.entityToModel(data, modelType);
        }),
        catchError(this.handleError)
      );
  }


  deleteRecord<T extends BaseModel>(
    modelType: ModelType<T>,
    id: string,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<{}> {
    const customHeadhers: HttpHeaders = this.buildHeaders(headers);
    let url: string = this.buildUrl(modelType, customUrl);
    if (!url.includes('share')) {
      url = url + '/' + id;
    }
    // const idParam = new HttpParams().set('id', id);
    return this.httpClient.delete(url, { headers: customHeadhers, withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  public buildUrl<T extends BaseModel>(
    modelType: ModelType<T>,
    customUrl?: string
  ): string {

    if (customUrl) {
      return customUrl;
    }

    const modelConfig: ModelConfig = Reflect.getMetadata('BaseModelConfig', modelType);

    const baseUrl = modelConfig.baseUrl || this.datastoreConfig.baseUrl;
    const apiVersion = modelConfig.apiVersion || this.datastoreConfig.apiVersion;
    const modelEndpointUrl: string = modelConfig.modelEndpointUrl || modelConfig.type;

    const url: string = [baseUrl, apiVersion, modelEndpointUrl].filter((x) => x).join('/');

    return url;
  }

  protected extractQueryData<T extends BaseModel>(
    res: any,
    modelType: ModelType<T>
  ): BaseQueryData<T> {
    let result;
    const body: any = res;
    const models: T[] = [];

    for (const data of body.data) {
      const model = this.entityToModel(data, modelType, undefined);
      models.push(model);
    }

    result = new BaseQueryData(models, this.parseMeta(body, modelType));
    return result;
  }

  protected deserializeModel<T extends BaseModel>(modelType: ModelType<T>, data: any) {
    data = this.transformSerializedNamesToPropertyNames(modelType, data);
    return new modelType(this, data);
  }

  protected handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      // console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      // console.error(
      //   'Backend returned code ${error.status}, ' +
      //   'body was: ${error.error}');
    }
    // return an observable with a user-facing error message
    return throwError(error);
  }

  protected parseMeta(body: any, modelType: ModelType<BaseModel>): any {
    const metaModel: any = Reflect.getMetadata('BaseModelConfig', modelType).meta;
    return new metaModel(body);
  }

  protected resetMetadataAttributes<T extends BaseModel>(res: T, attributesMetadata: any, modelType: ModelType<T>) {
    // TODO check why is attributesMetadata from the arguments never used

    for (const propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        const metadata: any = attributesMetadata[propertyName];

        if (metadata.hasDirtyAttributes) {
          metadata.hasDirtyAttributes = false;
        }
      }
    }

    if (res) {
      res.attributeMetadata = attributesMetadata;
    }
    return res;
  }

  public get datastoreConfig(): DatastoreConfig {
    const configFromDecorator: DatastoreConfig = Reflect.getMetadata('BaseDatastoreConfig', this.constructor);
    return Object.assign(configFromDecorator, this.config);
  }

  protected transformSerializedNamesToPropertyNames<T extends BaseModel>(modelType: ModelType<T>, attributes: any) {
    const serializedNameToPropertyName = this.getModelPropertyNames(modelType.prototype);
    const properties: any = {};

    Object.keys(serializedNameToPropertyName).forEach((serializedName) => {
      if (attributes[serializedName] !== null && attributes[serializedName] !== undefined) {
        properties[serializedNameToPropertyName[serializedName]] = attributes[serializedName];
      }
    });

    return properties;
  }

  protected getModelPropertyNames(model: BaseModel) {
    return Reflect.getMetadata('AttributeMapping', model);
  }

  public buildHeaders(customHeaders?: HttpHeaders): HttpHeaders {
    const headers: any = {
      Accept: 'application/json-patch+json',
      // 'Content-Type': 'application/vnd.api+json',
      'Content-Type': 'application/json-patch+json'
    };
    if (customHeaders && customHeaders.keys().length) {
      // tslint:disable-next-line:variable-name
      Object.assign({}, headers, customHeaders.keys().map(header_name => {
        headers['' + header_name] = customHeaders.get(header_name);
      }));
    }
    return new HttpHeaders(headers);
  }

  public buildParams(params: any, id?: string): HttpParams {
    let httpParams = new HttpParams();
    if (id) {
      httpParams = httpParams.set('id', id);
    }
    if (params) {
      Object.keys(params)
        .filter(key => {
          const v = params[key];
          return (Array.isArray(v) || typeof v === 'string') ?
            (v.length > 0) :
            (v !== null && v !== undefined);
        })
        .forEach(key => {
          httpParams = httpParams.set(key, params[key]);
        });
    }
    return httpParams;
  }


  protected entityToModel<T extends BaseModel>(
    res: any,
    modelType: ModelType<T>,
    model?: T
  ) {
    return this.extractRecordDataJson(res, modelType, model);
  }


  private extractRecordDataJson<T extends BaseModel>(
    res: Response,
    modelType: ModelType<T>,
    model?: T
  ): T {
    const body: any = res;
    if (!body) {
      throw new Error('no body in response');
    }
    if (model) {
      Object.assign(model, body);
    }
    const deserializedModel = model || this.deserializeModel(modelType, body.data || body);
    return deserializedModel;
  }

  public modelToEntity<T extends BaseModel>(
    model: T,
    attributesMetadata: any,
    allAttributes: boolean = false
  ): any {
    let attributes;
    if (allAttributes) {
      attributes = this.getAllAttributes(attributesMetadata, model);
    } else {
      attributes = this.getDirtyAttributes(attributesMetadata, model);
    }
    // this.getRelationships(model, attributes);
    return attributes;
  }
  private _toQueryString(params: any): string {
    return qs.stringify(params, { arrayFormat: 'brackets' });
  }


}
