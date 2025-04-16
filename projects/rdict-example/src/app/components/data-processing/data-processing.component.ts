import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { KENDO_BUTTON } from '@progress/kendo-angular-buttons';
import { KENDO_CALENDAR, KENDO_DATEINPUTS, SelectionRange } from '@progress/kendo-angular-dateinputs';
import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
import { KENDO_SVGICON, SVGIcon } from '@progress/kendo-angular-icons';
import { KENDO_LOADER } from '@progress/kendo-angular-indicators';
import { KENDO_INTL } from '@progress/kendo-angular-intl';
import { KENDO_LABEL } from '@progress/kendo-angular-label';
import { KENDO_STEPPER } from '@progress/kendo-angular-layout';
import { KENDO_LISTBOX } from '@progress/kendo-angular-listbox';
import { BreadCrumbItem, KENDO_BREADCRUMB } from '@progress/kendo-angular-navigation';
import { KENDO_SPREADSHEET, SheetDescriptor, SpreadsheetComponent } from '@progress/kendo-angular-spreadsheet';
import { KENDO_TREEVIEW } from '@progress/kendo-angular-treeview';
import * as svgIcons from '@progress/kendo-svg-icons';
import { ReactiveDictionary, SocketService } from 'projects/rosoftlab/rdict/src/public-api';
import { DataService } from '../../services/data.service';
@Component({
  selector: 'app-data-processing',
  templateUrl: './data-processing.component.html',
  styleUrls: ['./data-processing.component.scss'],
  imports: [
    CommonModule,
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
    KENDO_LOADER
  ]
  // ,
  // providers: [
  //   { provide: SOCKET_URL, useValue: 'http://localhost:5100' },
  // ]
})
export class DataProcessingComponent implements OnInit {
  public rangeSelectionValue: SelectionRange = {
    start: new Date(),
    end: new Date()
  };
  public model: any = {
    date: new Date(),
    selectedLocationId: '',
    selectedDataPrecessingLayoutId: '',
    selectedLocation: null,
    selectedDataPrecessingLayout: null
  };
  loading = false;
  public locations: any;
  public dataPrecessingLayouts: any;
  public dataTypes: any;
  public dataSources: any;
  public selections: BreadCrumbItem[] = [];

  currentStep = 0;
  public allIcons = svgIcons;
  steps = [{ label: 'Data și locație' }, { label: 'Preluare date' }, { label: 'Selectie coloane' }, { label: 'Prelucrare' }];

  selectedDate: string | null = null;
  selectedLocation: string | null = null;
  public importList: any | null = [];
  public exportList: any | null = [];

  data: string | null = null;
  availableColumns = ['Column 1', 'Column 2', 'Column 3'];
  selectedColumns: string[] = [];

  public data2: SheetDescriptor[] = [];

  public treeNodes: any[] = [];
  public checkedKeys: any[] = [];
  @ViewChild('spreadsheetRef', { static: false })
  spreadsheetRef!: SpreadsheetComponent;

  constructor(
    public translate: TranslateService,
    private socketService: SocketService,
    private rdict: ReactiveDictionary,
    private dataService: DataService
  ) {}
  async ngOnInit() {
    await this.loadStepData(0);
  }
  private async loadStepData(index: number) {
    switch (index) {
      case 0:
        this.locations = await this.rdict.getTableWithoutGuid('administration.locations');
        break;
      case 1:
        this.importList = await this.rdict.getTableWithoutGuid('administration.import_layout');
        this.exportList = await this.rdict.getTableWithoutGuid('administration.export_layout');
        this.dataPrecessingLayouts = await this.rdict.getTableWithoutGuid('administration.data_processing_layout');
        break;
      case 2:
        this.dataTypes = await this.rdict.getTableWithoutGuid('administration.data_types');
        this.dataSources = await this.rdict.getTableWithoutGuid('administration.data_sources');        
        this.dataService
          .getAvaibleColumns$(
            this.model.date,
            this.model.date,
            this.model.selectedLocation.oid,
            null,
            this.dataSources,
            this.dataTypes
          )
          .subscribe((data) => {
            this.treeNodes = data;
            console.log(this.treeNodes);
            // this.data2 = data;
            // setTimeout(() => {
            //   this.spreadsheetRef.activeSheet = 'Data';
            // });
            // this.loading = false;
          });

        // console.log(this.dataTypes);
        // console.log(this.dataSources);
        break;
      case 3:
        this.data2 = [];
        this.loading = true;
        this.dataService
          .getData$(
            this.model.date,
            this.model.date,
            this.model.selectedLocation.oid,
            null,
            this.dataSources,
            this.dataTypes
          )
          .subscribe((data) => {
            this.data2 = data;
            setTimeout(() => {
              this.spreadsheetRef.activeSheet = 'Data';
            });
            this.loading = false;
          });

        break;
    }
  }
  async onStepChange(index: number) {
    console.log(index);
    this.currentStep = index;
    await this.loadStepData(index);
  }

  public handleSelectionRange(range: SelectionRange): void {
    console.log('Selected range:', range);
    this.model.dateRange = range;
  }
  fetchData() {
    // Mock fetching data
    this.data = 'Data fetched for ' + this.selectedLocation;
  }

  async nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      await this.loadStepData(this.currentStep);
      this.selections = [this.getStep1Data(), this.getStep2Data()];
    }
  }
  getStep1Data() {
    return {
      text:
        this.model?.selectedLocation?.name +
        ' ' +
        this.model.date.toDateString() 
    };
  }
  getStep2Data() {
    return {
      text: this.model?.selectedDataPrecessingLayout?.name
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
      await this.loadStepData(this.currentStep);
    }
  }
  onCheckedKeysChange(keys: string[]): void {
    const newChecked = new Set<string>(keys);

    // Loop through all root nodes (nodes without parentId)
    for (const root of this.treeNodes.filter(n => !n.parentId)) {
      const children = this.treeNodes.filter(n => n.parentId === root.id);
      const rootChecked = newChecked.has(root.checkKey);
  
      if (rootChecked) {
        // Root is checked → ensure all children are checked
        children.forEach(child => newChecked.add(child.checkKey));
      } else {
        // Root is not checked → ensure all children are unchecked
        children.forEach(child => newChecked.delete(child.checkKey));
      }
    }
  
    this.checkedKeys = Array.from(newChecked);
  }
}
