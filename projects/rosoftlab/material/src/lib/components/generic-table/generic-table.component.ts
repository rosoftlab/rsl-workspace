import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BaseQueryData, BaseService, CellTextAlign, GridLayoutFormat, Rule } from '@rosoftlab/core';
import * as jsonLogic from 'json-logic-js/logic.js';
import { Observable, Subject, Subscription, fromEvent, merge, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { GridLayoutModel, MaterialBaseModel } from '../../models';
import { GridLayoutService } from '../../services';
import { DialogServiceMaterial } from '../../services/dialog.service-implementation';
declare var $: any;

@Component({
    selector: 'rsl-generic-table',
    templateUrl: './generic-table.component.html',
    styleUrls: ['./generic-table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class GenericTableComponent<T extends MaterialBaseModel> implements OnInit, OnChanges, AfterViewInit {
  // displayedColumns = ['code']; //, 'name', 'cif', 'city', 'address', 'state', 'priceListName', 'delete'];
  @Input() modelType: new (...args: any[]) => T;
  @Input() baseService: BaseService<T>;
  @Input() gridLayoutService?: GridLayoutService<T>;
  @Input() editLink: string;
  @Input() defaultSort: string = null;
  @Input() defaultSortDirection: SortDirection = null;
  @Input() deleteDisableRule: Rule[];
  @Input() deletePropertyName: string = 'name';
  @Input() hasSearch: boolean;
  @Input() searchFields: string;
  @Input() defaultFilter: string;
  @Input() allowReorderItems: boolean;
  @Input() stickyColumns: string = null;
  @Input() editOnClick: boolean = false;
  @Input() editOnDblClick: boolean = false;
  @Input() allowEdit: boolean = true;
  @Input() popupEdit: boolean = false;
  @Input() customInclude: string = null;
  @Input() changeItemPosition: (prevItem: T, currentItem: T) => boolean;
  @Input() infiniteScroll: boolean = false;
  dataSource: MatTableDataSource<T> = new MatTableDataSource();
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  filterValue: string;
  private filterChanged: Subject<string> = new Subject<string>();
  private filterChangedSubscription: Subscription

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(ElementRef, { static: false }) filter: ElementRef;
  @ViewChild('table') table: MatTable<any>;
  @ViewChild('table', { read: ElementRef }) public matTableRef: ElementRef;
  resizeSubscription: any;

  selectedItem: T;
  gridLayout: GridLayoutModel[];
  @Output() selectedObject: EventEmitter<T> = new EventEmitter<T>();
  @Output() click: EventEmitter<{ propertyName: string, model: T }> = new EventEmitter<{ propertyName: string, model: T }>();
  @Output() editModel: EventEmitter<T> = new EventEmitter<T>();

  displayedColumns: string[];
  // ruleEngineService: RuleEngineService<T>;
  constructor(
    public dialogService: DialogServiceMaterial,
    public router: Router,
    private datePipe: DatePipe,
    private numberPipe: DecimalPipe,
    private percentPipe: PercentPipe,
    private renderer: Renderer2
  ) {
  }

  ngOnChanges() {
    if (this.baseService !== undefined || this.baseService !== null) {
      if (this.gridLayoutService != null) {
        this.gridLayout = this.gridLayoutService.getGridLayout();
      }
      else {
        const model = this.baseService.newModel();
        this.gridLayout = model.getGridLayout();
      }
      this.displayedColumns = [];
      if (this.allowReorderItems) {
        this.displayedColumns.push('position')
      }
      this.displayedColumns.push.apply(this.displayedColumns, this.gridLayout.map(x => x.propertyName));
      if (!this.editOnClick && !this.editOnDblClick && this.allowEdit) {
        this.displayedColumns.push('delete');
      }
    }
  }

  ngOnInit() {
    this.filterChangedSubscription = this.filterChanged
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(newText => {
        if (newText.length >= 3 || newText.length == 0) {
          this.filterValue = newText;

          this.paginator.pageIndex = 0;
          this.refreshForm();
        }
      });
    // this.getGridLayout();
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.paginator.pageSize = 15;
    if (this.defaultSort) {
      this.sort.active = this.defaultSort;
      if (this.defaultSortDirection) {
        this.sort.direction = this.defaultSortDirection;
      } else {
        this.sort.direction = 'asc';
      }
    }

    // this.dataSource.paginator = this.paginator;
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.getData();
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          if (data) {
            this.resultsLength = data.getMeta().meta.count;
            return data.getModels();
          } else {
            this.resultsLength = 0;
            return [];
          }
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return of([]);
        })
      ).subscribe(data => {
        // if (this.infiniteScroll) {
        //   let oldData = this.dataSource.data ?? null;
        //   // if (oldData.length === 0) {
        //   //   oldData = data;
        //   // } else {
        //     oldData=oldData.concat(data);
        //   // }
        //   this.dataSource.data = oldData;
        // }
        // else {
        this.dataSource.data = data;
        // }
      });
    // this.paginator.nextPage()
  }
  getData(): Observable<BaseQueryData<T>> {
    this.isLoadingResults = true;
    const pageIndex = (this.paginator.pageIndex || 0) + 1;
    const pageSize = this.paginator.pageSize || 20;
    const filters = [];

    let sorts = '';
    if (this.sort.active) {
      if (this.sort.direction === 'desc') {
        sorts = '-' + this.sort.active;
      } else {
        sorts = this.sort.active;
      }
    }
    if (this.hasSearch) {
      if (this.filterValue) {
        // const filtersArr = this.searchFields.split(",");
        // filtersArr.forEach(element => {
        //   filters.push(element + '@=*' + this.filterValue);
        // });
        const y = '(' + this.searchFields.replace(',', '|') + ')';
        filters.push(y + '@=*' + this.filterValue);
      }
    }
    if (this.defaultFilter) {
      filters.push(this.defaultFilter);
    }
    const filtersValue = filters.join(', ');
    return this.baseService.getAll(pageIndex, pageSize, sorts, filtersValue, this.customInclude);
  }

  refreshForm() {
    this.getData().subscribe(data => {
      if (data) {
        this.isLoadingResults = false;
        this.isRateLimitReached = false;
        this.resultsLength = data.getMeta().meta.count;
        this.dataSource.data = data.getModels();
      } else {
        this.isLoadingResults = false;
        this.isRateLimitReached = false;
        this.resultsLength = 0;
        this.dataSource.data = [];
      }
    });
  }


  highlight(element: any) {
    if (this.selectedItem) {
      this.selectedItem.highlighted = element.highlighted;
    }
    this.selectedItem = null;
    element.highlighted = !element.highlighted;
    if (element.highlighted) {
      this.selectedItem = element;
      this.selectedObject.emit(element);
    } else {
      this.selectedObject.emit(null);
    }
  }
  deleteObject(model: T) {
    const msg = 'Do you want to delete ' + model[this.deletePropertyName] + '?';
    this.dialogService.confirm(msg).subscribe((response: boolean) => {
      if (response) {
        this.baseService.delete(model.id).subscribe(() => {
          const tempData = [];
          this.selectedObject.emit(null);
          this.dataSource.data.map((item) => {
            if (item.id !== model.id) {
              tempData.push(item);
            }
          });
          this.dataSource.data = tempData;
        });
      }
    });
  }
  editObject(model: T) {
    if (!this.popupEdit) {
      const id = model.id;
      this.router.navigate([this.editLink, id]);
    } else {
      this.editModel.emit(model);
    }
  }
  getFlexStyle(column: GridLayoutModel) {
    if (column.width) {
      const style = column.grow + ' ' + column.shrink + ' ' + column.width + 'px';
      return style;
    }
    return null;
  }

  getCellTextAlign(column: GridLayoutModel) {
    return column.textAlign ?? CellTextAlign.left;
  }

  showPictureCell(column: GridLayoutModel): boolean {
    return (column?.formating ?? GridLayoutFormat.none) === GridLayoutFormat.picture;
  }

  deleteDisabled(model: T) {
    if (this.deleteDisableRule) {
      return this.evaluateRule(this.deleteDisableRule, model);
    } else {
      return false;
    }
  }
  cellClick(model: T, propertyName: string) {
    this.click.emit({ propertyName, model });
  }

  private evaluateRule(rules: Rule[], model: T): boolean {
    let result = true;
    rules.forEach(rule => {
      let jsonRule: any;
      if (typeof rule.rule === 'string') {
        jsonRule = JSON.parse(rule.rule);
      } else {
        jsonRule = rule.rule;
      }
      if (rule.parameters) {
        const data = '{' + rule.parameters.map((item: string) => {
          return '"' + item + '":"' + model[item] + '"';
        }).join(',') + '}';
        result = jsonLogic.apply(jsonRule, JSON.parse(data));
      } else {
        result = jsonLogic.apply(jsonRule);
      }
    });
    return result;
  }
  getCelValue(row: any, propertyName: string): any {
    if (!row)
      return "";
    // if (propertyName == 'kompetenzenStdev')
    //   console.log(propertyName);
    if (propertyName.indexOf('.') === -1) {
      var gridLayout = this.gridLayout.find(f => f.propertyName.indexOf(propertyName) > -1);
      return this.getFormatedValue(gridLayout, row[propertyName]);
    } else {
      const prop = propertyName.split('.')[0];
      const subProp = propertyName.replace(prop + '.', '');
      return this.getCelValue(row[prop], subProp);
    }
  }
  private getFormatedValue(gridLayout: GridLayoutModel, value: any) {

    if (gridLayout) {
      switch (gridLayout.formating) {
        case GridLayoutFormat.date:
          return this.datePipe.transform(value, gridLayout.format);
          break;
        case GridLayoutFormat.number:
          return this.numberPipe.transform(value, gridLayout.format);
        case GridLayoutFormat.percent:
          const valuePrc = value / 100;
          return this.percentPipe.transform(valuePrc, gridLayout.format);
        default:
          return value;
          break;
      }
    }
    return value;
  }
  applyFilter(event: Event) {
  }
  dropTable(event: CdkDragDrop<any>) {
    if (this.changeItemPosition) {
      const prevItem = this.dataSource.data[event.previousIndex];
      const currentItem = this.dataSource.data[event.currentIndex];

      if (this.changeItemPosition(prevItem, currentItem)) {
        const prevIndex = this.dataSource.data.findIndex((d) => d === event.item.data);
        moveItemInArray(this.dataSource.data, prevIndex, event.currentIndex);
        this.table.renderRows();
      }
    }
  }
  isColumnSticky(name: string): boolean {
    if (this.stickyColumns) {
      const filtersArr = this.stickyColumns.split(",");
      return filtersArr.findIndex(f => f == name) !== -1;
    }
    return false;
  }
  updateElement(model: T) {
    //Find if element exist
    var currentElement = this.dataSource.data.find(f => f.id === model.id);
    if (currentElement !== null) {
      const index = this.dataSource.data.indexOf(currentElement);
      this.dataSource.data[index] = model;
    } else {
      this.dataSource.data.push(model);
    }
    const newData = [...this.dataSource.data];
    this.dataSource.data = newData;
    this.dataSource._updateChangeSubscription();
  }
  public ngAfterViewInit(): void {
    fromEvent(this.matTableRef.nativeElement, 'scroll')
      .pipe(debounceTime(700))
      .subscribe((e: any) => this.onTableScroll(e));
  }
  onTableScroll(e) {
    const tableViewHeight = e.target.offsetHeight // viewport: ~500px
    const tableScrollHeight = e.target.scrollHeight // length of all table
    const scrollLocation = e.target.scrollTop; // how far user scrolled

    // If the user has scrolled within 200px of the bottom, add more data
    const scrollThreshold = 200;

    const scrollUpLimit = scrollThreshold;
    if (scrollLocation < scrollUpLimit && this.paginator.pageIndex > 0) {
      // this.firstPage--;
      console.log(`onTableScroll() UP: firstPage decreased to ${this.paginator.pageIndex}. Now fetching data...`);
      // this.fetchData();

      this.scrollTo(tableScrollHeight / 2 - 2 * tableViewHeight);
    }

    const scrollDownLimit = tableScrollHeight - tableViewHeight - scrollThreshold;
    if (scrollLocation > scrollDownLimit && this.paginator.pageIndex < this.paginator.getNumberOfPages()) {
      // this.firstPage++;
      console.log(`onTableScroll(): firstPage increased to ${this.paginator.pageIndex}. Now fetching data...`);
      this.paginator.nextPage();
      // this.scrollTo(tableScrollHeight / 2 + tableViewHeight);
    }
  }
  private scrollTo(position: number): void {
    this.renderer.setProperty(this.matTableRef.nativeElement, 'scrollTop', position);
  }
  getCellClass(model: T, property: string) {
    return model.getCellClass(property);
  }
}
