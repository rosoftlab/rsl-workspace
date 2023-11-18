import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldArrayType, FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { ColumnMode, SelectionType, TableColumn } from '@swimlane/ngx-datatable';
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
  standalone: true,
  selector: 'app-repeat-datatable',
  templateUrl: './repeat-datatable.component.html',
  styleUrls: ['./repeat-datatable.component.scss'],
  imports: [
    WrappersModule
  ]
})
export class RepeatDatatableComponent extends FieldArrayType implements OnInit {
  /**
   *
   */
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('defaultColumn', { static: true }) public defaultColumn: TemplateRef<any>;
  @ViewChild('actionsTmpl', { static: true }) actionsTmpl: TemplateRef<any>;

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

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  constructor(
    public dialogService: IonicDialogService,
    public translate: TranslateService,
    private fileSaverService: FileSaverService) {
    super();
    this.deleteMessage = this.translate.instant("General.Delete.Question")
    this.deleteButton = this.translate.instant("General.Delete.Button")
    this.cancelButton = this.translate.instant("General.Cancel.Button")

  }
  override add(i?: number, initialModel?: any) {
    initialModel = {}
    this.props['columns'].forEach(column => initialModel[column.prop] = null)
    super.add(i, initialModel);
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
    this.props['columns'].forEach(column => column.cellTemplate = this.defaultColumn);
    this.props['columns'].push({
      cellTemplate: this.actionsTmpl,
      name: '',
      cellClass: 'actions-cell',
      draggable: false,
      sortable: false,
      visible: true,
      width: 75,
      maxWidth: 75,
      minWidth: 75
    })
    this.typeKey = this.field.key as string
    this.serach = this.props['search']
    this.exportDataProp = this.props['export'] || null
    this.importDataProp = this.props['import'] || null
    if (this.serach) {
      this.showSerach = this.serach.showSerach
    }

  }
  getField(field: FormlyFieldConfig, column: TableColumn, rowIndex: number): FormlyFieldConfig {
    return field.fieldGroup[rowIndex].fieldGroup.find(f => f.key === column.prop);
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


        const fileContents = await this.readFileAsync(file);
        // Handle the file contents here (e.g., display or process the data)
        const wb: XLSX.WorkBook = XLSX.read(fileContents)//, { type: 'binary' });
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        const excelData = XLSX.utils.sheet_to_json(ws)//, { header: 1 });
        excelData.forEach(element => {
          const jsonX = this.getValueFromJsonData(element, this.importDataProp.keyProp)
          const idx = this.field.parent.model[this.typeKey].findIndex(f => f[this.importDataProp.keyProp] === jsonX)
          if (idx >= 0) {
            const existingdata = this.field.parent.model[this.typeKey][idx]
            for (const prop of this.importDataProp.propertiesToImport) {
              const jsonVal = this.getValueFromJsonData(element, prop)
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

  getValueFromJsonData(jsonData: any, key: string): any {
    // Convert the key and all JSON keys to lowercase
    const lowercaseKey = key.toLowerCase();
    const lowercaseKeys = Object.keys(jsonData).map(k => k.toLowerCase());

    // Find the lowercase key in the lowercase keys array
    const index = lowercaseKeys.indexOf(lowercaseKey);

    // If found, use the original (proper case) key to access the value
    if (index !== -1) {
      const originalKey = Object.keys(jsonData)[index];
      return jsonData[originalKey];
    }

    // Key not found
    return undefined;
  }
  private readFileAsync(file: File): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        resolve(event.target.result);
      };

      reader.onerror = (event: any) => {
        reject(event.target.error);
      };

      reader.readAsArrayBuffer(file);
    });
  }
}