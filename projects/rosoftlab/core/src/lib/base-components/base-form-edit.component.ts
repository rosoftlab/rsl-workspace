import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { BaseModel } from '../models/base.model';
import { BaseService } from '../services/base.service';
import { DialogService } from '../services/dialog.service';
@Component({
  selector: 'app-base.form.edit',
  template: ''
})
export abstract class BaseFormEditComponent<T extends BaseModel> implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  baseForm: FormGroup;
  modelId: string;
  model: T;
  isEdit: boolean;
  isLoading = true;
  cancelRoute: string;
  editRoute: string;
  constructor(
    protected fb: FormBuilder,
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
  initForm(customInclude: string = '', newModelId: string = null) {
    this.modelId = this.route.snapshot.paramMap.get('id') ?? newModelId;
    this.isEdit = false;
    if (this.modelId) {
      this.modelService.get(this.modelId, customInclude).subscribe((value: T) => {
        this.isEdit = true;
        this.generateForm(value)
      }
      );
    } else {
      const addUrl = this.router.createUrlTree([]).toString();
      this.editRoute = this.router.createUrlTree([addUrl.replace('add', 'edit')]).toString();
      this.generateForm(this.modelService.newModel());
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
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      // console.log(field);
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }
  displayFieldCss(form: FormGroup, field: string) {
    return {
      'has-error': this.isFieldValid(form, field),
      'has-feedback': this.isFieldValid(form, field)
    };
  }
  onCancel() {
    this.router.navigate([this.cancelRoute]);
  }
  onSave() {
    const that = this;
    if (this.baseForm) {
      if (this.baseForm.valid) {
        that.blockUI.start('Saving ...');
        this.beforeSave(this.model).subscribe(_ => {
          this.modelService.save(this.baseForm, this.modelId, this.model).subscribe(
            (newModel: T) => {
              this.model = newModel;
              this.modelId = newModel.id;
              if (this.editRoute) {
                this.isEdit = true;
                const url = this.router.createUrlTree([this.editRoute, this.modelId]).toString();
                // this.router.navigateByUrl(url, { skipLocationChange: false, replaceUrl: true })
                this.location.replaceState(url);
              }
              this.afterSave(newModel).subscribe((val: T) => {
                this.blockUI.stop();
                this.dialogService.showSaveMessage('Your changes were saved successfully.').subscribe(d => {
                  this.baseForm.markAsPristine();
                });
              });
            },
            err => {
              this.serverErrors(err)
              this.blockUI.stop();
            });
        });
      } else {
        this.validateAllFormFields(this.baseForm);
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
  getErrorMessage(field: string, filedTranslationKey: string): string {
    const error = this.baseForm.get(field).errors;
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
