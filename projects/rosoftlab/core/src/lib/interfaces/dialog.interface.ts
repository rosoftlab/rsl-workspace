// projects/rosoftlab/core/src/lib/interfaces/dialog.interface.ts
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface IDialogService {
  confirmDelete(): Observable<boolean>;
  confirm(content?: string, title?: string, confirmButtonText?: string, cancelButtonText?: string): Observable<boolean>;
  showError(content?: string, title?: string, confirmButtonText?: string, cancelButtonText?: string): Observable<boolean>;
  showSaveMessage(message?: string): void;
  // Add other common methods like 'open' or 'alert' if needed
}

export const DIALOG_SERVICE_TOKEN = new InjectionToken<IDialogService>('DIALOG_SERVICE_TOKEN');
