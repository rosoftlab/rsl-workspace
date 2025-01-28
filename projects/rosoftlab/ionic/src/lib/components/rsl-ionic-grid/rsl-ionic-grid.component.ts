import { DatePipe, DecimalPipe, Location, PercentPipe } from '@angular/common';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationStart, Router, UrlSegment } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BaseQueryData, BaseService, GridLayoutFormat, MetadataStorage, Rule } from '@rosoftlab/core';
import { BaseModelFormly } from '@rosoftlab/formly';
import * as jsonLogic from 'json-logic-js/logic.js';
import { IonicListLayoutConfig } from '../../interfaces';
import { IonicDialogService } from '../../ionic-dialog.service';
import { RslIonicModuleModule } from '../../rsl-ionic-module.module';
export declare type SortDirection = 'asc' | 'desc' | '';
@Component({
    selector: 'rsl-ionic-grid',
    templateUrl: './rsl-ionic-grid.component.html',
    imports: [RslIonicModuleModule]
})
export class RslIonicGridComponent<T extends BaseModelFormly, U extends BaseService<T>> implements OnInit {
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
  @Input() model: T;
  @Input() modelService: U

  data: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 30

  gridLayout: IonicListLayoutConfig[]
  basePath: string;
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public translate: TranslateService,
    public location: Location,
    private injector: Injector,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    public dialogService: IonicDialogService,
    private datePipe: DatePipe,
    private numberPipe: DecimalPipe,
    private percentPipe: PercentPipe) {
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

    // this.showSerach = route.snapshot.data['showSerach'] || false;
    // this.searchFields = this.route.snapshot.data['searchFields'] || null;

    // this.customInclude = this.route.snapshot.data['customInclude'] || null;

    // this.defaultSort = this.route.snapshot.data['defaultSort'] || null;
    // this.defaultSortDirection = this.route.snapshot.data['defaultSortDirection'] || '';

    // this.deletePropertyName = this.route.snapshot.data['deletePropertyName'] || 'name';
    // this.defaultFilter = this.route.snapshot.data['defaultFilter'] || null;

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
  }
  setValueFromSnapshot<T>(component: any, snapshot: ActivatedRouteSnapshot, key: string, defaultValue: T): void {
    if (component[key] === undefined) {
      let dataFromSnapshot = snapshot.data[key];
      if (!dataFromSnapshot)
        dataFromSnapshot = snapshot.params[key];
      component[key] = dataFromSnapshot !== undefined ? dataFromSnapshot : defaultValue;
    }
  }
  async ionViewWillEnter() {
    this.data = [];
    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('General.Loading'),
      spinner: 'circles',
    });
    loading.present();
    this.loadData(null, null, loading);
  }
  async handleChange(event) {
    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('General.Loading'),
      spinner: 'circles',
    });
    loading.present();
    const query = event.target.value.toLowerCase();
    this.pageIndex = 1
    this.loadData(null, query, loading);
    // this.results = this.data.filter((d) => d.toLowerCase().indexOf(query) > -1);
  }
  loadData(event = null, filterValue = undefined, loading = null) {
    const filters = [];
    let sorts = '';
    if (this.defaultSort) {
      if (this.defaultSortDirection === 'desc') {
        sorts = '-' + this.defaultSort;
      } else {
        sorts = this.defaultSort;
      }
    }
    if (this.showSerach) {
      if (filterValue) {
        const y = '(' + this.searchFields.replace(',', '|') + ')';
        filters.push(y + '@=*' + filterValue);
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
          if (filterValue || loading)
            this.data = response.getModels();
          else
            this.data = this.data.concat(response.getModels());

          if (event) event.target.complete();
          if (loading)
            loading.dismiss()
        })
    }, 700);
  }
  async handleRefresh(event) {
    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('General.Loading'),
      spinner: 'circles',
    });
    loading.present();
    this.pageIndex = 1
    this.loadData(null, null, loading);
    event.target.complete();
  }
  onAdd() {
    console.log(this.basePath)
    this.navCtrl.navigateForward(this.basePath + '/add');
  }
  editModel(model: BaseModelFormly) {
    this.navCtrl.navigateForward(this.basePath + '/edit/' + model.id);
  }
  getListLayout() {
    if (!this.model) {
      this.model = this.modelService.newModel();
    }
    this.gridLayout = MetadataStorage.getMetadata('IonicListLayout', this.model);
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
  getCelValue(row: any, propertyName: string): any {
    if (!row)
      return "";
    // if (propertyName == 'kompetenzenStdev')
    //   console.log(propertyName);
    if (propertyName.indexOf('.') === -1) {
      var gridLayout = this.gridLayout.find(f => f.key.indexOf(propertyName) > -1);
      return this.getFormatedValue(gridLayout, row[propertyName]);
    } else {
      const prop = propertyName.split('.')[0];
      const subProp = propertyName.replace(prop + '.', '');
      return this.getCelValue(row[prop], subProp);
    }
  }
  private getFormatedValue(gridLayout: IonicListLayoutConfig, value: any) {

    if (gridLayout) {
      switch (gridLayout.formating) {
        case GridLayoutFormat.date:
          return this.datePipe.transform(value, gridLayout.customFormat);
          break;
        case GridLayoutFormat.number:
          return this.numberPipe.transform(value, gridLayout.customFormat);
        case GridLayoutFormat.percent:
          const valuePrc = value / 100;
          return this.percentPipe.transform(valuePrc, gridLayout.customFormat);
        default:
          return value;
          break;
      }
    }
    return value;
  }

  deleteEnabled(model: T) {
    if (this.deleteDisableRule) {
      return this.evaluateRule(this.deleteDisableRule, model);
    } else {
      return true;
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
