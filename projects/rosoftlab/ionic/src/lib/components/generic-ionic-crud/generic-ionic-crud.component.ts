import { Location } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { TranslateService } from '@ngx-translate/core';
import { BaseModelFormly, BaseServiceFormly } from '@rosoftlab/formly';
import * as _ from 'lodash';
import { Observable, from } from 'rxjs';
import { IonicDialogService } from '../../ionic-dialog.service';
import { RslIonicModuleModule } from '../../rsl-ionic-module.module';
@Component({
    selector: 'generic-ionic-crud',
    templateUrl: './generic-ionic-crud.component.html',
    styleUrls: ['./generic-ionic-crud.component.css'],
    imports: [RslIonicModuleModule]
})
export class GenericIonicCrudPageComponent<T extends BaseModelFormly, U extends BaseServiceFormly<T>> implements OnInit {
  baseForm: UntypedFormGroup;
  modelId: string;
  model: T;
  origModel: T;
  isEdit: boolean;
  isLoading = true;
  cancelRoute: string;
  editRoute: string;
  modelService: U
  public changeUrlRoute: boolean = true;
  public title: string;
  fields: FormlyFieldConfig[]
  options: FormlyFormOptions = {};
  //#region Dialog messages
  confirmQuestion: string
  confirmButton: string
  saveMessage: string
  //#endregion
  constructor(
    public fb: UntypedFormBuilder,
    public router: Router,
    public route: ActivatedRoute,
    public dialogService: IonicDialogService,
    public translate: TranslateService,
    public location: Location,
    private injector: Injector,
    private formlyJsonschema: FormlyJsonschema,
  ) {

    const SERVICE_TOKEN = route.snapshot.data['requiredService'];
    this.modelService = this.injector.get<U>(<any>SERVICE_TOKEN);

    this.modelService = this.injector.get<U>(<any>SERVICE_TOKEN);
    this.confirmQuestion = this.translate.instant('General.Discard.Question');
    this.confirmButton = this.translate.instant('General.Discard.ConfirmButton');
    this.saveMessage = this.translate.instant('General.Save.Message');
  }

  ionViewWillLeave() {
    this.options.resetModel()
    this.baseForm.reset();
  }

  public afterSave(model: T): Observable<T> {
    return new Observable((observer) => {
      observer.next(model);
      observer.complete();
    });
  }

  public beforeSave(model: T): Observable<T> {
    return new Observable((observer) => {
      observer.next(model);
      observer.complete();
    });
  }

  ngOnInit() {
    this.initForm();
  }
  initForm(customInclude: string = '', newModelId: string = null, model: T = null) {
    if (model === null) {
      this.modelId = this.route.snapshot.paramMap.get('id') ?? newModelId;
      this.isEdit = false;
      if (this.modelId) {
        this.modelService.get(this.modelId, customInclude).subscribe((value: T) => {
          this.isEdit = true;
          this.generateForm(value)
        }
        );
      } else {
        if (this.changeUrlRoute) {
          const addUrl = this.router.createUrlTree([]).toString();
          this.editRoute = this.router.createUrlTree([addUrl.replace('add', 'edit')]).toString();
        }
        // }
        this.generateForm(this.modelService.newModel());
      }
    } else {
      this.modelId = model.id;
      this.isEdit = true;
      this.generateForm(model)
    }
  }
  generateForm(model?: T) {
    this.isLoading = false;
    this.modelId = model.id;
    this.model = model;
    this.origModel = _.cloneDeep(model);;
    this.title = this.model.modelConfig.formTitle
    this.baseForm = new UntypedFormGroup({});//= this.modelService.toFormGroup(this.fb, model);
    this.afterFormGenerated();
    this.fields = this.modelService.getFormlyFields(this.model)
  }
  public afterFormGenerated() {

  }
  private getFromGroup(formGroup: UntypedFormGroup | string = null): UntypedFormGroup {
    if (!formGroup)
      return this.baseForm;
    if (formGroup instanceof UntypedFormGroup)
      return formGroup;
    return this.baseForm.controls[formGroup] as UntypedFormGroup;
  }
  validateAllFormFields(formGroup: UntypedFormGroup | string = null) {
    const fg = this.getFromGroup(formGroup)
    Object.keys(fg.controls).forEach(field => {
      // console.log(field);
      const control = fg.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  isFieldValid(field: string, formGroup: UntypedFormGroup | string = null) {
    const fg = this.getFromGroup(formGroup)
    const filedControl = fg.get(field)
    return !filedControl.valid && filedControl.touched;
  }

  isFieldValidFromArray(arrayIndex: number, field: string, arrayName: string = 'formArray') {
    const fieldControl = this.baseForm.get(arrayName).get([arrayIndex]).get(field)
    return !fieldControl.valid && fieldControl.touched;
  }

  displayFieldCss(field: string) {
    return {
      'has-error': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field)
    };
  }
  onCancel() {
    this.router.navigate([this.cancelRoute]);
  }
  onSave() {
    this.saveModel(this.baseForm)
  }
  onSubmit(model) {
    this.saveModel(this.baseForm)
  }

  saveModel(formGroup: UntypedFormGroup | string = null) {
    const fg = this.getFromGroup(formGroup)
    const that = this;
    if (fg) {
      if (fg.valid) {
        this.beforeSave(this.model).subscribe(_ => {
          this.modelService.save(this.model, this.modelId, this.origModel).subscribe(
            (newModel: T) => {
              this.model = newModel;
              this.modelId = newModel.id;
              if (this.editRoute) {
                this.isEdit = true;
                if (this.changeUrlRoute) {
                  const url = this.router.createUrlTree([this.editRoute, this.modelId]).toString();
                  this.location.replaceState(url);
                }
              }
              this.afterSave(newModel).subscribe((val: T) => {
                from(this.dialogService.showSaveMessage(this.saveMessage)).subscribe(d => {
                  this.options.updateInitialValue()
                  fg.markAsPristine();
                });
              });
            },
            err => {
              this.serverErrors(err)
            });
        });
      } else {
        this.validateAllFormFields(formGroup);
      }
    }
  }
  serverErrors(err: any) {
    if (err.error) {
      if (err.error.errors) {
        const validationErrors = err.error.errors;
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach(prop => {
            const formControl = this.baseForm.get(this.firstCharToLowerCase(prop));
            if (formControl) {
              // activate the error message
              formControl.setErrors({
                serverError: { message: validationErrors[prop].join('\n') }
              });
            }
          });
        } else {
          const keys = Object.keys(validationErrors);
          keys.forEach(prop => {
            const formControl = this.baseForm.get(this.firstCharToLowerCase(prop));
            if (formControl) {
              // activate the error message
              formControl.setErrors({
                serverError: { message: validationErrors[prop].join('\n') }
              });
            }
          });
        }
      }
    }
  }
  private firstCharToLowerCase(str: string): string {
    if (str.length === 0) {
      return str; // Return an empty string if the input is empty
    }

    const firstChar = str.charAt(0).toLowerCase();
    const restOfString = str.slice(1);

    return firstChar + restOfString;
  }
  async canDeactivate(): Promise<boolean> {
    if (!this.baseForm.dirty) {
      return true;
    }
    var result = await this.dialogService.confirm(this.confirmQuestion, null, this.confirmButton)
    return result;
  }
  getFiledName(filedTranslationKey: string) {
    return { field: this.translate.instant(filedTranslationKey) };
  }
  getCustomErrorMessage(error: any, fieldLabel: string): string {
    return '';
  }
  getErrorMessageFromArray(arrayIndex: number, field: string, filedTranslationKey: string, arrayName: string = 'formArray'): string {
    const fieldControl = this.baseForm.get(arrayName).get([arrayIndex]).get(field)
    return this.getErrorMessageForField(fieldControl, filedTranslationKey)
  }
  getErrorMessage(field: string, filedTranslationKey: string, formGroup: UntypedFormGroup | string = null): string {
    const fg = this.getFromGroup(formGroup)
    return this.getErrorMessageForField(fg.get(field), filedTranslationKey)
  }
  getErrorMessageForField(fieldControl: any, filedTranslationKey: string): string {
    const error = fieldControl.errors;
    const fieldLabel = this.translate.instant(filedTranslationKey);
    let rvalue = '';
    if (error !== null) {
      if (error['required'] === true) {
        rvalue = this.translate.instant('General.Field.Required', { field: fieldLabel });
      }
      if (error['minlength']) {
        rvalue = this.translate.instant('General.Field.MinLength', { field: fieldLabel, requiredLength: error.minlength.requiredLength });
      }
      if (error['email'] === true) {
        rvalue = this.translate.instant('General.Field.InvalidEmail');
      }
      if (error['url'] === true) {
        rvalue = this.translate.instant('General.Field.InvalidUrl');
      }
      if (error['serverError']) {
        rvalue = error['serverError'];
      }
      if (rvalue === '') {
        rvalue = this.getCustomErrorMessage(error, fieldLabel);
      }
    }
    return rvalue;
  }
}
