import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { BaseService, File as OptiFile } from '../core';
import { DATASTORE_PORT } from '../tokens/datastore-token';
import type { DatastorePort } from './datastore-port';

@Injectable({
  providedIn: 'root'
})
export class FileService extends BaseService<OptiFile> {
  constructor(
    @Inject(DATASTORE_PORT) datastore: DatastorePort,
    private httpClient: HttpClient
  ) {
    super(datastore);
    this.setModelType(OptiFile);
  }

  upload(file: Blob, filename?: string) {
    const url = `${this.datastore.buildUrl(this.modelType)}/upload`;
    const formData = new FormData();
    const safeName =
      filename || (file as { name?: string }).name || `upload-${Date.now()}`;
    formData.append('file', file, safeName);
    return this.httpClient.post<OptiFile>(url, formData, { withCredentials: true });
  }

  download(fileId: string, responseType: 'blob' | 'json' = 'blob') {
    const url = `${this.datastore.buildUrl(this.modelType)}/download`;
    const params = new HttpParams().set('fileId', fileId);
    return this.httpClient.get<Blob | OptiFile>(url, {
      params,
      withCredentials: true,
      responseType: responseType as 'json'
    });
  }

  fileUrl(fileId: string) {
    const url = `${this.datastore.buildUrl(this.modelType)}/${fileId}/fileurl`;
    return this.httpClient.get<{ url: string }>(url, { withCredentials: true });
  }

  putFileUrl(fileId: string) {
    const url = `${this.datastore.buildUrl(this.modelType)}/putfileurl`;
    const params = new HttpParams().set('fileId', fileId);
    return this.httpClient.get<string>(url, { params, withCredentials: true });
  }
}
