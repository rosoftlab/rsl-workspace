import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FORMLY_CONFIG, FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
import { KENDO_GRID } from '@progress/kendo-angular-grid';
import { KENDO_LABEL } from '@progress/kendo-angular-label';
import { KENDO_TOOLBAR } from '@progress/kendo-angular-toolbar';
import { arrowLeftIcon, saveIcon, SVGIcon } from '@progress/kendo-svg-icons';
import { BaseCrudImplementation, BaseService, DIALOG_SERVICE_TOKEN, LocalFileService, RouteHistoryService } from '@rosoftlab/core';
import { ReactiveDictionary } from '@rosoftlab/rdict';
import { catchError, concatMap, EMPTY, map, Observable, Subject, take, tap } from 'rxjs';
import { registerTranslateExtension } from '../../translate.extension';
import { MaterialDialogService } from '../shared/material-dialog.service';

@Component({
  selector: 'app-generic-kendo-crud',
  templateUrl: './generic-kendo-crud.component.html',
  styleUrls: ['./generic-kendo-crud.component.scss'],
  imports: [
    FormlyModule,
    ReactiveFormsModule,
    FormlyKendoModule,
    TranslateModule,
    KENDO_GRID,
    KENDO_TOOLBAR,
    KENDO_LABEL,
    KENDO_BUTTONS,
    KENDO_DIALOG
  ],
  providers: [
    { provide: FORMLY_CONFIG, multi: true, useFactory: registerTranslateExtension, deps: [TranslateService] },
    { provide: DIALOG_SERVICE_TOKEN, useClass: MaterialDialogService }
  ]
})
export class GenericKendoCrudComponent extends BaseCrudImplementation<any> implements OnInit {
  protected localFileService = inject(LocalFileService);
  isRdict: boolean = true;
  rdictModel: string;
  id: string; // Add this line
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [];
  fileLayout: string;

  original_model: any;

  modelKey: string | null;
  modelRdict: ReactiveDictionary;
  rdict: ReactiveDictionary;

  public saveIcon: SVGIcon = saveIcon;
  public backIcon: SVGIcon = arrowLeftIcon;
  // Add this to your class to manage cleanup
  private destroy$ = new Subject<void>();
  constructor(private routeHistory: RouteHistoryService) {
    super();
  }

  async ngOnInit() {
    const service = this.modelService as unknown; // Cast to unknown first
    this.isRdict = false;
    if (service instanceof BaseService) {
      this.initStandard();
    } else if (service instanceof ReactiveDictionary) {
      this.rdict = service as ReactiveDictionary;
      await this.initRdict();
    }
  }

  @HostBinding('class')
  get hostClasses(): string {
    return this.hostClass;
  }
  private setLayout(formLayout: any) {
    this.title = this.translate.instant(formLayout['title']);
    let fieldsTmp: FormlyFieldConfig[] = formLayout['fields'];
    this.fields = this.transformFields(fieldsTmp);
  }

  transformFields(fields: FormlyFieldConfig[]): FormlyFieldConfig[] {
    return fields.map((field) => this.transformField(field));
  }
  private transformField(field: FormlyFieldConfig): FormlyFieldConfig {
    // Handle the current field
    if (field.type === 'select' && field.props?.options && typeof field.props.options === 'string') {
      if (this.isRdict) field.props.options = this.getSelectDataRdict(field.props.options);
      else field.props.options = this.getSelectDataStandard(field.props.options);
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
    if (this.isRdict) await this.saveModeRdict(this.baseForm);
    else this.saveModelStandard(this.baseForm);
  }

  onBack() {
    if (this.baseForm.dirty) {
      this.dialogService.confirm('Do you want to cancel the changes ?').subscribe({
        next: (result) => {
          if (result) {
            this.router.navigate([this.cancelRoute]);
          }
        }
      });
    } else {
      this.router.navigate([this.cancelRoute]);
    }
  }
  /**
   * Clean URL segments by removing IDs (Numeric or GUID) and action keywords.
   * Useful for breadcrumbs or identifying the functional area of the app.
   */
  private getCleanUrlSegments(url: string): string[] {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const actionKeywords = ['add', 'edit', 'view', 'details'];

    const segments = url.split('/').filter((segment) => {
      return (
        segment !== '' && // Remove empty strings
        isNaN(Number(segment)) && // Remove numeric IDs
        !guidRegex.test(segment) // Remove GUIDs
      );
    });

    // Remove the last segment if it is a common action keyword
    if (actionKeywords.includes(segments[segments.length - 1])) {
      segments.pop();
    }

    return segments;
  }
  //#region Standard Service
  initStandard(newModelId: string = null, model: any | null = null) {
    const currentUrlSegments: string[] = this.getCleanUrlSegments(this.router.url);
    this.cancelRoute = currentUrlSegments.join('/');
    if (model === null) {
      this.modelId = this.route.snapshot.paramMap.get('id') ?? newModelId;
      this.isEdit = false;
      if (this.modelId) {
        this.modelService.get(this.modelId, this.customInclude).subscribe((value: any) => {
          this.isEdit = true;
          this.original_model = this.modelService.newModel(JSON.parse(JSON.stringify(value)));
          this.generateForm(value);
        });
      } else {
        if (this.changeUrlRoute) {
          const addUrl = this.router.createUrlTree([]).toString();
          this.editRoute = this.router.createUrlTree([addUrl.replace('add', 'edit')]).toString();
        }
        // }
        this.generateForm(this.modelService.newModel());
      }
    } else {
      this.isEdit = true;
      this.generateForm(model);
    }
  }
  generateForm(model?: any) {
    this.isLoading = false;
    this.modelId = (model as any).id;
    this.model = model;
    // this.baseForm = this.modelService.toFormGroup(this.fb, model);
    this.getListLayoutStanderd();
    this.afterFormGenerated();
  }
  getListLayoutStanderd() {
    if (!this.modelName) return;
    const layoutSource$ = this.fileLayout
      ? this.localFileService.getJsonData(this.fileLayout)
      : this.rdict.get$('config.models.' + this.modelName + '.formLayout');

    layoutSource$.subscribe({
      next: (value) => {
        const layout = this.fileLayout ? value.find((item: any) => item.model === this.modelName) : value;
        this.setLayout(this.fileLayout ? layout?.formLayout : layout);
      },
      error: (err) => console.error('Error loading layout:', err.message)
    });
  }
  public afterFormGenerated() {}
  public getSelectDataStandard(key: string): Observable<any> {
    return this.rdict.getArray$(key);
  }
  saveModelStandard(formGroup: FormGroup | string = null) {
    const fg = this.getFromGroup(formGroup);

    // 1. Guard Clause: Validation
    if (!fg || !fg.valid) {
      this.validateAllFormFields(formGroup);
      return;
    }

    // 2. Reactive Chain
    this.beforeSave(this.model)
      .pipe(
        // Proceed to save only after beforeSave completes
        concatMap(() => this.modelService.save(this.model, this.modelId, this.original_model)),

        // Handle UI state updates mid-stream
        tap((newModel) => {
          this.model = newModel;
          this.modelId = newModel.id;
          this.updateNavigation(); // Abstracted for clarity
        }),

        // Proceed to afterSave logic
        concatMap((newModel) => this.afterSave(newModel)),

        // Catch errors for the entire chain in one place
        catchError((err) => {
          this.serverErrors(err);
          return EMPTY; // Stop the stream
        })
      )
      .subscribe({
        next: () => {
          this.dialogService.showSaveMessage();
          fg.markAsPristine();
        }
      });
  }

  /** * Isolated navigation logic to keep the stream clean
   */
  private updateNavigation(): void {
    if (this.editRoute) {
      this.isEdit = true;
      if (this.changeUrlRoute) {
        const url = this.router.createUrlTree([this.editRoute, this.modelId]).toString();
        this.location.replaceState(url);
      }
    }
  }
  //#endregion

  //#region Rdict Service
  async initRdict() {
    const currentUrlSegments: string[] = this.getCleanUrlSegments(this.router.url);
    this.cancelRoute = currentUrlSegments.join('/');
    this.dictPath = currentUrlSegments.join('.');
    this.hostClass = currentUrlSegments.join(' ') + ' crud';
    this.rdictModel = currentUrlSegments.length > 0 ? currentUrlSegments[currentUrlSegments.length - 1] : '';
    const id = this.route.snapshot.paramMap.get('id');
    this.modelKey = id ?? null;
    this.getModelFieldsRdict();
    this.getModelRdict();
    const addUrl = this.router.createUrlTree([]).toString();
    this.editRoute = this.router.createUrlTree([addUrl.replace('add', 'edit')]).toString();
    this.isRdict = true;
  }

  getModelFieldsRdict() {
    if (!this.rdictModel) return;

    // 1. Determine the source stream
    const source$ = this.fileLayout
      ? this.localFileService
          .getJsonData(this.fileLayout)
          .pipe(map((value) => value?.find((item) => item.model === this.rdictModel)?.formLayout))
      : this.rdict.get$(`config.models.${this.rdictModel}.formLayout`);

    // 2. Execute the stream
    source$
      .pipe(
        take(1), // Auto-completes, preventing memory leaks
        catchError((err) => {
          console.error('Error fetching layout:', err.message);
          return EMPTY;
        })
      )
      .subscribe((layout) => {
        if (layout) {
          this.setLayout(layout);
        }
      });
  }

  getModelRdict() {
    this.model = {};
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

  public getSelectDataRdict(key: string): Observable<any> {
    return this.rdict.getArray$(key);
  }

  async saveModeRdict(fg: FormGroup) {
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
  //#endregion
}
