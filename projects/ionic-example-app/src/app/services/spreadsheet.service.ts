import { Injectable } from '@angular/core';
import { SpreadsheetComponent } from '@progress/kendo-angular-spreadsheet';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpreadsheetService {
  private sheet$ = new BehaviorSubject<SpreadsheetComponent | null>(null);
  readonly sheetRef$ = this.sheet$.asObservable();
  set(sheet: SpreadsheetComponent) {
    this.sheet$.next(sheet);
  }
}
