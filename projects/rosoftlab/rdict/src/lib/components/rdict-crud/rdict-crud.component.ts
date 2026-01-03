import { CommonModule, Location } from '@angular/common';
import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
import { KENDO_GRID } from '@progress/kendo-angular-grid';
import { KENDO_LABEL } from '@progress/kendo-angular-label';
import { KENDO_TOOLBAR } from '@progress/kendo-angular-toolbar';
import { arrowLeftIcon, saveIcon, SVGIcon } from '@progress/kendo-svg-icons';
import { LocalFileService, RouteHistoryService } from '@rosoftlab/core';
import { Observable } from 'rxjs';
import { ReactiveDictionary } from '../../reactive-dictionary';
import { MaterialDialogService } from '../../services/material-dialog.service';
import { CrudFormlyTransaltionModule } from './rsl-reactive-dictionary.module';
@Component({
  selector: 'app-rdict-crud',
  templateUrl: './rdict-crud.component.html',
  styleUrls: ['./rdict-crud.component.scss'],
  imports: [
    FormlyModule,
    CommonModule,
    ReactiveFormsModule,    
    FormlyKendoModule,
    TranslateModule,
    CrudFormlyTransaltionModule,
    // forwardRef(() => CrudFormlyTransaltionModule ), // Delays evaluation
    KENDO_GRID,
    KENDO_TOOLBAR,
    KENDO_LABEL,
    KENDO_BUTTONS,
    KENDO_DIALOG
  ],
  // providers: [{ provide: FORMLY_CONFIG, multi: true, useFactory: registerTranslateExtension, deps: [TranslateService] }]
})
export class RdictCrudComponent implements OnInit {
  title: string;

  basePath: string;
  dictPath: string;
  rdictModel: string;

  baseForm = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [];
  fileLayout: string;
  modelKey: string | null;
  modelRdict: ReactiveDictionary;
  hostClass = '';
  editRoute: string;
  public saveIcon: SVGIcon = saveIcon;
  public backIcon: SVGIcon = arrowLeftIcon;
  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected translate: TranslateService,

    public rdict: ReactiveDictionary,
    protected localFileService: LocalFileService,
    protected dialogService: MaterialDialogService,
    private routeHistory: RouteHistoryService,
    protected location: Location
  ) {
    console.log('RdictCrudComponent constructor');
  }

  async ngOnInit() {
    this.setValueFromSnapshot(this, this.route.snapshot, 'fileLayout', '');

    const currentUrlSegments: string[] = this.router.url.split('/').filter((segment) => segment !== '' && isNaN(Number(segment)));
    if (['add', 'edit'].includes(currentUrlSegments[currentUrlSegments.length - 1])) {
      currentUrlSegments.pop();
    }

    this.dictPath = currentUrlSegments.join('.');
    this.hostClass = currentUrlSegments.join(' ') + ' crud';
    this.rdictModel = currentUrlSegments.length > 0 ? currentUrlSegments[currentUrlSegments.length - 1] : '';
    const id = this.route.snapshot.paramMap.get('id');
    this.modelKey = id ?? null;
    this.getModelFields();
    this.getModel();
    const addUrl = this.router.createUrlTree([]).toString();
    this.editRoute = this.router.createUrlTree([addUrl.replace('add', 'edit')]).toString();
  }
  @HostBinding('class')
  get hostClasses(): string {
    return this.hostClass;
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

  onSubmit(model) {
    // this.saveModel(this.baseForm)
  }
  getModel() {
    if (this.modelKey) {
      this.rdict.get$(this.dictPath).subscribe({
        next: (value) => {
          value.get$(this.modelKey).subscribe({
            next: (modelValue) => {
              this.modelRdict = modelValue;
              this.model = this.modelRdict.getPlainObject();
              this.modelRdict.onChange$().subscribe((changes) => {
                if (changes) {
                  console.log('Changes detected:', changes);
                  this.baseForm.get(changes.key).patchValue(changes.value);
                  // this.model[changes.key] = changes.value;
                }
              });
            }
          });
        },
        error: (err) => console.error('Error:', err.message)
      });
    }
  }
  getModelFields() {
    if (this.rdictModel) {
      if (this.fileLayout) {
        //load from file
        this.localFileService.getJsonData(this.fileLayout).subscribe({
          next: (value) => {
            if (value) {
              const layout = value.find((item) => item.model === this.rdictModel);
              this.setLayout(layout?.formLayout);
            }
          },
          error: (err) => console.error('Error:', err.message)
        });
      } else
        this.rdict.get$('config.models.' + this.rdictModel + '.formLayout').subscribe({
          next: (formLayout) => {
            if (formLayout) {
              this.setLayout(formLayout);
            }
          },
          error: (err) => console.error('Error:', err.message)
        });
    }
  }
  private setLayout(formLayout: any) {
    this.title = this.translate.instant(formLayout['title']);
    // console.log(formLayout["fields"]);
    let fieldsTmp: FormlyFieldConfig[] = formLayout['fields'];
    this.fields = this.transformFields(fieldsTmp);
    //  this.transformJsonToFormlyFields()
  }
  transformFields(fields: FormlyFieldConfig[]): FormlyFieldConfig[] {
    return fields.map((field) => this.transformField(field));
  }
  private transformField(field: FormlyFieldConfig): FormlyFieldConfig {
    // Handle the current field
    if (field.type === 'select' && field.props?.options && typeof field.props.options === 'string') {
      field.props.options = this.getSelectData(field.props.options);
    }

    // Recursively handle fieldGroup
    if (field.fieldGroup) {
      field.fieldGroup = this.transformFields(field.fieldGroup);
    }

    // Recursively handle fieldArray
    if (field.fieldArray) {
      if (typeof field.fieldArray === 'function') {
        const originalFieldArrayFn = field.fieldArray;
        field.fieldArray = (fieldConfig: FormlyFieldConfig) => {
          const transformedField = this.transformField(originalFieldArrayFn(fieldConfig));
          return transformedField;
        };
      } else {
        field.fieldArray = this.transformField(field.fieldArray);
      }
    }

    return field;
  }
  public async onSave() {
    await this.saveModel(this.baseForm);
  }
  async saveModel(fg: FormGroup) {
    if (fg.valid) {
      var dict = await this.rdict.asyncGet(this.dictPath);
      var new_value = fg.value as Record<string, any>;
      if ('db_id' in this.model) {
        // property exists
        new_value['db_id'] = this.model['db_id'];
      }
      var result = await dict.update(fg.value as Record<string, any>, this.modelKey);
      if (result) {
        this.modelKey = Object.keys(result)[0];
        const data = result[this.modelKey];
        // Update the form values
        this.baseForm.patchValue(data);

        // Mark the form as pristine and untouched
        this.baseForm.markAsPristine();
        this.baseForm.markAsUntouched();
        this.baseForm.updateValueAndValidity();
        if (this.editRoute) {
          const url = this.router.createUrlTree([this.editRoute, this.modelKey]).toString();
          this.location.replaceState(url);
        }
        this.dialogService.showSaveMessage();
      }
      // console.log(fg.value);
    } else {
      this.validateAllFormFields(fg);
    }
  }
  validateAllFormFields(fg: FormGroup) {
    Object.keys(fg.controls).forEach((field) => {
      // console.log(field);
      const control = fg.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  public getSelectData(key: string): Observable<any> {
    return this.rdict.getArray$(key);
  }
  onBack() {
    if (this.baseForm.dirty) {
      this.dialogService.confirm('Do you want to cancel the changes ?').subscribe({
        next: (result) => {
          if (result) {
            this.router.navigate([this.routeHistory.getPreviousUrl() || '/']);
          }
        }
      });
      // .subscribe((result) => {
      //   if (result) {
      //     this.router.navigate([this.routeHistory.getPreviousUrl() || '/']);
      //   }
      // });
    } else {
      this.router.navigate([this.routeHistory.getPreviousUrl() || '/']);
    }
  }
}
