
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CreateFormGroupArgs, EditMode, KENDO_SCHEDULER, SchedulerEvent } from '@progress/kendo-angular-scheduler';
@Component({
    selector: 'app-data-scheduler',
    templateUrl: './data-scheduler.component.html',
    styleUrls: ['./data-scheduler.component.scss'],
    imports: [
    FormsModule,
    KENDO_SCHEDULER
]
})
export class DataSchedulerComponent {
  public selectedDate: Date = new Date("2024-12-22T00:00:00");
  public formGroup: FormGroup;
  public events: SchedulerEvent[] = [
    {
      id: 1,
      title: "Import 1",
      start: new Date("2024-12-22T11:00:00"),
      end: new Date("2024-12-22T11:30:00"),
      recurrenceRule: "FREQ=DAILY;",
    },
  ];

  constructor(private formBuilder: FormBuilder) {
    this.createFormGroup = this.createFormGroup.bind(this);
  }

  public createFormGroup(args: CreateFormGroupArgs): FormGroup {
    const dataItem = args.dataItem;
    const isOccurrence = args.mode === (EditMode.Occurrence as any);
    const exceptions = isOccurrence ? [] : dataItem.recurrenceExceptions;

    this.formGroup = this.formBuilder.group(
      {
        id: args.isNew ? this.getNextId() : dataItem.id,
        start: [dataItem.start, Validators.required],
        end: [dataItem.end, Validators.required],
        startTimezone: [dataItem.startTimezone],
        endTimezone: [dataItem.endTimezone],
        isAllDay: dataItem.isAllDay,
        title: dataItem.title,
        description: dataItem.description,
        recurrenceRule: dataItem.recurrenceRule,
        recurrenceId: dataItem.recurrenceId,
        recurrenceExceptions: [exceptions],
      },
      {
        validator: this.startEndValidator,
      }
    );

    return this.formGroup;
  }

  public getNextId(): number {
    const len = this.events.length;

    return len === 0 ? 1 : this.events[this.events.length - 1].id + 1;
  }

  public startEndValidator: ValidatorFn = (fg: FormGroup) => {
    const start = fg.get("start").value;
    const end = fg.get("end").value;

    if (start !== null && end !== null && start.getTime() < end.getTime()) {
      return null;
    } else {
      return { range: "End date must be greater than Start date" };
    }
  };

}
