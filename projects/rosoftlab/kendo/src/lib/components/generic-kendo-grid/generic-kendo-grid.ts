import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationStart, RouterModule, UrlSegment } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
import {
  AddEvent,
  DataLayoutModeSettings,
  DataStateChangeEvent,
  KENDO_GRID,
  PageChangeEvent,
  RemoveEvent
} from '@progress/kendo-angular-grid';
import { IntlService } from '@progress/kendo-angular-intl';
import { KENDO_LABEL } from '@progress/kendo-angular-label';
import { KENDO_TOOLBAR } from '@progress/kendo-angular-toolbar';
import { pencilIcon, plusIcon, SVGIcon, trashIcon } from '@progress/kendo-svg-icons';
import { BaseService, BaseTableImplementation, DIALOG_SERVICE_TOKEN, LocalFileService } from '@rosoftlab/core';
import { FileService, ReactiveDictionary } from '@rosoftlab/rdict';
import 'reflect-metadata';
import { BehaviorSubject } from 'rxjs';
import { KendoTableTitle } from '../shared/kendo-table-title';
import { MaterialDialogService } from '../shared/material-dialog.service';
import { kendoToFilterRequest } from '../shared/rdict-kendo';
@Component({
  selector: 'rsl-kendo-generic-table',
  templateUrl: './generic-kendo-grid.html',
  styleUrls: ['./generic-kendo-grid.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    KENDO_GRID,
    KENDO_TOOLBAR,
    KENDO_LABEL,
    KENDO_BUTTONS,
    KENDO_DIALOG,
    KendoTableTitle
  ],
  providers: [{ provide: DIALOG_SERVICE_TOKEN, useClass: MaterialDialogService }]
})
export class GenericKendoTableComponent extends BaseTableImplementation<any, AddEvent, RemoveEvent> implements OnInit {
  protected localFileService = inject(LocalFileService);
  data: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 30;
  // Icons and local state
  public svgEdit: SVGIcon = pencilIcon;
  public svgDelete: SVGIcon = trashIcon;
  public svgAdd: SVGIcon = plusIcon;

  dataSource: any[] = [];
  tableRdict!: ReactiveDictionary;
  parentDict!: ReactiveDictionary;

  columns: any[] = [];
  allColumns: any[] = [];
  referenceData = new Map<string, Map<string, any>>();
  displayedColumns: string[] = [];

  public state: any = { skip: 0, take: 30 };
  private stateChange = new BehaviorSubject<any>(this.state);
  private isRdict: Boolean = false;
  private rdict: ReactiveDictionary;
  public gridDataLayout: DataLayoutModeSettings;
  constructor(
    private intl: IntlService,
    private fileService: FileService
  ) {
    super(); // Required to initialize the base class services
    this.setGridDataLayout(window.innerWidth);
  }

  override async ngOnInit() {
    super.ngOnInit(); // Handles shared URL parsing and Input setup
    const service = this.dataService as unknown; // Cast to unknown first
    this.isRdict = false;
    if (service instanceof BaseService) {
      this.initStandard();
    } else if (service instanceof ReactiveDictionary) {
      this.rdict = service as ReactiveDictionary;
      await this.initRdict();
    }
  }
  private initStandard() {
    this.getListLayout();
    this.loadData();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    const width = (event.target as Window).innerWidth;
    // this.setShowText(width);
    this.setGridDataLayout(width);
  }
  private setGridDataLayout(width: number): void {
    if (width <= 500) {
      this.gridDataLayout = { mode: 'stacked', stackedCols: 1 };
    } else if (width <= 768) {
      this.gridDataLayout = { mode: 'stacked', stackedCols: 3 };
    } else {
      this.gridDataLayout = { mode: 'columns' };
    }
  }
  // --- BaseTableImplementation Contract ---

  override loadData(): void {
    if (this.isRdict) {
      this.loadDataRdict();
    } else {
      this.loadDataStandard();
    }
  }
  loadDataStandard(): void {
    const request = kendoToFilterRequest(this.state);
    this.dataService.getAll(request.page, request.page_size, request.sorts, request.filters, this.customInclude).subscribe({
      next: (view) => (this.dataSource = view.getModels()),
      error: (err) => console.error('Error:', err.message)
    });
  }

  public override editHandler(args: AddEvent): void {
    this.edit(args.dataItem);
  }

  public override removeHandler(args: RemoveEvent): void {
    this.delete(args.dataItem); // Calls base class delete logic
  }
  override performDelete(id: any): void {
    //TODO
    if (this.isRdict) {
      this.performDeleteRdict(id);
    } else {
      this.performDeleteStandard(id);
    }
  }

  private performDeleteStandard(id: any): void {
    this.dataService.delete(id).subscribe({
      next: (result) => {
        const index = this.dataSource.findIndex((item: any) => item.oid === id);
        if (index > -1) {
          this.dataSource.splice(index, 1);
        }
      }
    });
  }

  protected override edit(dataItem: any, column?: any): void {
    if (column?.type === 'file') {
      const fileId = dataItem[column.file_id_property];
      const fileName = dataItem[column.propertyName];
      this.fileService.downloadFile(fileId).subscribe({
        next: (evt: any) => {
          if (evt.type === 'response') {
            const url = URL.createObjectURL(evt.file);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
          }
        },
        error: (err) => console.error('Download failed', err)
      });
    } else {
      super.edit(dataItem, column); // Use base routing logic
    }
  }

  // --- Layout and Formatting ---
  getListLayout() {
    if (this.isRdict) {
      this.getListLayoutRdict();
    } else {
      this.getListLayoutStanderd();
    }
  }
  getListLayoutStanderd() {
    if (!this.model) return;
    const layoutSource$ = this.fileLayout
      ? this.localFileService.getJsonData(this.fileLayout)
      : this.rdict.get$('config.models.' + this.model + '.tableLayout');

    layoutSource$.subscribe({
      next: (value) => {
        const layout = this.fileLayout ? value.find((item: any) => item.model === this.model) : value;
        this.setLayout(this.fileLayout ? layout?.tableLayout : layout);
      },
      error: (err) => console.error('Error loading layout:', err.message)
    });
  }

  private setLayout(layout: any) {
    if (!layout) return;
    this.title = this.translate.instant(layout['title']);
    this.allColumns = layout['columns'].map((item: any) => {
      if (!item.isTranslated) {
        item.name = this.translate.instant(item.translateKey);
        item.isTranslated = true;
        item.isEditLink = this.editColumn === item.propertyName;
        if (!item.type) item.type = 'property';
      }
      return item;
    });
    if (this.isRdict) {
      const referenceColumns = this.allColumns.filter((item) => item.reference);
      referenceColumns.forEach((item) => {
        this.rdict.getArray$(item.reference).subscribe((value) => {
          if (value) this.referenceData.set(item.reference, this.arrayToMap(value, item.referenceKey));
        });
      });
    } else {
      // Load reference data for standard services
      //TODO
    }

    this.allColumns.sort((a, b) => a.order - b.order);
    this.displayedColumns = this.allColumns.map((x) => x.propertyName);
  }

  private arrayToMap<T>(array: T[], keyProperty: keyof T): Map<string, T> {
    const map = new Map<string, T>();
    array.forEach((item) => map.set(String(item[keyProperty]), item));
    return map;
  }

  public getCellValue(item: any, column: any): any {
    if (!item || typeof item !== 'object') return null;
    if (column.type === 'reference') {
      const getNested = (obj: any, path: string) => path.split('.').reduce((acc, key) => acc?.[key], obj);
      const propVal = getNested(item, column.propertyName);
      const refVal = this.referenceData.get(column.reference)?.get(String(propVal))?.[column.referenceProperty] ?? propVal;
      return this.formatValue(refVal, column.format);
    }
    return this.formatValue(item[column.propertyName], column.format);
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.loadData();
  }

  public pageChange(state: PageChangeEvent): void {
    this.stateChange.next(state);
  }

  public formatValue(value: any, format?: string): any {
    if (value === null || value === undefined || !format) return value ?? '';
    const inner = this.extractFormat(format);
    if (this.looksLikeDateFormat(inner)) {
      const d = value instanceof Date ? value : new Date(value);
      return isNaN(d.getTime()) ? value : this.intl.formatDate(d, inner);
    }
    const num = typeof value === 'number' ? value : Number(value);
    return !Number.isNaN(num) ? this.intl.formatNumber(num, inner) : value;
  }

  private extractFormat(fmt: string): string {
    const m = fmt.match(/^\{0:([^}]+)\}$/);
    return m ? m[1] : fmt;
  }

  private looksLikeDateFormat(f: string): boolean {
    return /d|M|y|H|h|m|s|E|a/.test(f) && !/^[cnp]/i.test(f);
  }

  public inferFilterType(col: any): 'date' | 'numeric' | 'boolean' | 'text' {
    if (!col) return 'text';
    const f = this.extractFormat(col.format || '');
    if (this.looksLikeDateFormat(f)) return 'date';
    if (/^(n\d*|c|p\d*|n)$/i.test(f)) return 'numeric';
    return col.type === 'boolean' ? 'boolean' : 'text';
  }

  // --- Rdict Data Handling Logic ---
  private async initRdict() {
    this.isRdict = true;
    const urlTree = this.router.url.split('?')[0];
    const currentUrlSegments: UrlSegment[] = urlTree
      .split('/')
      .filter((segment) => segment !== '')
      .map((segment) => new UrlSegment(segment, {}));

    this.basePath = currentUrlSegments.map((segment) => segment.path).join('/');
    const filteredSegments = currentUrlSegments.filter((segment) => segment.path !== '');
    this.dictPath = filteredSegments.map((segment) => segment.path).join('.');
    this.model = filteredSegments.length > 0 ? filteredSegments[filteredSegments.length - 1].path : ''; // Default to empty string if no valid segments
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Navigation to another page is about to occur
        this.data = [];
        this.pageIndex = 1;
        // Perform actions or update component as needed
      }
    });
    if (this.useView) {
      if (this.defaultSort) {
        this.state.sort = this.defaultSort;
      }
      await this.getParentDict();
    }
    this.getListLayout();
    this.loadData();
  }
  private async getParentDict() {
    const lastDotIndex = this.dictPath!.lastIndexOf('.');
    const parentPath = lastDotIndex !== -1 ? this.dictPath!.substring(0, lastDotIndex) : this.dictPath!;
    this.parentDict = await this.rdict.asyncGet(parentPath);
  }
  getListLayoutRdict() {
    if (!this.model) return;
    const layoutSource$ = this.fileLayout
      ? this.localFileService.getJsonData(this.fileLayout)
      : this.rdict.get$('config.models.' + this.model + '.tableLayout');

    layoutSource$.subscribe({
      next: (value) => {
        const layout = this.fileLayout ? value.find((item: any) => item.model === this.model) : value;
        this.setLayout(this.fileLayout ? layout?.tableLayout : layout);
      },
      error: (err) => console.error('Error loading layout:', err.message)
    });
  }
  loadDataRdict(): void {
    if (this.useView) {
      this.loadDataViewRdict();
      return;
    }
    this.rdict.get$(this.dictPath!).subscribe({
      next: (rdictData) => {
        this.tableRdict = rdictData;
        this.tableRdict.onChange$().subscribe((changes) => this.onChangeEventRdict(changes));
        this.tableRdict.onDelete$().subscribe((changes) => this.ondDeleteEventRdict(changes));
        this.rdict.getArray$(this.dictPath!, this.tableRdict).subscribe({
          next: (value) => (this.dataSource = value),
          error: (err) => console.error('Error:', err.message)
        });
      },
      error: (err) => console.error('Error:', err.message)
    });
  }
  private loadDataViewRdict() {
    const request = kendoToFilterRequest(this.state);
    this.parentDict.getFilteredView(this.model!, request).subscribe({
      next: (view) => (this.dataSource = view)
    });
  }
  ondDeleteEventRdict(changes: any) {
    if (changes?.key) {
      const index = this.dataSource.findIndex((item: any) => item.oid === changes.key);
      if (index > -1) {
        this.dataSource.splice(index, 1);
      }
    }
  }
  onChangeEventRdict(changes: any) {
    if (!changes) return;
    const key = changes?.key as string;
    const value = changes?.value;

    if (key === 'transactions') {
      for (const [tKey, tValue] of Object.entries(value)) {
        const index = this.dataSource.findIndex((item: any) => item.oid === tKey);
        if (index > -1) {
          this.dataSource[index] = tValue;
        } else {
          this.dataSource.push(tValue);
        }
      }
    } else if (key && value) {
      const index = this.dataSource.findIndex((item: any) => item.oid === key);
      if (index > -1) {
        this.dataSource[index] = value.getPlainObject();
      } else {
        this.tableRdict.get$(key).subscribe((val) => {
          this.dataSource.push(val.getPlainObject());
        });
      }
    }
  }
  private performDeleteRdict(id: any): void {
    this.tableRdict.delete$(id).subscribe({
      next: (result) => {
        this.dataSource.splice(id, 1);
      }
    });
  }
}
