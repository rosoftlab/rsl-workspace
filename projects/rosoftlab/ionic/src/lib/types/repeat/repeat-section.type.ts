import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldArrayType, FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { getValueFromJsonData, readFileAsync } from '@rosoftlab/core';
import { FileSaverService } from 'ngx-filesaver';
import * as XLSX from 'xlsx';
import { IonicDialogService } from '../../ionic-dialog.service';
import { WrappersModule } from '../../wrappers/wrappers.module';

interface SearchProp {
  showSerach: boolean
  searchProp: string
}
interface ExportDataProp {
  propertiesToExport: string[]
  sheetName: string;
  fileName: string;
}
interface ImportDataProp {
  keyProp: string
  propertiesToImport: string[]
}
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  standalone: true,
  selector: 'formly-repeat-section',
  templateUrl: './repeat-section.html',
  styleUrls: ['./repeat-section.scss'],
  imports: [
    WrappersModule
  ]
})
export class RepeatTypeComponent extends FieldArrayType {
  /**
   *
   */
  @ViewChild('fileInput') fileInput: ElementRef;
  data: FormlyFieldConfig[] = null;
  serach: SearchProp = null;
  showSerach: boolean = false;
  deleteMessage: string
  deleteButton: string
  cancelButton: string
  filterValue: string = null;
  typeKey: string;
  importDataProp: ImportDataProp = null;
  exportDataProp: ExportDataProp = null;
  constructor(
    public dialogService: IonicDialogService,
    public translate: TranslateService,
    private fileSaverService: FileSaverService) {
    super();
    this.deleteMessage = this.translate.instant("General.Delete.Question")
    this.deleteButton = this.translate.instant("General.Delete.Button")
    this.cancelButton = this.translate.instant("General.Cancel.Button")

  }
  override remove(i: number, { markAsDirty } = { markAsDirty: true }) {
    this.dialogService.confirm(this.deleteMessage, null, this.deleteButton, this.cancelButton).then(
      (value: any) => {
        if (value.data) {
          var onDelete = this.field.props['onDelete'];
          if (onDelete) {
            onDelete(this.field.fieldGroup[i].model).subscribe(
              () => {
                super.remove(i);
              }
            )
          }
          super.remove(i);
        }
      }
    )
  }
  ngOnInit() {
    this.typeKey = this.field.key as string
    this.serach = this.props['search']
    this.exportDataProp = this.props['export'] || null
    this.importDataProp = this.props['import'] || null
    if (this.serach) {
      this.showSerach = this.serach.showSerach
    }

  }
  postPopulate(field: any) {
    if (this.showSerach) {
      this.data = field.fieldGroup
      if (this.filterValue) {
        this.field.fieldGroup = this.data.filter(f => f.formControl.value[this.serach.searchProp].toLowerCase().includes(this.filterValue))
      }
    }
  }
  handleChange(event) {
    if (this.showSerach) {
      if (this.data == null && this.field.fieldGroup !== null) {
        this.data = this.field.fieldGroup
      }
      this.filterValue = event.target.value.toLowerCase();
      this.field.fieldGroup = this.data.filter(f => f.formControl.value[this.serach.searchProp].toLowerCase().includes(this.filterValue))
    }
  }
  importData() {
    this.fileInput.nativeElement.click();
  }
  async handleImportFile(event: any) {
    const file = event.target.files[0];

    if (file) {
      try {


        const fileContents = await readFileAsync(file);
        // Handle the file contents here (e.g., display or process the data)
        const wb: XLSX.WorkBook = XLSX.read(fileContents)//, { type: 'binary' });
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        const excelData = XLSX.utils.sheet_to_json(ws)//, { header: 1 });
        excelData.forEach(element => {
          const jsonX = getValueFromJsonData(element, this.importDataProp.keyProp)
          const idx = this.field.parent.model[this.typeKey].findIndex(f => f[this.importDataProp.keyProp] === jsonX)
          if (idx >= 0) {
            const existingdata = this.field.parent.model[this.typeKey][idx]
            for (const prop of this.importDataProp.propertiesToImport) {
              const jsonVal = getValueFromJsonData(element, prop)
              if (existingdata[prop] !== jsonVal) {
                var fieldControl = this.field.fieldGroup[idx].formControl as FormGroup
                fieldControl.controls[prop].setValue(jsonVal)
              }
            }
          } else {
            super.add(null, element)
          }
        });

      } catch (error) {
        console.error('Error reading the file:', error);
      }
    }
  }

  exportData() {

    // Filter the data to include only the specified properties
    const filteredData = this.field.parent.model[this.typeKey].map(item => {
      const filteredItem: any = {};
      for (const prop of this.exportDataProp.propertiesToExport) {
        filteredItem[prop] = item[prop];
      }
      return filteredItem;
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.exportDataProp.sheetName);

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this.fileSaverService.save(blob, this.exportDataProp.fileName);
  }

  // getValueFromJsonData(jsonData: any, key: string): any {
  //   // Convert the key and all JSON keys to lowercase
  //   const lowercaseKey = key.toLowerCase();
  //   const lowercaseKeys = Object.keys(jsonData).map(k => k.toLowerCase());

  //   // Find the lowercase key in the lowercase keys array
  //   const index = lowercaseKeys.indexOf(lowercaseKey);

  //   // If found, use the original (proper case) key to access the value
  //   if (index !== -1) {
  //     const originalKey = Object.keys(jsonData)[index];
  //     return jsonData[originalKey];
  //   }

  //   // Key not found
  //   return undefined;
  // }
  // private readFileAsync(file: File): Promise<any> {
  //   return new Promise<any>((resolve, reject) => {
  //     const reader = new FileReader();

  //     reader.onload = (event: any) => {
  //       resolve(event.target.result);
  //     };

  //     reader.onerror = (event: any) => {
  //       reject(event.target.error);
  //     };

  //     reader.readAsArrayBuffer(file);
  //   });
  // }
}