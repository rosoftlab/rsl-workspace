import { Location } from '@angular/common';
import { Component, ElementRef, Injector, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationStart, Router, UrlSegment } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BaseQueryData, BaseService, MetadataStorage, Rule } from '@rosoftlab/core';
import { BaseModelFormly } from '@rosoftlab/formly';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import * as jsonLogic from 'json-logic-js/logic.js';
import { IonicDataTableLayoutConfig } from '../../decorators/ionic-datatable-layout';
import { IonicDialogService } from '../../ionic-dialog.service';
import { RslIonicModuleModule } from '../../rsl-ionic-module.module';
export declare type SortDirection = 'asc' | 'desc' | '';
@Component({
    selector: 'app-rsl-ionic-data-table',
    templateUrl: './rsl-ionic-data-table.component.html',
    styleUrls: ['./rsl-ionic-data-table.component.scss'],
    imports: [RslIonicModuleModule]
})
export class RslIonicDataTableComponent<T extends BaseModelFormly, U extends BaseService<T>> implements OnInit {
  @ViewChild('actionsTmpl', { static: true }) actionsTmpl: TemplateRef<any>;
  public title: string;
  @Input() showSerach: boolean;
  @Input() searchFields: string;
  @Input() customInclude: string;
  @Input() defaultSort: string;
  @Input() defaultSortDirection: SortDirection;
  @Input() deletePropertyName: string;
  @Input() defaultFilter: string;
  @Input() showHeader: boolean;
  @Input() deleteDisableRule: Rule[];
  @Input() hasAdd: boolean;
  @Input() canDelete: boolean;
  @Input() canEdit: boolean;

  @Input() model: T;
  @Input() modelService: U

  data: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 30

  basePath: string;

  columns = [];
  allColumns = [];
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  readonly headerHeight = 50;
  readonly rowHeight = 50;
  isLoading: boolean;
  filterValue: string;
  oldOffsetY: number;
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public translate: TranslateService,
    public location: Location,
    private injector: Injector,
    private navCtrl: NavController,
    public dialogService: IonicDialogService,
    private el: ElementRef) {

  }
  ngOnInit() {
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
    if (!this.modelService) {
      const SERVICE_TOKEN = this.route.snapshot.data['requiredService'];
      this.modelService = this.injector.get<U>(<any>SERVICE_TOKEN);
    }
    this.model = this.modelService.newModel()
    this.title = this.model.modelConfig.formTitle
    this.getListLayout()

    const currentUrlSegments: UrlSegment[] = this.router.url.split('/').map(segment => new UrlSegment(segment, {}));
    this.basePath = currentUrlSegments.map(segment => segment.path).join('/');
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Navigation to another page is about to occur
        this.data = [];
        this.pageIndex = 1
        // Perform actions or update component as needed
      }
    });
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
  onScroll(offsetY: number) {
    if (offsetY) {
      if (this.oldOffsetY !== offsetY) {
        this.oldOffsetY = offsetY;
        const viewHeight = this.el.nativeElement.getBoundingClientRect().height - this.headerHeight;
        if (!this.isLoading && offsetY + viewHeight >= this.data.length * this.rowHeight) {
          // total number of results to load
          let limit = this.pageSize;

          // check if we haven't fetched any results yet
          if (this.data.length === 0) {
            // calculate the number of rows that fit within viewport
            const pageSize = Math.ceil(viewHeight / this.rowHeight);

            // change the limit to pageSize such that we fill the first page entirely
            // (otherwise, we won't be able to scroll past it)
            limit = Math.max(pageSize, this.pageSize);
          }
          // this.pageIndex
          this.pageSize = limit
          this.loadData();
          // this.loadPage(limit);
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
    this.pageIndex = 1
    this.loadData();
  }
  loadData(event = null) {
    const filters = [];
    let sorts = '';
    this.isLoading = true;
    if (this.defaultSort) {
      if (this.defaultSortDirection === 'desc') {
        sorts = '-' + this.defaultSort;
      } else {
        sorts = this.defaultSort;
      }
    }
    if (this.showSerach) {
      if (this.filterValue) {
        const y = '(' + this.searchFields.replace(',', '|') + ')';
        filters.push(y + '@=*' + this.filterValue);
      }
    }
    if (this.defaultFilter) {
      filters.push(this.defaultFilter)
    }
    setTimeout(() => {
      const filtersValue = filters.join(', ');
      this.modelService.getAll(this.pageIndex, this.pageSize, sorts, filtersValue, this.customInclude).subscribe(
        (response: BaseQueryData<T>) => {
          if (this.pageIndex !== response.getMeta().meta.count) {
            this.pageIndex++
          } else {
            if (event) event.target.disabled = true;
          }
          // if (this.filterValue)
          //   this.data = response.getModels();
          // else
          const rows = [...this.data, ...response.getModels()];
          this.data = rows;
          // this.data = this.data.concat();

          if (event) event.target.complete();
          this.isLoading = false;
        })
    }, 700);
  }
  async handleRefresh(event) {
    this.pageIndex = 1
    this.data = [];
    this.loadData();
    event.target.complete();
  }
  onAdd() {
    console.log(this.basePath)
    this.router.navigate([this.basePath + '/add'])
    // this.navCtrl.navigateForward(this.basePath + '/add');
  }
  editModel(model: BaseModelFormly) {
    if (this.canEdit)
      this.router.navigate([this.basePath + '/edit/', model.id]);
    // this.navCtrl.navigateForward(this.basePath + '/edit/' + model.id);
  }
  getListLayout() {
    if (!this.model) {
      this.model = this.modelService.newModel();    
    }
    this.allColumns=[];
    this.columns=[];
    this.allColumns = MetadataStorage.getMetadata('IonicDataTableLayout', this.model).map((item: IonicDataTableLayoutConfig) => {
      if (!item.isTranslated) {
        item.name = this.translate.instant(item.name);
        item.isTranslated = true
      }
      return item;
    });

    this.allColumns.sort((a, b) => a.order - b.order);

    if (this.canDelete || this.canEdit) {
      this.allColumns.push({
        cellTemplate: this.actionsTmpl,
        name: '',
        cellClass: 'actions-cell',
        draggable: false,
        sortable: false,
        visible: true
        // width: 100,
        // maxWidth: 100,
        // minWidth: 100
      })
    }
    this.columns = this.allColumns.filter((item: IonicDataTableLayoutConfig) => item.visible);
    // Sort the columns array by the order property

  }
  deleteModel(model) {
    const msg = 'Do you want to delete ' + model[this.deletePropertyName] + '?';
    this.dialogService.confirm(msg).then(
      (value: any) => {
        if (value.data) {
          this.modelService.delete(model.id).subscribe(() => {
            const tempData = [];
            // this.selectedObject.emit(null);
            this.data.map((item) => {
              if (item.id !== model.id) {
                tempData.push(item);
              }
            });
            this.data = tempData;
          });
        }
      }
    )
  }

  deleteEnabled(model: T) {
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


}
