import { NgIf, NgFor, NgClass, JsonPipe, NgStyle } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { KENDO_BUTTON } from '@progress/kendo-angular-buttons';
import { KENDO_STEPPER } from '@progress/kendo-angular-layout';
import { KENDO_INDICATORS } from "@progress/kendo-angular-indicators";
import { KENDO_SPREADSHEET, SpreadsheetComponent, SpreadsheetChangeEvent } from '@progress/kendo-angular-spreadsheet';
import { FormsModule } from "@angular/forms";
import { FileService } from '../../services/file.service';
import { ReactiveDictionary } from '@rosoftlab/rdict';

// import { Sheet } from '@progress/kendo-spreadsheed-common';

@Component({
  selector: 'app-import-plugin-editor',
  templateUrl: './import-plugin-editor.component.html',
  styleUrl: './import-plugin-editor.component.scss',
  imports: [
    KENDO_BUTTON,
    KENDO_STEPPER,
    KENDO_INDICATORS,
    NgIf,
    NgFor,
    JsonPipe,
    KENDO_SPREADSHEET,
    FormsModule,
    NgStyle
  ],
})
export class ImportPluginEditorComponent {
  hasItBeenAnalyzed: boolean = false;
  spreadsheetVisibility: number = 0;
  public file: File | Blob = new Blob();
  public fileUploaded: boolean = false;
  public currentStep = 0;

  typesOfData: any[] = [];
  steps = [
    {
      label: 'Fisierul de baza',
    },
    {
      label: 'corectare',
    },
    {
      label: 'Selectie date',
    },
  ];

  form = [];

  public isNextDisabled: boolean = true;

  @ViewChild('spreadsheetRef', { static: false })
  spreadsheetRef!: SpreadsheetComponent;
  ai_response: any | null = null;

  fileId: string = '';

  constructor(
    private fileService: FileService,
    private rdict: ReactiveDictionary
  ) { }

  ngOnInit(): void {
    // iote-te aici
    this.rdict.getArray$('administration.data_types').subscribe(typesOfData => {
      console.log('Data types loaded:', typesOfData);
      this.typesOfData = typesOfData;
      debugger
    });
  }

  onFileSelected($event: any) {
    const file: File = $event.target.files[0];
    this.file = file;
    this.fileService.uploadFile(file, file.name).subscribe((res: any) => {
      if (Object.prototype.hasOwnProperty.call(res, 'fileId')) {
        this.fileId = res.fileId;
        this.isNextDisabled = false;
        this.spreadsheetRef.spreadsheetWidget.fromFile(this.file);
        this.spreadsheetVisibility = 1;
      } else {
        // still loading
      }
    });
  }

  onChange(event: SpreadsheetChangeEvent, type: string) {
    const activeSheet: any = this.spreadsheetRef.spreadsheetWidget.activeSheet();
  }

  rangeModif() {
    this.createExcelRanges(this.ai_response);
  }

  sheetChange(event: any) {
    console.log(this.spreadsheetRef.activeSheet);
    // debugger
  }

  async nextStep() {
    const nextIndex = this.currentStep + 1;
    // Use the same logic as onStepChange:
    this.onStepChange(nextIndex);
  }

  async prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      await this.showStep();
    }
  }

  private async showStep() {
    this.isNextDisabled = false;
    //Load the data so i can show a message if i have data
    if (this.currentStep == 1) {
      this.analyzeSheet();
    }
    if (this.currentStep == 0) {
      this.isNextDisabled = true;
      this.hasItBeenAnalyzed = false;
      this.spreadsheetVisibility = 0;
      this.file = new Blob();
      this.fileUploaded = false;
    }
  }

  async onStepChange(newStep: number) {
    if (!this.validateStep(this.currentStep)) {
      console.warn(`Step ${this.currentStep} is not valid, skipping data load.`);
    } else {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep = newStep;
        await this.showStep();
        // this.selections = [this.getStep1Data(), this.getStep2Data()];
      } else {
        // this.saveData();
      }
    }
  }

  public validateStep(index: number): boolean {
    // Add your validation logic here
    return true;
  }

  public nextText() {
    if (this.currentStep == 3) {
      return 'Save';
    }
    return 'Next';
  }

  public analyzeSheet() {
    this.rdict.get$('ai').subscribe((aiInstanceData) => {
      aiInstanceData.executeFunction('get_column_maping', [this.fileId, this.spreadsheetRef.activeSheet], {}, 300_000).subscribe((processResponse: any) => {
        console.log('File processed successfully:', processResponse);
        this.ai_response = processResponse;
        this.hasItBeenAnalyzed = true;
        // debugger;

        Object.keys(this.ai_response).forEach(filter => {
          // debugger;
        })

        this.createExcelRanges(this.ai_response);
      });
    });
  }

  createExcelRanges(config: any, maxRows = 10000, maxCols = 926) {
    const colors: string[] = ["red", "yellow", "green", "blue", "orange", "purple", "cyan", "magenta"];
    const ranges: string[] = [];
    // daca n-are cifre si litere nu merge mai departe. da eroare sau ceva.
    // value.placeholder trebuie sa aibe si cifre si litere
    // /^(?=.*[0-9])(?=.*[A-Za-z])[A-Za-z0-9]+$/
    // input.forEach(str => {
    //   console.log(str + ' => ' + regex.test(str));
    // });

    Object.keys(config).forEach((param: any) => {
      const value = config[param];
      if (value.end) {
        // Explicit start and end (e.g. C1:F1)
        ranges.push(`${value.start}:${value.end}`);
      } else if (value.direction === 'down') {
        // Column down (e.g. A2:A1000)
        const col = value.start.match(/[A-Z]+/i)[0];
        const row = value.start.match(/\d+/)[0];
        ranges.push(`${col}${row}:${col}${maxRows}`);
      } else if (value.direction === 'right') {
        // Row right (e.g. A1:Z1)
        const startCol = value.start.match(/[A-Z]+/i)[0];
        const row = value.start.match(/\d+/)[0];
        const endCol = String.fromCharCode(startCol.charCodeAt(0) + maxCols - 1);
        ranges.push(`${startCol}${row}:${endCol}${row}`);
      }
    });

    const as: any = this.spreadsheetRef.spreadsheetWidget.activeSheet();
    ranges.forEach((range: string, index: number) => {
      as.range(range).background(colors[index]);
    });
    // debugger

    return ranges;
  }

}
