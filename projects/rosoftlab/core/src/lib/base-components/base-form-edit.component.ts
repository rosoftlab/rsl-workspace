import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { BaseModel } from '../models/base.model';
import { BaseService } from '../services/base.service';
import { DialogService } from '../services/dialog.service';
@Component({
  selector: 'app-base.form.edit',
  template: ''
})
export abstract class BaseFormEditComponent<T extends BaseModel> implements OnInit {
  baseForm: UntypedFormGroup;
  modelId: string;
  model: T;
  isEdit: boolean;
  isLoading = true;
  cancelRoute: string;
  editRoute: string;
  public changeUrlRoute: boolean = true;
  constructor(
    protected fb: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected modelService: BaseService<T>,
    protected dialogService: DialogService,
    protected translate: TranslateService,
    protected location: Location
  ) {
    this.generateForm(this.modelService.newModel());
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
    this.baseForm = this.modelService.toFormGroup(this.fb, model);
    this.afterFormGenerated();
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
  saveModel(formGroup: UntypedFormGroup | string = null) {
    const fg = this.getFromGroup(formGroup)
    const that = this;
    if (fg) {
      if (fg.valid) {
        this.beforeSave(this.model).subscribe(_ => {
          this.modelService.save(this.baseForm, this.modelId, this.model).subscribe(
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
                this.dialogService.showSaveMessage('Your changes were saved successfully.').subscribe(d => {
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
            const formControl = this.baseForm.get(prop);
            if (formControl) {
              // activate the error message
              formControl.setErrors({
                serverError: validationErrors[prop].join('\n')
              });
            }
          });
        } else {
          const keys = Object.keys(validationErrors);
          keys.forEach(prop => {
            const formControl = this.baseForm.get(prop);
            if (formControl) {
              // activate the error message
              formControl.setErrors({
                serverError: validationErrors[prop].join('\n')
              });
            }
          });
        }
      }
    }
  }
  canDeactivate(): Observable<boolean> | boolean {
    // Allow synchronous navigation (`true`) if no crisis or the crisis is unchanged
    if (!this.baseForm.dirty) {
      return true;
    }
    // Otherwise ask the user with the dialog service and return its
    // observable which resolves to true or false when the user decides
    return this.dialogService.confirm('Discard changes ?', null, 'Discard');
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
