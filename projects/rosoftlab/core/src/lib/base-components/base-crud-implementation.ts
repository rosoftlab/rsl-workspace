import { Location } from '@angular/common';
import { Directive, HostBinding, inject, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { DIALOG_SERVICE_TOKEN } from '../interfaces/dialog.interface';
import { MODEL_SERVICE, MODEL_TOKEN } from '../tokens/table-tokens';

@Directive()
export abstract class BaseCrudImplementation<T = any> {
  // Access the Router without a constructor
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected translate = inject(TranslateService);
  protected location = inject(Location);
  // Common Dependency Injection
  protected modelService = inject(MODEL_SERVICE, { optional: true });
  protected modelToken = inject(MODEL_TOKEN, { optional: true });
  protected dialogService = inject(DIALOG_SERVICE_TOKEN, { optional: true });

  @Input() model: T | null = null;
  @Input() modelName: string | null = null;
  @Input() dictPath: string | null = null; //rdict
  @Input() fileLayout: string = ''; //rdict
  @Input() idProperty: string = 'id';
  @Input() customInclude: string = null;
  @Input() changeUrlRoute: boolean = true;
  @Input() hostClass: string = '';

  public basePath: string = '';
  public title: string = '';

  protected baseForm = new FormGroup({});
  protected modelId: string;
  protected isEdit: boolean;
  protected isLoading = true;
  protected cancelRoute: string;
  protected editRoute: string;

  ngOnInit(): void {}
  @HostBinding('class')
  get hostClasses(): string {
    return this.hostClass;
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
  protected getFromGroup(formGroup: FormGroup | string = null): FormGroup {
    if (!formGroup) return this.baseForm;
    if (formGroup instanceof FormGroup) return formGroup;
    return this.baseForm.controls[formGroup] as FormGroup;
  }
  validateAllFormFields(formGroup: FormGroup | string = null) {
    const fg = this.getFromGroup(formGroup);
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
  canDeactivate(): Observable<boolean> | boolean {
    // Allow synchronous navigation (`true`) if no crisis or the crisis is unchanged
    if (!this.baseForm.dirty) {
      return true;
    }
    // Otherwise ask the user with the dialog service and return its
    // observable which resolves to true or false when the user decides
    return this.dialogService.confirm(this.translate.instant('General.DiscardChanges'), null, 'Discard');
  }
  getFiledName(filedTranslationKey: string) {
    return { field: this.translate.instant(filedTranslationKey) };
  }
  serverErrors(err: any) {
    if (err.error) {
      if (err.error.errors) {
        const validationErrors = err.error.errors;
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((prop) => {
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
          keys.forEach((prop) => {
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
}
