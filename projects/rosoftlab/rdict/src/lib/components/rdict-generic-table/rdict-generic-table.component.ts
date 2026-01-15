import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationStart, Router, RouterModule, UrlSegment } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// import { Rule } from '@rosoftlab/core';
import { CommonModule } from '@angular/common';
import { AddEvent, DataStateChangeEvent, KENDO_GRID, PageChangeEvent, RemoveEvent } from '@progress/kendo-angular-grid';
import { KENDO_LABEL } from '@progress/kendo-angular-label';
import { KENDO_TOOLBAR } from '@progress/kendo-angular-toolbar';
// import { ColumnMode, SelectionType, SortDirection } from '@swimlane/ngx-datatable';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
import { IntlService } from '@progress/kendo-angular-intl';
import { CompositeFilterDescriptor, State } from '@progress/kendo-data-query';
import { pencilIcon, plusIcon, SVGIcon, trashIcon } from '@progress/kendo-svg-icons';
import { LocalFileService } from '@rosoftlab/core';
import { BehaviorSubject } from 'rxjs';
import { ReactiveDictionary } from '../../reactive-dictionary';
import { FileService } from '../../services/file.service';
import { MaterialDialogService } from '../../services/material-dialog.service';
import { kendoToFilterRequest } from './rdict-kendo';
import { RdictTableTitle } from './rdict-table-title';
declare var $: any;

@Component({
  selector: 'rsl-rdict-generic-table',
  templateUrl: './rdict-generic-table.component.html',
  styleUrls: ['./rdict-generic-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    RouterModule,
    // MatPaginatorModule,
    // MatTableModule,
    TranslateModule,
    KENDO_GRID,
    KENDO_TOOLBAR,
    KENDO_LABEL,
    KENDO_BUTTONS,
    KENDO_DIALOG,
    RdictTableTitle
  ],
  providers: []
})
export class GenericRdictTableComponent implements OnInit {
  dataSource: unknown[]; //MatTableDataSource<any> = new MatTableDataSource();
  public title: string;
  model: string;
  @Input() showSearch: boolean;
  @Input() searchFields: string;
  @Input() customInclude: string;
  @Input() defaultSort: any;
  // @Input() defaultSortDirection: SortDirection;
  @Input() deletePropertyName: string;
  @Input() defaultFilter: string;
  @Input() showHeader: boolean;
  // @Input() deleteDisableRule: Rule[];
  @Input() hasAdd: boolean;
  @Input() canDelete: boolean;
  @Input() canEdit: boolean;
  @Input() editOnClick: boolean = false;
  @Input() editOnDblClick: boolean = false;
  fileLayout: string;
  data: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 30;

  basePath: string;
  dictPath: string;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(ElementRef, { static: false }) filter: ElementRef;
  // @ViewChild('table') table: MatTable<any>;
  // @ViewChild('table', { read: ElementRef }) public matTableRef: ElementRef;

  @Output() selectedObject: EventEmitter<any> = new EventEmitter<any>();
  @Output() click: EventEmitter<{ propertyName: string; model: any }> = new EventEmitter<{ propertyName: string; model: any }>();
  @Output() editModel: EventEmitter<any> = new EventEmitter<any>();

  columns = [];
  tableLayout = {};
  allColumns = [];
  referenceColumns = [];
  referenceData = new Map<string, Map<string, any>>();
  displayedColumns: string[];
  // ColumnMode = ColumnMode;
  // SelectionType = SelectionType;

  readonly headerHeight = 50;
  readonly rowHeight = 50;
  isLoading: boolean;
  filterValue: string;
  oldOffsetY: number;
  hasSearch: false;
  selectedItem: any;
  public svgEdit: SVGIcon = pencilIcon;
  public svgDelete: SVGIcon = trashIcon;
  public svgAdd: SVGIcon = plusIcon;
  tableRdict: ReactiveDictionary;
  editColumn: string | null;

  useView: boolean;
  pageable: boolean;
  pageSizes: number[];
  public state: State = {
    skip: 0,
    take: 30
  };
  private stateChange = new BehaviorSubject<State>(this.state);
  parentDict: ReactiveDictionary;
  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected translate: TranslateService,
    protected injector: Injector,
    protected localFileService: LocalFileService,
    protected rdict: ReactiveDictionary,
    protected dialogService: MaterialDialogService,
    private intl: IntlService,
    private fileService: FileService
  ) {}
  async ngOnInit() {
    this.setValueFromSnapshot(this, this.route.snapshot, 'model', null);
    this.setValueFromSnapshot(this, this.route.snapshot, 'dictPath', null);

    this.setValueFromSnapshot(this, this.route.snapshot, 'showSearch', false);
    this.setValueFromSnapshot(this, this.route.snapshot, 'searchFields', null);
    this.setValueFromSnapshot(this, this.route.snapshot, 'customInclude', null);
    this.setValueFromSnapshot(this, this.route.snapshot, 'defaultSort', null);
    this.setValueFromSnapshot(this, this.route.snapshot, 'defaultSortDirection', null);
    this.setValueFromSnapshot(this, this.route.snapshot, 'deletePropertyName', 'name');
    this.setValueFromSnapshot(this, this.route.snapshot, 'defaultFilter', null);
    this.setValueFromSnapshot(this, this.route.snapshot, 'showHeader', true);
    this.setValueFromSnapshot(this, this.route.snapshot, 'deleteDisableRule', null);
    this.setValueFromSnapshot(this, this.route.snapshot, 'hasAdd', true);
    this.setValueFromSnapshot(this, this.route.snapshot, 'canDelete', true);
    this.setValueFromSnapshot(this, this.route.snapshot, 'canEdit', true);
    this.setValueFromSnapshot(this, this.route.snapshot, 'editOnClick', false);
    this.setValueFromSnapshot(this, this.route.snapshot, 'editOnDblClick', false);
    this.setValueFromSnapshot(this, this.route.snapshot, 'editColumn', null);
    this.setValueFromSnapshot(this, this.route.snapshot, 'fileLayout', '');

    this.setValueFromSnapshot(this, this.route.snapshot, 'useView', false);
    this.setValueFromSnapshot(this, this.route.snapshot, 'pageable', false);
    this.setValueFromSnapshot(this, this.route.snapshot, 'pageSizes ', [10, 20, 30, 50, 100]);

    const currentUrlSegments: UrlSegment[] = this.router.url.split('/').map((segment) => new UrlSegment(segment, {}));
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
  async getParentDict() {
    const lastDotIndex = this.dictPath.lastIndexOf('.');
    const parentPath = lastDotIndex !== -1 ? this.dictPath.substring(0, lastDotIndex) : this.dictPath;
    this.parentDict = await this.rdict.asyncGet(parentPath);
  }
  setValueFromSnapshot<T>(component: any, snapshot: ActivatedRouteSnapshot, key: string, defaultValue: T): void {
    if (component[key] === undefined) {
      let dataFromSnapshot = snapshot.data[key];
      if (dataFromSnapshot === null || dataFromSnapshot === undefined) {
        dataFromSnapshot = snapshot.params[key];
      }
      component[key] = dataFromSnapshot !== undefined ? dataFromSnapshot : defaultValue;
    }
  }
  loadData() {
    if (this.useView) {
      this.loadDataView();
      return;
    }
    this.rdict.get$(this.dictPath).subscribe({
      next: (rdictData) => {
        this.tableRdict = rdictData;
        this.tableRdict.onChange$().subscribe({
          next: (changes) => {
            console.log('Changes detected grid:', changes);
            this.onChangeEvent(changes);
          }
        });
        this.tableRdict.onDelete$().subscribe({
          next: (changes) => {
            console.log('Delete detected grid:', changes);
            this.ondDeleteEvent(changes);
          }
        });
        this.rdict.getArray$(this.dictPath, this.tableRdict).subscribe({
          next: (value) => {
            this.dataSource = value;
          },
          error: (err) => console.error('Error:', err.message)
        });
      },
      error: (err) => console.error('Error:', err.message)
    });
  }
  loadDataView() {
    //Get the parent path

    // const request = {
    //   filters: '',
    //   sorts: { import_date: 'desc' },
    //   page: Math.floor(this.state.skip / this.state.take) + 1,
    //   page_size: this.state.take
    // };
    const request = kendoToFilterRequest(this.state);
    this.parentDict.getFilteredView(this.model, request).subscribe({
      next: (view) => {
        // console.log('View:', view);
        this.dataSource = view;
      }
    });
  }
  onChangeEvent(changes: any) {
    if (changes) {
      const key = changes?.key as string;
      const value = changes?.value;
      if (key == 'transactions') {
        //I have receibed transactions update
        //Update all transactions in the table
        const transactions = value;
        for (const [key, value] of Object.entries(transactions)) {
          const index = this.dataSource.findIndex((item: any) => item.__idx === key);
          if (index > -1) {
            this.dataSource[index] = value;
          } else {
            //get the object from rdict
            // this.tableRdict.get$(key).subscribe({
            //   next: (value) => {
            // var dd = value.getPlainObject();
            this.dataSource.push(value);
            //   }
            // });
          }
        }
      } else {
        if (key && value) {
          const index = this.dataSource.findIndex((item: any) => item.__idx === key);
          if (index > -1) {
            this.dataSource[index] = value;
          } else {
            //get the object from rdict
            this.tableRdict.get$(key).subscribe({
              next: (value) => {
                var dd = value.getPlainObject();
                this.dataSource.push(dd);
              }
            });
          }
        }
      }
    }
  }
  ondDeleteEvent(changes: any) {
    if (changes) {
      const key = changes?.key as string;
      if (key) {
        const index = this.dataSource.findIndex((item: any) => item.__idx === key);
        if (index > -1) {
          this.dataSource.splice(index, 1);
        }
        // this.tableRdict.delete(key)
      }
    }
  }
  getListLayout() {
    if (this.model) {
      if (this.fileLayout) {
        //load from file
        this.localFileService.getJsonData(this.fileLayout).subscribe({
          next: (value) => {
            if (value) {
              const layout = value.find((item) => item.model === this.model);
              this.setLayout(layout?.tableLayout);
            }
          },
          error: (err) => console.error('Error:', err.message)
        });
      }
      //Use rdict layout
      else
        this.rdict.get$('config.models.' + this.model + '.tableLayout').subscribe({
          next: (value) => {
            this.setLayout(value);
          },
          error: (err) => console.error('Error:', err.message)
        });
    }
  }

  private setLayout(layout: any) {
    if (layout) {
      this.tableLayout = layout;
      this.title = this.translate.instant(this.tableLayout['title']);
      this.allColumns = this.tableLayout['columns'].map((item) => {
        if (!item.isTranslated) {
          item.name = this.translate.instant(item.translateKey);
          item.isTranslated = true;
          item.isEditLink = false;
          if (this.editColumn && this.editColumn === item.propertyName) {
            item.isEditLink = true;
          }
          if (!item.type) {
            item.type = 'property';
          }
        }
        return item;
      });
      // console.log('All columns:', this.allColumns);
      //Get reference columns
      const referenceColumns = this.allColumns.filter((item) => item.reference !== undefined && item.reference !== null);
      if (referenceColumns.length > 0) {
        referenceColumns.forEach((item) => {
          this.rdict.getArray$(item.reference).subscribe({
            next: (value) => {
              if (value) {
                // console.log('Reference data:', value);
                // value=value.map((o: any) => ({ ...o, oid: Number(o.oid) }))
                this.referenceData.set(item.reference, this.arrayToMap(value, item.referenceKey));
              }
            },
            error: (err) => console.error('Error:', err.message)
          });
        });
      }
      this.columns = [];

      this.allColumns.sort((a, b) => a.order - b.order);
      this.displayedColumns = [];
      this.displayedColumns.push.apply(
        this.displayedColumns,
        this.allColumns.map((x) => x.propertyName)
      );
    }
  }
  arrayToMap<T>(array: T[], keyProperty: keyof T): Map<string, T> {
    const map = new Map<string, T>();
    for (const item of array) {
      const key = String(item[keyProperty]); // ensure it's a string
      map.set(key, item);
    }
    return map;
  }
  public addHandler(): void {
    this.router.navigate([`${this.basePath}/add`]);
  }
  public editHandler(args: AddEvent): void {
    this.edit(args.dataItem);
    // this.editDataItem = args.dataItem;
    // this.isNew = false;
  }
  public edit(dataItem: any, column?: any): void {
    if (column.type == 'file') {
      const fileId = dataItem[column.file_id_property];
      const file_name = dataItem[column.propertyName];
      this.fileService.downloadFile(fileId).subscribe({
        next: (evt) => {
          if (evt.type === 'progress') {
            // optional: show progress
            // this.progress = evt.total ? Math.round(100 * evt.loaded / evt.total) : null;
            return;
          }

          // evt.type === 'response'
          const file = evt.file;

          const url = URL.createObjectURL(file);
          const a = document.createElement('a');
          a.href = url;
          a.download = file_name; // suggested filename
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();

          a.remove();
          URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Download failed', err);
        }
      });
    } else {
      this.router.navigate([`${this.basePath}/edit/${dataItem.__idx}`]);
    }
  }
  public removeHandler(args: RemoveEvent): void {
    this.dialogService.confirmDelete().subscribe({
      next: (result) => {
        if (result) {
          this.tableRdict.delete$(args.dataItem.__idx).subscribe({
            next: (result) => {
              this.dataSource.splice(args.rowIndex, 1);
            }
          });
        }
      }
    });
    // this.editService.remove(args.dataItem);
  }
  public getCellValue(item: any, column: any): any {
    if (typeof item !== 'object' || item === null) {
      return null; // or `undefined` or some fallback
    }
    if (column.type == 'reference') {
      const getNestedValue = (obj: any, path: string) => path.split('.').reduce((acc, key) => acc?.[key], obj);
      const propertyValue = getNestedValue(item, column.propertyName);
      const value = this.referenceData.get(column.reference)?.get(String(propertyValue))?.[column.referenceProperty] ?? propertyValue;
      return this.formatValue(value, column.format);
      return value;
    } else {
      return this.formatValue(item[column.propertyName], column.format);
    }
  }
  public filterChange(filter: CompositeFilterDescriptor): void {
    // console.log(filter);
    // this.loadData();
  }
  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;

    this.loadData();
  }
  public pageChange(state: PageChangeEvent): void {
    console.log('State:', state);
    this.stateChange.next(state);
  }

  public formatValue(value: any, format?: string): any {
    if (value === null || value === undefined || !format) {
      return value ?? '';
    }

    // Accept both "{0:...}" and plain "..." patterns
    const inner = this.extractFormat(format);

    // Heuristics: date vs number
    if (this.looksLikeDateFormat(inner)) {
      const d = value instanceof Date ? value : new Date(value);
      return isNaN(d.getTime()) ? value : this.intl.formatDate(d, inner);
    }

    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isNaN(num)) {
      // supports "n", "n2", "c", "p", etc. and custom patterns
      return this.intl.formatNumber(num, inner);
    }

    // Fallback: return as-is if not a date/number
    return value;
  }

  private extractFormat(fmt: string): string {
    const m = fmt.match(/^\{0:([^}]+)\}$/);
    return m ? m[1] : fmt;
  }

  private looksLikeDateFormat(f: string): boolean {
    // crude but effective: typical date tokens
    return /d|M|y|H|h|m|s|E|a/.test(f) && !/^[cnp]/i.test(f);
  }
  public inferFilterType(col: any): 'date' | 'numeric' | 'boolean' | 'text' {
    if (!col) return 'text';
    const f = this.extractFormat(col.format || '');
    if (this.looksLikeDateFormat(f)) return 'date';
    if (/^(n\d*|c|p\d*|n)$/i.test(f)) return 'numeric'; // Kendo number patterns
    if (col.type === 'boolean') return 'boolean';
    return 'text';
  }
}
