import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationStart, Router, UrlSegment } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BaseModel, BaseQueryData, BaseService, BaseTableImplementation, LocalFileService } from '@rosoftlab/core';
import { ReactiveDictionary } from '@rosoftlab/rdict';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import * as jsonLogic from 'json-logic-js/logic.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IonicDialogService } from '../../ionic-dialog.service';
import { RslIonicModuleModule } from '../../rsl-ionic-module.module';

export declare type SortDirection = 'asc' | 'desc' | '';

@Component({
  selector: 'generic-ionic-grid',
  templateUrl: './generic-ionic-grid.component.html',
  styleUrls: ['./generic-ionic-grid.component.scss'],
  standalone: true,
  imports: [RslIonicModuleModule]
})
export class GenericIonicGridComponent extends BaseTableImplementation<any, any, any> implements OnInit, OnDestroy {
  @ViewChild('actionsTmpl', { static: true }) actionsTmpl: TemplateRef<any>;

  // @Input() modelService: BaseService<BaseModel>;
  // @Input() modelName: string | null = null;

  data: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 30;

  columns: any[] = [];
  allColumns: any[] = [];
  referenceData = new Map<string, Map<string, any>>();

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  readonly headerHeight = 50;
  readonly rowHeight = 50;
  isLoading: boolean;
  filterValue: string;
  oldOffsetY: number;

  private isRdict = false;
  private rdict: ReactiveDictionary;
  private tableRdict!: ReactiveDictionary;
  private parentDict!: ReactiveDictionary;
  private readonly destroy$ = new Subject<void>();

  constructor(
    public router: Router,
    public translate: TranslateService,
    public dialogServiceIonic: IonicDialogService,
    private el: ElementRef,
    private localFileService: LocalFileService
  ) {
    super();
  }

  override async ngOnInit() {
    super.ngOnInit();
    const service = this.dataService as unknown;
    this.isRdict = false;
    if (service instanceof BaseService) {
      this.initStandard();
    } else if (service instanceof ReactiveDictionary) {
      this.rdict = service as ReactiveDictionary;
      await this.initRdict();
    }

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.data = [];
        this.pageIndex = 1;
      }
    });
  }

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initStandard() {
    this.getListLayout();
    this.loadData();
  }

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
    this.model = filteredSegments.length > 0 ? filteredSegments[filteredSegments.length - 1].path : '';
    if (this.useView) {
      await this.getParentDict();
    }
    this.getListLayout();
    this.loadData();
  }

  private async getParentDict() {
    const lastDotIndex = (this.dictPath ?? '').lastIndexOf('.');
    const parentPath = lastDotIndex !== -1 ? (this.dictPath ?? '').substring(0, lastDotIndex) : this.dictPath!;
    this.parentDict = await this.rdict.asyncGet(parentPath);
  }

  onScroll(offsetY: number) {
    if (offsetY) {
      if (this.oldOffsetY !== offsetY) {
        this.oldOffsetY = offsetY;
        const viewHeight = this.el.nativeElement.getBoundingClientRect().height - this.headerHeight;
        if (!this.isLoading && offsetY + viewHeight >= this.data.length * this.rowHeight) {
          let limit = this.pageSize;
          if (this.data.length === 0) {
            const pageSize = Math.ceil(viewHeight / this.rowHeight);
            limit = Math.max(pageSize, this.pageSize);
          }
          this.pageSize = limit;
          this.loadData();
        }
      }
    }
  }

  async ionViewWillEnter() {
    this.data = [];
    this.loadData();
  }

  async handleChange(event) {
    this.filterValue = event.target.value.toLowerCase();
    this.data = [];
    this.pageIndex = 1;
    this.loadData();
  }

  async handleRefresh(event) {
    this.pageIndex = 1;
    this.data = [];
    this.loadData();
    if (event?.target) {
      event.target.complete();
    }
  }

  override loadData(): void {
    if (this.isRdict) {
      this.loadDataRdict();
    } else {
      this.loadDataStandard();
    }
  }

  private loadDataStandard(): void {
    const filters: string[] = [];
    let sorts = '';
    this.isLoading = true;
    if (this.defaultSort) {
      sorts = this.defaultSortDirection === 'desc' ? '-' + this.defaultSort : this.defaultSort;
    }
    if (this.showSearch && this.filterValue) {
      const searchFieldsValue = Array.isArray(this.searchFields) ? this.searchFields.join(',') : this.searchFields;
      if (!searchFieldsValue) {
        filters.push('@=*' + this.filterValue);
      } else {
        const y = '(' + searchFieldsValue.replace(',', '|') + ')';
        filters.push(y + '@=*' + this.filterValue);
      }
    }
    if (this.defaultFilter) {
      filters.push(this.defaultFilter);
    }
    setTimeout(() => {
      const filtersValue = filters.join(', ');
      this.dataService
        .getAll(this.pageIndex, this.pageSize, sorts, filtersValue, this.customInclude)
        .subscribe((response: BaseQueryData<BaseModel>) => {
          if (this.pageIndex !== response.getMeta().meta.count) {
            this.pageIndex++;
          }
          const rows = [...this.data, ...response.getModels()];
          this.data = rows;
          this.isLoading = false;
        });
    }, 700);
  }

  private loadDataRdict(): void {
    if (!this.dictPath) return;
    if (this.useView) {
      this.loadDataViewRdict();
      return;
    }
    this.rdict
      .get$(this.dictPath)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rdictData) => {
          this.tableRdict = rdictData;
          this.tableRdict
            .onChange$()
            .pipe(takeUntil(this.destroy$))
            .subscribe((changes) => this.onChangeEventRdict(changes));
          this.tableRdict
            .onDelete$()
            .pipe(takeUntil(this.destroy$))
            .subscribe((changes) => this.onDeleteEventRdict(changes));
          this.rdict
            .getArray$(this.dictPath!, this.tableRdict)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (value) => (this.data = value),
              error: (err) => console.error('Error:', err.message)
            });
        },
        error: (err) => console.error('Error:', err.message)
      });
  }

  private loadDataViewRdict() {
    if (!this.parentDict || !this.model) return;
    const request = { skip: 0, take: this.pageSize } as any;
    this.parentDict.getFilteredView(this.model, request).subscribe({
      next: (view) => (this.data = view)
    });
  }

  private onDeleteEventRdict(changes: any) {
    if (changes?.key) {
      const index = this.data.findIndex((item: any) => item.oid === changes.key);
      if (index > -1) {
        this.data.splice(index, 1);
      }
    }
  }

  private onChangeEventRdict(changes: any) {
    if (!changes) return;
    const key = changes?.key as string;
    const value = changes?.value;

    if (key === 'transactions') {
      for (const [tKey, tValue] of Object.entries(value)) {
        const index = this.data.findIndex((item: any) => item.oid === tKey);
        if (index > -1) {
          this.data[index] = tValue;
        } else {
          this.data.push(tValue);
        }
      }
    } else if (key && value) {
      const index = this.data.findIndex((item: any) => item.oid === key);
      if (index > -1) {
        this.data[index] = value.getPlainObject();
      } else {
        this.tableRdict.get$(key).subscribe((val) => {
          this.data.push(val.getPlainObject());
        });
      }
    }
  }

  getListLayout() {
    if (this.isRdict) {
      this.getListLayoutRdict();
    } else {
      this.getListLayoutStanderd();
    }
  }

  getListLayoutStanderd() {
    const modelKey = this.model;
    if (!modelKey) return;
    const layoutSource$ = this.fileLayout
      ? this.localFileService.getJsonData(this.fileLayout)
      : this.rdict
        ? this.rdict.get$('config.models.' + modelKey + '.tableLayout')
        : null;
    if (!layoutSource$) return;

    layoutSource$.subscribe({
      next: (value) => {
        const layout = this.fileLayout ? value.find((item: any) => item.model === modelKey) : value;
        this.setLayout(this.fileLayout ? layout?.tableLayout : layout);
      },
      error: (err) => console.error('Error loading layout:', err.message)
    });
  }

  getListLayoutRdict() {
    const modelKey = this.model;
    if (!modelKey) return;
    const layoutSource$ = this.fileLayout
      ? this.localFileService.getJsonData(this.fileLayout)
      : this.rdict.get$('config.models.' + modelKey + '.tableLayout');

    layoutSource$.subscribe({
      next: (value) => {
        const layout = this.fileLayout ? value.find((item: any) => item.model === modelKey) : value;
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
    }

    this.allColumns.sort((a, b) => a.order - b.order);
    this.columns = this.allColumns.map((col) => ({
      prop: col.propertyName,
      name: col.name,
      sortable: true
    }));

    if (this.canDelete || this.canEdit) {
      this.columns.push({
        cellTemplate: this.actionsTmpl,
        name: '',
        sortable: false,
        draggable: false
      });
    }
  }

  private arrayToMap<TValue>(array: TValue[], keyProperty: keyof TValue): Map<string, TValue> {
    const map = new Map<string, TValue>();
    array.forEach((item) => map.set(String(item[keyProperty]), item));
    return map;
  }

  override editHandler(args: any): void {
    this.edit(args);
  }

  override removeHandler(args: any): void {
    this.delete(args);
  }

  protected override delete(dataItem: any): void {
    const modelName = dataItem?.[this.deletePropertyName];
    const message = this.translate.instant('Are you sure you want to delete this {{modelName}}?', { modelName });
    this.dialogServiceIonic.confirm(message).then((value: any) => {
      if (value?.data) {
        const idValue = dataItem?.[this.idProperty] ?? dataItem?.id ?? dataItem?.oid;
        this.performDelete(idValue);
      }
    });
  }

  override performDelete(id: any): void {
    if (this.isRdict && this.tableRdict) {
      this.tableRdict.delete$(id).subscribe(() => {
        const index = this.data.findIndex((item: any) => item.oid === id || item.id === id);
        if (index > -1) {
          this.data.splice(index, 1);
        }
      });
      return;
    }
    this.dataService.delete(id).subscribe(() => {
      const tempData = [];
      this.data.map((item) => {
        if (item.id !== id) {
          tempData.push(item);
        }
      });
      this.data = tempData;
    });
  }

  override getCellValue(item: any, column: any): any {
    if (!item || typeof item !== 'object') return null;
    if (column?.type === 'reference') {
      const getNested = (obj: any, path: string) => path.split('.').reduce((acc, key) => acc?.[key], obj);
      const propVal = getNested(item, column.propertyName);
      return this.referenceData.get(column.reference)?.get(String(propVal))?.[column.referenceProperty] ?? propVal;
    }
    return item[column?.propertyName ?? column?.prop];
  }

  onAdd() {
    this.addHandler();
  }

  editModel(model: BaseModel) {
    if (this.canEdit) this.editHandler(model);
  }

  deleteModel(model: any) {
    this.removeHandler(model);
  }

  deleteEnabled(model: BaseModel) {
    if (this.canDelete) {
      if (this.deleteDisableRule) {
        return this.evaluateRule(this.deleteDisableRule, model);
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  private evaluateRule(rules: any[], model: BaseModel): boolean {
    let result = true;
    rules.forEach((rule) => {
      let jsonRule: any;
      if (typeof rule.rule === 'string') {
        jsonRule = JSON.parse(rule.rule);
      } else {
        jsonRule = rule.rule;
      }
      if (rule.parameters) {
        const data =
          '{' +
          rule.parameters
            .map((item: string) => {
              return '"' + item + '":"' + model[item] + '"';
            })
            .join(',') +
          '}';
        result = jsonLogic.apply(jsonRule, JSON.parse(data));
      } else {
        result = jsonLogic.apply(jsonRule);
      }
    });
    return result;
  }
}
