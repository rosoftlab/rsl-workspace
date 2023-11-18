import { Observable } from 'rxjs';
export interface DialogService {
  confirm(message?: string, text?: string, confirmButtonText?: string, cancelButtonText?: string): Observable<boolean>;
  showSaveMessage(message?: string, title?: string): Observable<boolean>;
  showRegisteredMessage(message?: string, title?: string): Observable<boolean>;
  showErrorMessage(e: any, message?: string): Observable<boolean>;
}

