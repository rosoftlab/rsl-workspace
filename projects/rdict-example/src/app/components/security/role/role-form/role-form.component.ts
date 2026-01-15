import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { TranslateService } from '@ngx-translate/core';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
import { KENDO_INPUTS } from '@progress/kendo-angular-inputs';
import { KENDO_LABEL, KENDO_LABELS } from '@progress/kendo-angular-label';
import { KENDO_TOOLBAR } from '@progress/kendo-angular-toolbar';
import { KENDO_TREEVIEW } from '@progress/kendo-angular-treeview';
import { SVGIcon, arrowLeftIcon, saveIcon } from '@progress/kendo-svg-icons';
import { Right, Role, RoleService } from '@rosoftlab/core';
import { Observable } from 'rxjs';
export interface MenuItemDto {
  id: string;
  parentId?: string | null;
  name: string;
  order?: number | null;

  // whatever else you have:
  pagePath?: string;
  icon?: string;
  isMenu?: boolean;
  rightKey?: string;
  resourceName?: string;
  color?: string;
}

export type RightTreeNode = Right & { items?: RightTreeNode[] };
/**
 * Build hierarchical tree from a flat list using parentId.
 * Sorts siblings by `order` (and name as a stable fallback).
 */

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    FormlyModule,
    ReactiveFormsModule,
    FormlyKendoModule,
    KENDO_TREEVIEW,
    KENDO_TOOLBAR,
    KENDO_LABEL,
    KENDO_BUTTONS,
    KENDO_DIALOG,
    KENDO_INPUTS,
    KENDO_LABELS
  ]
})
export class RoleFormComponent implements OnInit {
  public fields: FormlyFieldConfig[] = [
    {
      key: 'id', // The role ID field (hidden or visible)
      type: 'input',
      templateOptions: { type: 'hidden' }
    },
    {
      key: 'name',
      type: 'input',
      className: 'name',
      props: {
        label: 'General.Name',
        translate: true,
        required: true
      }
    },
    {
      key: 'roleDetail', // The TreeView will bind to this key
      type: 'kendo-treeview',
      props: {
        label: 'Drepturi',
        translate: true,
      }
    }
  ];
  options: FormlyFormOptions = {};
  baseForm: FormGroup = new FormGroup({});
  modelId: string;
  model: Role;
  original_model: Role;
  isEdit: boolean;
  isLoading = true;
  cancelRoute: string;
  editRoute: string;
  public changeUrlRoute: boolean = true;

  public saveIcon: SVGIcon = saveIcon;
  public backIcon: SVGIcon = arrowLeftIcon;

  constructor(
    protected fb: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected modelService: RoleService,

    protected translate: TranslateService,
    protected location: Location
  ) {}
  ngOnInit() {
    this.initForm();
  }
  initForm(customInclude: string = '', newModelId: string = null, model: Role = null) {
    if (model === null) {
      this.modelId =this.route.snapshot.paramMap.get('id') ?? newModelId;
      // this.modelId = '8a4f1e95-9efc-4622-9103-cb790c5db734';
      ////Employee
      // this.modelId = '954904d8-8e0a-490c-ad0d-ccc038f5bd03'; //

      this.isEdit = false;
      if (this.modelId) {
        this.modelService.get(this.modelId, 'RoleDetail').subscribe((value: Role) => {
          this.isEdit = true;
          this.original_model =this.modelService.newModel(JSON.parse(JSON.stringify(value)));
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
      this.modelId = model.id;
      this.isEdit = true;
      this.generateForm(model);
    }
  }

  generateForm(model?: Role) {
    this.isLoading = false;
    this.modelId = model.id;
    this.model = model;
    // this.baseForm = this.modelService.toFormGroup(this.fb, model);
    this.afterFormGenerated();
  }
  public afterFormGenerated() {}

  onSubmit(model) {
    // this.saveModel(this.baseForm)
  }

  saveModel(formGroup: FormGroup | string = null) {
    const fg = this.getFromGroup(formGroup);
    const that = this;
    if (fg) {
      if (fg.valid) {
        this.beforeSave(this.model).subscribe((_) => {
          this.modelService.save(this.model, this.modelId, this.original_model).subscribe({
            next: (newModel: Role) => {
              this.model = newModel;
              this.modelId = newModel.id;
              if (this.editRoute) {
                this.isEdit = true;
                // if (this.changeUrlRoute) {
                //   const url = this.router.createUrlTree([this.editRoute, this.modelId]).toString();
                //   this.location.replaceState(url);
                // }
              }
              // this.afterSave(newModel).subscribe((val: T) => {
              //   this.dialogService.showSaveMessage('Your changes were saved successfully.').subscribe((d) => {
              //     fg.markAsPristine();
              //   });
              // });
            },
            error: (err) => {
              this.serverErrors(err);
            }
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
  isFieldValid(field: string, formGroup: FormGroup | string = null) {
    const fg = this.getFromGroup(formGroup);
    const filedControl = fg.get(field);
    return !filedControl.valid && filedControl.touched;
  }

  isFieldValidFromArray(arrayIndex: number, field: string, arrayName: string = 'formArray') {
    const fieldControl = this.baseForm.get(arrayName).get([arrayIndex]).get(field);
    return !fieldControl.valid && fieldControl.touched;
  }
  public afterSave(model: Role): Observable<Role> {
    return new Observable((observer) => {
      observer.next(model);
      observer.complete();
    });
  }

  public beforeSave(model: Role): Observable<Role> {
    return new Observable((observer) => {
      observer.next(model);
      observer.complete();
    });
  }
  private getFromGroup(formGroup: FormGroup | string = null): FormGroup {
    if (!formGroup) return this.baseForm;
    if (formGroup instanceof FormGroup) return formGroup;
    return this.baseForm.controls[formGroup] as FormGroup;
  }
  public onSave() {
    this.saveModel(this.baseForm);
  }
  onBack() {}
}
