import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationStart, Router, RouterModule, UrlSegment } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// import { Rule } from '@rosoftlab/core';
import { CommonModule } from '@angular/common';
import { AddEvent, KENDO_GRID, RemoveEvent } from '@progress/kendo-angular-grid';
import { KENDO_LABEL } from '@progress/kendo-angular-label';
import { KENDO_TOOLBAR } from '@progress/kendo-angular-toolbar';
// import { ColumnMode, SelectionType, SortDirection } from '@swimlane/ngx-datatable';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
import { pencilIcon, plusIcon, SVGIcon, trashIcon } from '@progress/kendo-svg-icons';
import { LocalFileService } from '@rosoftlab/core';
import { ReactiveDictionary } from '../../reactive-dictionary';
import { MaterialDialogService } from '../../services/material-dialog.service';
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
  @Input() showSerach: boolean;
  @Input() searchFields: string;
  @Input() customInclude: string;
  @Input() defaultSort: string;
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
  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected translate: TranslateService,
    protected injector: Injector,
    protected localFileService: LocalFileService,
    protected rdict: ReactiveDictionary,
    protected dialogService: MaterialDialogService
  ) {}
  async ngOnInit() {
    this.setValueFromSnapshot(this, this.route.snapshot, 'model', null);
    this.setValueFromSnapshot(this, this.route.snapshot, 'dictPath', null);

    this.setValueFromSnapshot(this, this.route.snapshot, 'showSerach', false);
    this.setValueFromSnapshot(this, this.route.snapshot, 'searchFields', null);
    this.setValueFromSnapshot(this, this.route.snapshot, 'customInclude', null);
    this.setValueFromSnapshot(this, this.route.snapshot, 'defaultSort', null);
    this.setValueFromSnapshot(this, this.route.snapshot, 'defaultSortDirection', '');
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
    this.getListLayout();
    this.loadData();
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
  async loadData() {
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
  onChangeEvent(changes: any) {
    if (changes) {
      const key = changes?.key as string;
      const value = changes?.value;
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
      //Get reference columns
      const referenceColumns = this.allColumns.filter((item) => item.reference !== undefined && item.reference !== null);
      if (referenceColumns.length > 0) {
        referenceColumns.forEach((item) => {
          this.rdict.getArray$(item.reference).subscribe({
            next: (value) => {
              if (value) {
                // console.log('Reference data:', value);
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
  public edit(dataItem: any): void {
    this.router.navigate([`${this.basePath}/edit/${dataItem.__idx}`]);
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
      const value =
        this.referenceData.get(column.reference)?.get(item[column.propertyName])?.[column.referenceProperty] ?? item[column.propertyName];
      return value;
    } else {
      return item[column.propertyName];
    }
  }
}
