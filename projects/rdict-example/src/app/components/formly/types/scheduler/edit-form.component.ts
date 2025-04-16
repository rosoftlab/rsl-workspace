import { CommonModule } from "@angular/common";
import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation,
} from "@angular/core";
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { KENDO_BUTTON } from "@progress/kendo-angular-buttons";
import { KENDO_FORMFIELD, KENDO_TEXTBOX } from "@progress/kendo-angular-inputs";
import { KENDO_DATE } from "@progress/kendo-angular-intl";
import { KENDO_LABEL } from "@progress/kendo-angular-label";
import { EditMode } from "@progress/kendo-angular-scheduler";

@Component({
    selector: "scheduler-edit-form",
    encapsulation: ViewEncapsulation.None,
    styles: [
        `
        #eventForm {
          max-width: 400px;
        }
      `,
    ],
    template: `
      <div *ngIf="active">
        <form
          novalidate
          [formGroup]="editForm"
          class="k-form k-form-md"
          id="eventForm"
        >
          <fieldset class="k-form-fieldset">
            <legend class="k-form-legend">
              {{ isNew ? "Add New Event" : "Edit Event" }}
            </legend>
            <kendo-formfield>
              <kendo-label
                [for]="title"
                text="Title"
                labelCssClass="k-form-label"
              ></kendo-label>
              <kendo-textbox #title placeholder="Title" formControlName="Title" />
            </kendo-formfield>
            <kendo-formfield>
              <kendo-label
                [for]="datepickerstart"
                text="Start"
                labelCssClass="k-form-label"
              ></kendo-label>
              <kendo-datepicker
                *ngIf="editForm.controls.IsAllDay.value"
                #datepickerstart
                formControlName="Start"
              ></kendo-datepicker>
              <kendo-datetimepicker
                *ngIf="!editForm.controls.IsAllDay.value"
                #datepickerstart
                formControlName="Start"
              ></kendo-datetimepicker>
            </kendo-formfield>
            <kendo-formfield>
              <kendo-label
                [for]="datepickerend"
                text="End"
                labelCssClass="k-form-label"
              ></kendo-label>
              <kendo-datepicker
                *ngIf="editForm.controls.IsAllDay.value"
                #datepickerend
                formControlName="End"
              ></kendo-datepicker>
              <kendo-datetimepicker
                *ngIf="!editForm.controls.IsAllDay.value"
                #datepickerend
                formControlName="End"
              ></kendo-datetimepicker>
            </kendo-formfield>
            <kendo-formfield>
              <ng-container>
                <span class="k-checkbox-wrap">
                  <input
                    id="k-is-allday-chkbox"
                    type="checkbox"
                    kendoCheckBox
                    formControlName="IsAllDay"
                  />
                </span>
                <label
                  [labelClass]="false"
                  class="k-checkbox-label"
                  for="k-is-allday-chkbox"
                  >All Day Event</label
                >
              </ng-container>
            </kendo-formfield>
            <div>
              <kendo-recurrence-editor
                *ngIf="isEditingSeries"
                formControlName="RecurrenceRule"
              ></kendo-recurrence-editor>
            </div>
          </fieldset>
          <div class="k-form-buttons">
            <button
              kendoButton
              [disabled]="!editForm.valid"
              [primary]="true"
              (click)="onSave($event)"
            >
              Save
            </button>
            <button kendoButton (click)="onCancel($event)">Cancel</button>
          </div>
        </form>
      </div>
    `,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        // KENDO_SCHEDULER,
        KENDO_LABEL,
        KENDO_BUTTON,
        KENDO_FORMFIELD,
        KENDO_DATE,
        KENDO_TEXTBOX
    ]
})
export class SchedulerEditFormComponent {
    @Input()
    public isNew = false;

    @Input()
    public editMode: EditMode;

    @Input()
    public set event(ev: any) {
        if (ev !== undefined) {
            this.editForm.reset(ev);
            this.active = true;
        }
    }

    @Output()
    public cancel: EventEmitter<any> = new EventEmitter();

    @Output()
    public save: EventEmitter<any> = new EventEmitter();

    public active = false;

    public editForm = new FormGroup({
        Title: new FormControl("", Validators.required),
        Start: new FormControl("", Validators.required),
        End: new FormControl("", Validators.required),
        IsAllDay: new FormControl(false),
        RecurrenceRule: new FormControl(),
        RecurrenceID: new FormControl(),
    });

    public get isEditingSeries(): boolean {
        return this.editMode === EditMode.Series;
    }

    constructor(public formBuilder: FormBuilder) { }

    public onSave(e: MouseEvent): void {
        e.preventDefault();
        this.active = false;

        this.save.emit(this.editForm.value);
    }

    public onCancel(e: MouseEvent): void {
        e.preventDefault();
        this.active = false;

        this.cancel.emit();
    }
}
