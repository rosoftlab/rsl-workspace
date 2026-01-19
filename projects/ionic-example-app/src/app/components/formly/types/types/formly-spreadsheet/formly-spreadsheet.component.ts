import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { TranslateModule } from '@ngx-translate/core';
import { KENDO_SPLITTER } from '@progress/kendo-angular-layout';
import { KENDO_SPREADSHEET, SheetDescriptor, SpreadsheetChangeEvent, SpreadsheetComponent, SpreadsheetExcelImportEvent } from '@progress/kendo-angular-spreadsheet';
import { KENDO_TOOLBAR } from '@progress/kendo-angular-toolbar';
import { FileService } from 'projects/rdict-example/src/app/services/file.service';
import { SpreadsheetService } from 'projects/rdict-example/src/app/services/spreadsheet.service';

@Component({
  selector: 'app-formly-spreadsheet',
  templateUrl: './formly-spreadsheet.component.html',
  styleUrls: ['./formly-spreadsheet.component.scss'],
  imports: [FormlyModule, CommonModule, ReactiveFormsModule, FormlyKendoModule, TranslateModule, KENDO_TOOLBAR, KENDO_SPREADSHEET, KENDO_SPLITTER],
})
export class FormlySpreadsheetComponent extends FieldType implements OnInit, AfterViewInit {
  @ViewChild('spreadsheetRef', { static: true })
  spreadsheetRef!: SpreadsheetComponent;
  isImport: boolean = false;
  isFirstTime = true;
  fileId: string = '';
  loading: boolean = false;
  public data: SheetDescriptor[] = [];
  /**
   *
   */
  constructor(
    private fileService: FileService,
    private svc: SpreadsheetService,
  ) {
    super();
  }
  ngOnInit() {
    this.formControl.valueChanges.subscribe((value) => {
      // console.log('Custom value change:', value);
      if (value != undefined) {
        if (this.isFirstTime) {
          // console.log('Initial value set:', value);
          this.fileId = value?.fileId || '';
          this.download_execel();
          this.isFirstTime = false;
          // this.data = value;
          // setTimeout(() => {
          // this.spreadsheetRef.activeSheet = value[0]?.name;
          // }, 1000);
        }
      }
    });
  }
  download_execel() {
    if (this.fileId) {
      this.loading = true;
      this.fileService.downloadFile(this.fileId).subscribe({
        next: (progress) => {
          if (progress.type === 'response') {
            // console.log('File downloaded successfully:', progress);
            const fileOrBlob = progress.file;

            if (fileOrBlob) {
              // now TS knows fileOrBlob is File | Blob
              this.spreadsheetRef.spreadsheetWidget.fromFile(fileOrBlob);
            } else {
              console.error('downloadFile returned no file/blob');
            }
            this.loading = false;
          }
        },
      });
    }
  }
  spreadsheetChange(event: SpreadsheetChangeEvent) {
    // console.log('Spreadsheet change event:', event.sender.sheets());
    // const x = event.sender.activeSheet();
    // console.log('Spreadsheet change event:', x);
    // setTimeout(() => {
    //   if (!this.isImport) {
    //     this.setFormData(event.sender.sheets());
    //   } else {
    //     this.isImport = false;
    //   }
    // }, 1000);
  }
  excelImport(event: SpreadsheetExcelImportEvent) {
    if (this.loading) return;
    setTimeout(() => {
      this.fileService.uploadFile(event.file, undefined, this.fileId).subscribe({
        next: (progress) => {
          if (progress.type === 'response') {
            console.log('File uploaded successfully:', progress);
            this.setFileId(progress.fileId);
            this.svc.set(this.spreadsheetRef);
          } else if (progress.type === 'progress') {
            console.log('Upload progress:', progress.loaded, '/', progress.total);
          }
        },
        error: (error) => {
          console.error('File upload failed:', error);
        },
      });
      //const desc = event.sender.sheets()[0];
      //console.log('Excel import:', event.sender.sheets());
      this.isImport = true;
      //this.setFormData(desc);
    }, 1000);
  }
  setFileId(data: any) {
    this.isFirstTime = false;
    // if (data !== null && !Array.isArray(data)) {
    //   data = [data];
    // }
    // const cleanedData = this.cleanEmptyCells(data);
    const fg = this.formControl as FormGroup;
    let fileIdControl = this.formGroup.get('fileId');
    if (!fileIdControl) {
      this.formGroup.addControl('fileId', new FormControl(''));
      fileIdControl = this.formGroup.get('fileId');
    }

    fileIdControl?.setValue(data);
    fileIdControl?.markAsDirty();
    fileIdControl?.markAsTouched();
  }
  cleanEmptyCells(data: any[]): string {
    const dataJson = JSON.parse(JSON.stringify(data));
    const cleaned = dataJson.map((sheet: any) => {
      if (!sheet.rows) return sheet;

      const cleanedRows = sheet.rows
        .map((row: any) => {
          const filteredCells = row.cells?.filter((cell: any) => 'value' in cell) || [];
          return {
            ...row,
            cells: filteredCells,
          };
        })
        .filter((row: any) => row.cells.length > 0)
        .sort((a: any, b: any) => a.index - b.index); // Sort rows by index

      return {
        ...sheet,
        rows: cleanedRows,
      };
    });

    return JSON.stringify(cleaned); // formatted for readability
  }
  get formGroup(): FormGroup {
    // console.log(this.formControl);
    // console.log(this.formControl as FormGroup);
    return this.formControl as FormGroup;
  }
  ngAfterViewInit() {
    this.svc.set(this.spreadsheetRef);
  }
}
