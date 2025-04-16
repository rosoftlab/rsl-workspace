import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { FieldType } from "@ngx-formly/core";
import { KENDO_BUTTON } from "@progress/kendo-angular-buttons";
import { KENDO_DATEPICKER, KENDO_DATETIMEPICKER } from "@progress/kendo-angular-dateinputs";
import { KENDO_CHECKBOX, KENDO_FORMFIELD, KENDO_TEXTBOX } from "@progress/kendo-angular-inputs";
import { KENDO_LABEL } from "@progress/kendo-angular-label";
import { EditMode, KENDO_SCHEDULER, SchedulerEvent } from "@progress/kendo-angular-scheduler";
@Component({
  selector: 'formly-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // KENDO_SCHEDULER,
    KENDO_LABEL,
    KENDO_BUTTON,
    KENDO_FORMFIELD,
    KENDO_DATEPICKER,
    KENDO_DATETIMEPICKER,
    KENDO_TEXTBOX,
    KENDO_CHECKBOX,
    KENDO_SCHEDULER
  ]
})
export class SchedulerComponent extends FieldType {

  public selectedDate: Date = new Date("2018-10-22T00:00:00");
  public events: SchedulerEvent[] = [
    {
      id: 1,
      title: "Breakfast",
      start: new Date("2018-10-22T09:00:00"),
      end: new Date("2018-10-22T09:30:00"),
      recurrenceRule: "FREQ=DAILY;COUNT=5;",
    },
  ];

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

  constructor(public formBuilder: FormBuilder) {
    super();
  }

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
  get formGroup(): FormGroup {
    //console.log(this.formControl);
    // console.log(this.formControl as FormGroup);
    return this.formControl as FormGroup;
  }
  ngOnInit() {
    this.formGroup.addControl('Start', new FormControl(new Date(), Validators.required));
    this.formGroup.addControl('End', new FormControl(new Date(), Validators.required));
    this.formGroup.addControl('StartTimezone', new FormControl());
    this.formGroup.addControl('EndTimezone', new FormControl());
    this.formGroup.addControl('IsAllDay', new FormControl(false));
    this.formGroup.addControl('Title', new FormControl(""));
    this.formGroup.addControl('Description', new FormControl(""));
    this.formGroup.addControl('RecurrenceRule', new FormControl());
    this.formGroup.addControl('RecurrenceID', new FormControl());
    // console.log(this.formGroup);

  }
  addControl(controlName: string, initialValue: any = '', validators: any[] = []) {
    this.formGroup.addControl(controlName, this.formBuilder.control(initialValue, validators));
  }
  isAllDay() {
    return this.formGroup.get('IsAllDay');
  }
}
