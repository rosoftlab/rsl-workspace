import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationStart, Router, RouterModule, UrlSegment } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// import { Rule } from '@rosoftlab/core';
import { CommonModule } from '@angular/common';
import { KENDO_GRID } from '@progress/kendo-angular-grid';
import { KENDO_LABEL } from '@progress/kendo-angular-label';
import { KENDO_TOOLBAR } from '@progress/kendo-angular-toolbar';
// import { ColumnMode, SelectionType, SortDirection } from '@swimlane/ngx-datatable';
import { ReactiveDictionary } from '../../reactive-dictionary';
import { WsAuthService } from '../../services';
import { SocketService } from '../../services/socket.service';
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
        RdictTableTitle
    ],
    providers: []
})
export class GenericRdictTableComponent implements OnInit {
  dataSource: unknown[] //MatTableDataSource<any> = new MatTableDataSource();
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
  data: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 30

  basePath: string;
  dictPath: string;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(ElementRef, { static: false }) filter: ElementRef;
  // @ViewChild('table') table: MatTable<any>;
  // @ViewChild('table', { read: ElementRef }) public matTableRef: ElementRef;


  @Output() selectedObject: EventEmitter<any> = new EventEmitter<any>();
  @Output() click: EventEmitter<{ propertyName: string, model: any }> = new EventEmitter<{ propertyName: string, model: any }>();
  @Output() editModel: EventEmitter<any> = new EventEmitter<any>();

  columns = [];
  tableLayout = {};
  allColumns = [];
  displayedColumns: string[];
  // ColumnMode = ColumnMode;
  // SelectionType = SelectionType;

  readonly headerHeight = 50;
  readonly rowHeight = 50;
  isLoading: boolean;
  filterValue: string;
  oldOffsetY: number;
  hasSearch: false
  rdict: ReactiveDictionary | undefined;
  selectedItem: any;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public translate: TranslateService,
    private injector: Injector,
    private socketService: SocketService,
    private wsAuthService: WsAuthService,
    private el: ElementRef) {
  }
  async ngOnInit() {
    this.setValueFromSnapshot(this, this.route.snapshot, 'model', "");
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

    const currentUrlSegments: UrlSegment[] = this.router.url.split('/').map(segment => new UrlSegment(segment, {}));
    this.basePath = currentUrlSegments.map(segment => segment.path).join('/');
    const filteredSegments = currentUrlSegments.filter(segment => segment.path !== '');
    this.dictPath = filteredSegments.map(segment => segment.path).join('.');
    this.model = filteredSegments.length > 0 ? filteredSegments[filteredSegments.length - 1].path : ''; // Default to empty string if no valid segments
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Navigation to another page is about to occur
        this.data = [];
        this.pageIndex = 1
        // Perform actions or update component as needed
      }
    });
    this.rdict = ReactiveDictionary.getInstance(this.socketService,this.wsAuthService.Token);
    if (this.rdict.size == 0)
      await this.rdict.asyncInit();
    await this.getListLayout()
    await this.loadData()
    // this.isLoading = true;
    // this.onScroll(0);
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
    var x = await this.rdict.getTable(this.dictPath)
    const result = x.map(dictionary => {
      // Convert Map to object and filter out __guid
      const filteredObject = {};
      for (const [key, value] of dictionary.entries()) {
        if (key !== '__guid') {
          filteredObject[key] = value;
        }
      }
      return filteredObject;
    });
    this.dataSource = result//new MatTableDataSource(result);
  }
  // async handleChange(event) {
  //   this.filterValue = event.target.value.toLowerCase();
  //   this.data = [];
  //   this.pageIndex = 1
  //   this.loadData();
  // }
  // loadData(event = null) {
  //   const filters = [];
  //   let sorts = '';
  //   this.isLoading = true;
  //   if (this.defaultSort) {
  //     if (this.defaultSortDirection === 'desc') {
  //       sorts = '-' + this.defaultSort;
  //     } else {
  //       sorts = this.defaultSort;
  //     }
  //   }
  //   if (this.showSerach) {
  //     if (this.filterValue) {
  //       const y = '(' + this.searchFields.replace(',', '|') + ')';
  //       filters.push(y + '@=*' + this.filterValue);
  //     }
  //   }
  //   if (this.defaultFilter) {
  //     filters.push(this.defaultFilter)
  //   }
  //   setTimeout(() => {
  //     const filtersValue = filters.join(', ');
  //     this.modelService.getAll(this.pageIndex, this.pageSize, sorts, filtersValue, this.customInclude).subscribe(
  //       (response: BaseQueryData<T>) => {
  //         if (this.pageIndex !== response.getMeta().meta.count) {
  //           this.pageIndex++
  //         } else {
  //           if (event) event.target.disabled = true;
  //         }
  //         // if (this.filterValue)
  //         //   this.data = response.getModels();
  //         // else
  //         const rows = [...this.data, ...response.getModels()];
  //         this.data = rows;
  //         // this.data = this.data.concat();

  //         if (event) event.target.complete();
  //         this.isLoading = false;
  //       })
  //   }, 700);
  // }
  // async handleRefresh(event) {
  //   this.pageIndex = 1
  //   this.data = [];
  //   this.loadData();
  //   event.target.complete();
  // }
  // onAdd() {
  //   console.log(this.basePath)
  //   this.router.navigate([this.basePath + '/add'])
  //   // this.navCtrl.navigateForward(this.basePath + '/add');
  // }
  // editModel(model: BaseModelFormly) {
  //   if (this.canEdit)
  //     this.router.navigate([this.basePath + '/edit/', model.id]);
  //   // this.navCtrl.navigateForward(this.basePath + '/edit/' + model.id);
  // }
  async getListLayout() {
    if (this.model) {
      this.tableLayout = await this.rdict.asyncGet("config.models." + this.model + ".tableLayout")
      if (this.tableLayout) {
        this.title = this.translate.instant(this.tableLayout["title"]);
        this.allColumns = this.tableLayout["columns"].map(item => {
          if (!item.isTranslated) {
            item.name = this.translate.instant(item.translateKey);
            item.isTranslated = true
          }
          return item;
        });
        this.columns = [];
        // this.allColumns = Reflect.getMetadata('IonicDataTableLayout', this.model).map((item: IonicDataTableLayoutConfig) => {
        //   if (!item.isTranslated) {
        //     item.name = this.translate.instant(item.name);
        //     item.isTranslated = true
        //   }
        //   return item;
        // });

        this.allColumns.sort((a, b) => a.order - b.order);

        // if (this.canDelete || this.canEdit) {
        //   this.allColumns.push({
        //     // cellTemplate: null,
        //     name: '',
        //     // cellClass: 'actions-cell',
        //     draggable: false,
        //     sortable: false,
        //     visible: true
        //     // width: 100,
        //     // maxWidth: 100,
        //     // minWidth: 100
        //   })
        // }
        // this.columns = this.allColumns.filter((item: IonicDataTableLayoutConfig) => item.visible);

        this.displayedColumns = [];
        // if (this.allowReorderItems) {
        //   this.displayedColumns.push('position')
        // }
        this.displayedColumns.push.apply(this.displayedColumns, this.allColumns.map(x => x.propertyName));

      }
    }

  }
  public addHandler(): void {
    console.log("add")
    this.router.navigate([this.basePath + '/add'])
    // this.editDataItem = new Product();
    // this.isNew = true;
  }

}
