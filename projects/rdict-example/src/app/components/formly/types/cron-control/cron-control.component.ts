
import {
  Component,
  ElementRef,
  forwardRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { KENDO_TEXTBOX } from '@progress/kendo-angular-inputs';
import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue/i18n';

@Component({
  selector: 'app-cron-control',
  standalone: true,
  imports: [FormsModule, KENDO_TEXTBOX],
  templateUrl: './cron-control.component.html',
  styleUrls: ['./cron-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CronControlComponent),
      multi: true,
    },
  ],
})
export class CronControlComponent implements ControlValueAccessor {
  @ViewChildren('inputRef') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  cronParts: string[] = ['*', '*', '*', '*', '*'];
  activeIndex = 0;
  description = '';
  nextRun = '';
  error = '';

  private onChange = (value: string) => {};
  private onTouched = () => {};

  fieldLabels = ['minute', 'hour', 'day (month)', 'month', 'day (week)'];
  fieldHelpTables = [
    [
      ['*', 'any value'],
      [',', 'value list separator'],
      ['-', 'range of values'],
      ['/', 'step values'],
      ['0–59', 'allowed values'],
    ],
    [
      ['*', 'any value'],
      [',', 'value list separator'],
      ['-', 'range of values'],
      ['/', 'step values'],
      ['0–23', 'allowed values'],
    ],
    [
      ['*', 'any value'],
      [',', 'value list separator'],
      ['-', 'range of values'],
      ['/', 'step values'],
      ['1–31', 'allowed values'],
    ],
    [
      ['*', 'any value'],
      [',', 'value list separator'],
      ['-', 'range of values'],
      ['/', 'step values'],
      ['1–12', 'allowed values'],
      ['JAN–DEC', 'alternative single values'],
    ],
    [
      ['*', 'any value'],
      [',', 'value list separator'],
      ['-', 'range of values'],
      ['/', 'step values'],
      ['0–6', 'allowed values'],
      ['SUN–SAT', 'alternative single values'],
      ['7', 'sunday (non-standard)'],
    ],
  ];

  writeValue(value: string): void {
    this.cronParts = (value || '* * * * *').trim().split(' ').slice(0, 5);
    this.updateDescription(this.cronParts.join(' '));
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // could implement disable logic if needed
  }

  setPart(index: number, value: string) {
    this.cronParts[index] = value;
    this.activeIndex = index;
    const joined = this.cronParts.join(' ');
    this.updateDescription(joined);
    this.onChange(joined);
    this.onTouched();
  }

  onFocus(index: number) {
    this.activeIndex = index;
  }

  updateDescription(cron: string) {
    try {
      this.description = cronstrue.toString(cron, { locale: 'en' });
      const interval = CronExpressionParser.parse(cron);
      this.nextRun = interval.next().toString();
      this.error = '';
    } catch (err: any) {
      this.description = '';
      this.nextRun = '';
      this.error = err.message;
    }
  }
  focusInput(index: number) {
    const input = this.inputs.toArray()[index];
    if (input) {
      input.nativeElement.focus();
    }
  }
}
