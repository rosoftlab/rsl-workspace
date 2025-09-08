import { HttpClient, HttpDownloadProgressEvent, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse, HttpUploadProgressEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UploadProgress {
  type: 'progress' | 'response';
  loaded: number;
  total?: number;
  fileId?: string;
}

export interface DownloadProgress {
  type: 'progress' | 'response';
  loaded: number;
  total?: number;
  file?: File;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  private baseUrl = environment.rdictApi;
  // private baseUrl ='http://localhost:5200';

  constructor(private http: HttpClient) {}

  // uploadFile(file: File | Blob, filename?: string): Observable<UploadProgress> {
  //   const url = `${this.baseUrl}/upload`;

  //   const totalSize = file instanceof File ? file.size : file.size;
  //     // determine the filename
  //   const name =
  //     file instanceof File ? file.name : filename ?? 'upload.bin';
  //   const formData = new FormData();
  //   formData.append('file', file, file.name);

  //   // capture total size for the final event
  //   const totalSize = file.size;

  //   const req = new HttpRequest('POST', url, formData, {
  //     reportProgress: true,
  //   });

  //   return this.http.request<{ file_id: string }>(req).pipe(
  //     // only let through progress events or the final response
  //     filter(
  //       (
  //         evt: HttpEvent<{ file_id: string }>
  //       ): evt is HttpUploadProgressEvent | HttpResponse<{ file_id: string }> =>
  //         evt.type === HttpEventType.UploadProgress ||
  //         evt instanceof HttpResponse
  //     ),
  //     map((evt) => {
  //       if (evt.type === HttpEventType.UploadProgress) {
  //         // ✔️ safe to read loaded/total here
  //         return {
  //           type: 'progress',
  //           loaded: evt.loaded,
  //           total: evt.total ?? undefined,
  //         } as UploadProgress;
  //       } else {
  //         // ✔️ evt is HttpResponse<{file_id:string}>
  //         return {
  //           type: 'response',
  //           loaded: totalSize,
  //           total: totalSize,
  //           fileId: evt.body?.file_id,
  //         } as UploadProgress;
  //       }
  //     })
  //   );
  // }
  uploadFile(file: File | Blob, filename?: string, fileId?: string): Observable<UploadProgress> {
    const url = `${this.baseUrl}/upload`;
    const totalSize = file instanceof File ? file.size : file.size;

    // determine the filename
    const name = file instanceof File ? file.name : (filename ?? 'upload.bin');

    const fd = new FormData();
    fd.append('file', file, name);
    fd.append('filename', name);
    if (fileId !== undefined && fileId !== null) {
      fd.append('fileId', fileId);
    }
    // build headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/octet-stream',
      'X-Filename': name,
    });

    // raw-body POST
    const req = new HttpRequest('POST', url, fd, {
      // headers,
      reportProgress: true,
      // responseType: 'json',
      // withCredentials: false,
    });

    return this.http.request<{ file_id: string }>(req).pipe(
      // only let through progress events or the final response
      filter((evt: HttpEvent<{ file_id: string }>): evt is HttpUploadProgressEvent | HttpResponse<{ file_id: string }> => evt.type === HttpEventType.UploadProgress || evt instanceof HttpResponse),
      map((evt) => {
        if (evt.type === HttpEventType.UploadProgress) {
          // live progress
          return {
            type: 'progress',
            loaded: evt.loaded,
            total: evt.total ?? undefined,
          } as UploadProgress;
        } else {
          // final response, emit 100%
          return {
            type: 'response',
            loaded: totalSize,
            total: totalSize,
            fileId: evt.body?.file_id,
          } as UploadProgress;
        }
      }),
    );
  }
  downloadFile(fileId: string): Observable<DownloadProgress> {
    const url = `${this.baseUrl}/download/${fileId}`;

    const req = new HttpRequest('GET', url, {
      reportProgress: true,
      responseType: 'blob',
    });

    return this.http.request<Blob>(req).pipe(
      // Only let through DownloadProgressEvent or the final HttpResponse<Blob>
      filter((evt: HttpEvent<Blob>): evt is HttpDownloadProgressEvent | HttpResponse<Blob> => evt.type === HttpEventType.DownloadProgress || evt instanceof HttpResponse),
      map((evt) => {
        if (evt.type === HttpEventType.DownloadProgress) {
          // A progress event
          return {
            type: 'progress',
            loaded: evt.loaded,
            total: evt.total ?? undefined,
          } as DownloadProgress;
        } else {
          // The full response
          const cd = evt.headers.get('Content-Disposition') || '';
          const m = /filename="?(.+?)"?($|;)/.exec(cd);
          const filename = m ? m[1] : 'download.bin';

          // build a File from the blob
          const file = new File([evt.body!], filename, {
            type: evt.body!.type,
          });

          const size = evt.body!.size;
          return {
            type: 'response',
            loaded: size,
            total: size,
            file,
          } as DownloadProgress;
        }
      }),
    );
  }
}
