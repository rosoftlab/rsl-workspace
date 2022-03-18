import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as jsonLogic from 'json-logic-js/logic.js';
import { merge, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { BaseQueryData } from '../../models/base-query-data';
import { BaseModel } from '../../models/base.model';
import { GridLayoutModel } from '../../models/grid-layout';
import { CellTextAlign, GridLayoutFormat } from '../../models/grid-layout-format.enum';
import { Rule } from '../../models/rule';
import { BaseService } from '../../services/base.service';
import { DialogService } from '../../services/dialog.service';
import { GridLayoutService } from '../../services/grid-layout.service';
declare var $: any;

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss']
})
export class GenericTableComponent<T extends BaseModel> implements OnInit, OnChanges {
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
  @Input() customInclude: string = null;
  @Input() changeItemPosition: (prevItem: T, currentItem: T) => boolean;

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
  resizeSubscription: any;

  selectedItem: T;
  gridLayout: GridLayoutModel[];
  @Output() selectedObject: EventEmitter<T> = new EventEmitter<T>();

  displayedColumns: string[];
  // ruleEngineService: RuleEngineService<T>;
  constructor(
    public dialogService: DialogService,
    public router: Router,
    private datePipe: DatePipe,
    private numberPipe: DecimalPipe,
    private percentPipe: PercentPipe
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
      if (!this.editOnClick && this.allowEdit) {
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
        this.dataSource.data = data;
      });

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
    const id = model.id;
    this.router.navigate([this.editLink, id]);
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

  deleteDisabled(model: T) {
    if (this.deleteDisableRule) {
      return this.evaluateRule(this.deleteDisableRule, model);
    } else {
      return false;
    }
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
    const prevItem = this.dataSource.data[event.previousIndex];
    const currentItem = this.dataSource.data[event.currentIndex];

    if (this.changeItemPosition(prevItem, currentItem)) {
      const prevIndex = this.dataSource.data.findIndex((d) => d === event.item.data);
      moveItemInArray(this.dataSource.data, prevIndex, event.currentIndex);
      this.table.renderRows();
    }
  }
  isColumnSticky(name: string): boolean {
    if (this.stickyColumns) {
      const filtersArr = this.stickyColumns.split(",");
      return filtersArr.findIndex(f => f == name) !== -1;
    }
    return false;
  }

}
