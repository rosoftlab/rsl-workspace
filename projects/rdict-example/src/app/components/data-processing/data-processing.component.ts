import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { KENDO_BUTTON } from '@progress/kendo-angular-buttons';
import { KENDO_CALENDAR, KENDO_DATEINPUTS } from '@progress/kendo-angular-dateinputs';
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
import { Workbook } from '@progress/kendo-angular-excel-export';
import { KENDO_GRID } from '@progress/kendo-angular-grid';
import { KENDO_SVGICON, SVGIcon } from '@progress/kendo-angular-icons';
import { KENDO_LOADER } from '@progress/kendo-angular-indicators';
import { KENDO_FORMFIELD } from '@progress/kendo-angular-inputs';
import { KENDO_INTL } from '@progress/kendo-angular-intl';
import { KENDO_LABEL } from '@progress/kendo-angular-label';
import { KENDO_STEPPER } from '@progress/kendo-angular-layout';
import { KENDO_LISTBOX } from '@progress/kendo-angular-listbox';
import { BreadCrumbItem, KENDO_BREADCRUMB } from '@progress/kendo-angular-navigation';
import { KENDO_SPREADSHEET, SpreadsheetComponent } from '@progress/kendo-angular-spreadsheet';
import { KENDO_TREEVIEW } from '@progress/kendo-angular-treeview';
import * as svgIcons from '@progress/kendo-svg-icons';
import { MaterialDialogService, ReactiveDictionary, SocketService } from '@rosoftlab/rdict';
import { format } from 'date-fns';
import { Observable, of } from 'rxjs';
import { DataService } from '../../services/data.service';
import { FileService } from '../../services/file.service';
import { SpreadsheetService } from '../../services/spreadsheet.service';
;
@Component({
  selector: 'app-data-processing',
  templateUrl: './data-processing.component.html',
  styleUrls: ['./data-processing.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    KENDO_DROPDOWNLIST,
    KENDO_SPREADSHEET,
    KENDO_STEPPER,
    KENDO_CALENDAR,
    KENDO_LABEL,
    KENDO_BUTTON,
    KENDO_BREADCRUMB,
    KENDO_LISTBOX,
    KENDO_SVGICON,
    KENDO_TREEVIEW,
    KENDO_INTL,
    KENDO_DATEINPUTS,
    KENDO_LOADER,
    KENDO_DIALOG,
    KENDO_FORMFIELD,
    KENDO_GRID,
  ],
  // ,
  // providers: [
  //   { provide: SOCKET_URL, useValue: 'http://localhost:5100' },
  // ]
})
export class DataProcessingComponent implements OnInit {
  public step0Form!: FormGroup;

  public model: any = {
    date: new Date(),
    selectedLocationId: '',
    selectedDataPrecessingLayoutId: '',
    selectedLocation: null,
    selectedDataPrecessingLayout: null,
  };

  loading = false;
  public locations$: Observable<any> = of([]); // Never emits null
  public plugins: ReactiveDictionary | null = null;
  public exportList$: Observable<any> = of([]); // Never emits null
  public dataProcessingLayouts$: Observable<any> = of([]); // Never emits null
  public imports$: Observable<any> = of([]);
  public dataTypes: any;
  public dataSources: any;

  public selections: BreadCrumbItem[] = [];
  public currentStep = 0;
  public allIcons = svgIcons;

  steps = [
    {
      label: 'Data și locație',
    },
    {
      label: 'Preluare date',
    },
    // {
    //   label: 'Selectie coloane',
    // },
    {
      label: 'Prelucrare',
    },
  ];
  private machetaId: any = null;
  private machetaFileOrBlob: File | Blob | null = null;
  private macheta_mapping: any = null;
  private data: any[] | undefined;

  public isNextDisabled: boolean = false;

  @ViewChild('spreadsheetRef', { static: false })
  spreadsheetRef!: SpreadsheetComponent;

  constructor(
    public translate: TranslateService,
    private socketService: SocketService,
    private rdict: ReactiveDictionary,
    private dataService: DataService,
    private fileService: FileService,
    private svc: SpreadsheetService,
    protected dialogService: MaterialDialogService,
    private fb: FormBuilder
  ) {}
  async ngOnInit() {
    this.step0Form = this.fb.group({
      date: [new Date(), Validators.required],
      selectedLocation: [null, Validators.required],
    });
    this.loadDropdowns();
  }

  private async loadDropdowns() {
    this.locations$ = this.rdict.getArray$('administration.locations');
    this.plugins = await this.rdict.asyncGet('administration.plugins');
    this.exportList$ = this.rdict.getArray$('administration.export_layout');
    this.dataProcessingLayouts$ = this.rdict.getArray$('administration.data_processing_layout');
  }

  async onStepChange(newStep: number) {
    if (!this.validateStep(this.currentStep)) {
      console.warn(`Step ${this.currentStep} is not valid, skipping data load.`);
    } else {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep = newStep;
        await this.showStep();
        this.selections = [this.getStep1Data(), this.getStep2Data()];
      } else {
        this.saveData();
      }
    }
  }

  public validateStep(index: number): boolean {
    console.log(`isStepValid called for step ${index}`);
    if (index === 0) {
      if (this.step0Form.invalid) {
        // Mark all controls as touched so validation messages appear
        this.step0Form.markAllAsTouched();
        return false; // do NOT change currentStep → Kendo “sticks” on step 0
      }
      // If valid, you can also copy form values into your “model” if needed:
      this.model.date = this.step0Form.value.date;
      this.model.selectedLocation = this.step0Form.value.selectedLocation;
    }
    return true;
  }
  public getIsFiledValid(fieldName: string, fromGroup: FormGroup) {
    if (fromGroup != null || fromGroup != undefined) {
      return fromGroup?.get(fieldName)?.invalid;
    }
    return true;
  }
  async nextStep() {
    const nextIndex = this.currentStep + 1;
    // Use the same logic as onStepChange:
    this.onStepChange(nextIndex);
  }
  getStep1Data() {
    return {
      text: this.model?.selectedLocation?.name + ' ' + this.model.date.toDateString(),
    };
  }
  getStep2Data() {
    return {
      text: this.model?.selectedDataPrecessingLayout?.name,
    };
  }
  getStatusColor(status: string): string {
    if (status.endsWith('1')) {
      return 'green';
    } else if (status.endsWith('2')) {
      return 'orange';
    } else if (status.endsWith('3')) {
      return 'red';
    } else {
      return 'gray';
    }
  }

  getstatusIcon(status: string): SVGIcon {
    if (status.endsWith('1')) {
      return this.allIcons.checkCircleIcon;
    } else if (status.endsWith('2')) {
      return this.allIcons.infoCircleIcon;
    } else if (status.endsWith('3')) {
      return this.allIcons.warningCircleIcon;
    } else {
      return this.allIcons.alignBottomIcon;
    }
  }
  async prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      await this.showStep();
    }
  }

  public async machetaValueChange(value: any): Promise<void> {
    this.loading = true;
    if (value !== null && value.template !== undefined) {
      this.machetaId = value.db_id;
      const template = this.parseTemplate(value.template);
      this.macheta_mapping = template.mapping;
      if (template.fileId) {
        this.fileService.downloadFile(template.fileId).subscribe({
          next: async (progress) => {
            if (progress.type === 'response') {
              // console.log('File downloaded successfully:', progress);
              const fileOrBlob = progress.file;

              if (fileOrBlob) {
                // now TS knows fileOrBlob is File | Blob
                this.machetaFileOrBlob = fileOrBlob;
                await this.spreadsheetRef.spreadsheetWidget.fromFile(this.machetaFileOrBlob);
                const start = performance.now();
                this.fillProcessingSpreadshhet(this.data);
                const end = performance.now();
                const durationInSeconds = (end - start) / 1000;
                console.log(`Function fillProcessingSpreadshhet took ${durationInSeconds.toFixed(3)} seconds`);
                this.loading = false;
              } else {
                console.error('downloadFile returned no file/blob');
              }
              this.loading = false;
            }
          },
        });
      }
    }
  }
  parseTemplate(tenplate_value: any): any {
    try {
      // First, convert single quotes → double quotes so JSON.parse can succeed:
      let jsonString = tenplate_value.trim();
      if (jsonString.length >= 2 && jsonString.startsWith('"') && jsonString.endsWith('"')) {
        // Remove the very first " and very last "
        jsonString = jsonString.slice(1, -1);
        // Now jsonString starts with '{' and ends with '}'
      }

      // 3. Replace Python-style booleans with JSON booleans (if you haven’t already)
      jsonString = jsonString
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bTrue\b/g, 'true')
        .replace(/'/g, '"'); // Replace single quotes with double quotes
      // Now parse:
      const x = JSON.parse(jsonString);
      return x;
    } catch (e) {
      return tenplate_value;
    }
  }

  private fillProcessingSpreadshhet(data: any): void {
    if (!this.spreadsheetRef || !this.spreadsheetRef.spreadsheetWidget) {
      console.error('Spreadsheet component is not initialized');
      return;
    }
    const sheet = this.spreadsheetRef.spreadsheetWidget.activeSheet();
    if (!sheet) {
      console.error('Active sheet is not available');
      return;
    }

    const map_dict: { [key: string]: string } = this.macheta_mapping.reduce((acc: { [key: string]: string }, item: any) => {
      // strip out all digits from sheet_column
      const lettersOnly = item.sheet_column.replace(/[0-9]/g, '');
      // use the 'field' value as the key
      acc[item.field] = lettersOnly;
      return acc;
    }, {} as { [key: string]: string });
    const startRow = 2;
    const numRows = data.length; // e.g. data = [ {...}, {...}, ... ]
    const endRow = startRow + numRows - 1; // final sheet‐row index

    function toColumnMatrix<T>(values: Array<string | number | Date | undefined>): (string | number | Date | undefined)[][] {
      return values.map((v) => [v]);
    }

    if ('-1' in map_dict || '-2' in map_dict) {
      const dateColLetter = map_dict['timeDate'] ?? map_dict['-1'];
      // ← or whatever key you mapped “date part of time” to (e.g. '-1' in your earlier code)
      const timeColLetter = map_dict['timeHour'] ?? map_dict['-2'];
      // ← or whatever key you mapped “hour part of time” to (e.g. '-2')

      // Build two separate arrays: one for the YYYY‐MM‐DD, one for hh:mm
      const dateValues: (string | undefined)[] = [];
      const hourValues: (string | undefined)[] = [];

      for (const row of data) {
        // Suppose row.time is something parseable by Date (e.g. ISO string or timestamp)
        if (row.time != null) {
          const iso = new Date(row.time as string).toISOString();
          const [fullDate, fullTime] = iso.split('T'); // ["YYYY-MM-DD", "hh:mm:ss.sssZ"]

          dateValues.push(fullDate); // “YYYY-MM-DD”
          hourValues.push(fullTime.slice(0, 5)); // “hh:mm”
        } else {
          // If no time, leave blank:
          dateValues.push(undefined);
          hourValues.push(undefined);
        }
      }

      // Turn them into column‐matrices:
      const dateMatrix = toColumnMatrix(dateValues);
      const hourMatrix = toColumnMatrix(hourValues);
      // Write column A2:A(endRow), B2:B(endRow), etc.
      (sheet.range(`${dateColLetter}${startRow}:${dateColLetter}${endRow}`) as any).values(dateMatrix as any);
      (sheet.range(`${timeColLetter}${startRow}:${timeColLetter}${endRow}`) as any).values(hourMatrix as any);
    }

    // 4) For all the OTHER fields (that map to a single column), build and write them:
    for (const [fieldKey, colLetter] of Object.entries(map_dict)) {
      // Skip keys you’ve already handled (e.g. “time”, or any you don’t want to fill)
      if (fieldKey === '__idx' || fieldKey === '-1' /* or "timeDate"/"timeHour" */ || fieldKey === '-2') {
        continue;
      }

      // If you intentionally want to skip “C”, just ensure map_dict["someField"] !== "C"
      // or add an explicit check: if (colLetter === 'C') continue;

      // 4a) Build a plain array of values down all rows:
      const rawValues: (string | number | Date | undefined)[] = data.map((row: any) => {
        // If some rows don’t have this field, you’ll get `undefined` → blank cell.
        return row[fieldKey] as string | number | Date | undefined;
      });

      // 4b) Turn it into a vertical 2D array:
      const columnMatrix = toColumnMatrix(rawValues);

      // 4c) Compute the A1 range for this column: e.g. “D2:D10” if colLetter = “D” and endRow = 10
      const rangeA1 = `${colLetter}${startRow}:${colLetter}${endRow}`;

      // 4d) Write the whole column at once:
      (sheet.range(rangeA1) as any).values(columnMatrix as any);
      this.isNextDisabled = false;
    }
  }
  private async showStep() {
    this.isNextDisabled = false;
    //Load the data so i can show a message if i have data
    if (this.currentStep == 1) {
      this.loadData();
    }
    if (this.currentStep == 2) {
      this.isNextDisabled = true;
      setTimeout(async () => {
        if (this.machetaFileOrBlob) {
          await this.spreadsheetRef.spreadsheetWidget.fromFile(this.machetaFileOrBlob);
          this.fillProcessingSpreadshhet(this.data);
        }
      }, 500);
    }
  }
  private loadImports() {
    if (this.plugins) {
      const request = {
        filters: `import_date=${this.model.date.toISOString().split('T')[0]},location_id=${this.model.selectedLocation?.oid}`,
        sorts: { file_name: 'asc' },
        page_size: 100,
      };

      this.imports$ = this.plugins.getFilteredView('runs', request);
    }
    //  .subscribe((data: any) => {
    //     console.log('received filtered view 2:', data);
    //   });
  }
  //Get the data from server and save to local data
  private async loadData() {
    this.loading = true;
    this.loadImports();
    let filters = '';
    const newStartDate = format(this.model.date, 'yyyy-MM-dd') + 'T00:00:00';
    const newEndDate = format(this.model.date, 'yyyy-MM-dd') + 'T23:59:59';

    if (this.model.date) {
      filters += `timeBETWEEN${newStartDate}..${newEndDate}`;
    }
    if (this.model.selectedLocation.oid) {
      filters += `,entity_id=${this.model.selectedLocation.oid}`;
    }
    const request = {
      filters: filters,
    };
    this.rdict.getFilteredView('data', request).subscribe(async (data) => {
      if (data.length === 0) {
        // alert('No data found');
        // this.dialogService.confirm(
        //   this.translate.instant('No data found')
        // );
        this.isNextDisabled = true;
        this.loading = false;
        return;
      }
      // const xx = await this.rdict.processTableData(data);
      this.data = data;
      console.log(data);

      // const start = performance.now();
      // this.fillProcessingSpreadshhet(data);
      // const end = performance.now();
      // const durationInSeconds = (end - start) / 1000;
      // console.log(`Function fillProcessingSpreadshhet took ${durationInSeconds.toFixed(3)} seconds`);
      this.loading = false;
    });
  }
  public nextText() {
    if (this.currentStep == 2) {
      return 'Save';
    }
    return 'Next';
  }
  public async saveData() {
    this.rdict.get$('processed_data').subscribe(async (dataP) => {
      console.log(dataP);
      const records: Record<string, any> = {};
      records['date'] = this.model.date;
      records['location_id'] = this.model.selectedLocation.db_id;
      //Save the sheet file
      const file = await this.spreadsheetRef.spreadsheetWidget.saveAsExcel({ Workbook });
      if (file instanceof Blob) {
        this.fileService.uploadFile(file, 'data_procesed.xlsx').subscribe({
          next: async (progress) => {
            if (progress.type === 'response') {
              console.log('File uploaded successfully:', progress);
              records['file_id'] = progress.fileId;
              await dataP.update(records, null);
              //I have the excel updated so now i can create a new processed data
            } else if (progress.type === 'progress') {
              console.log('Upload progress:', progress.loaded, '/', progress.total);
            }
          },
          error: (error) => {
            console.error('File upload failed:', error);
          },
        });
      }
      console.log(file);
    });
  }
}
