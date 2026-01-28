import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, FormsModule, KENDO_TEXTBOX],
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
  nextRunTitle = '';
  error = '';

  private onChange = (value: string) => { };
  private onTouched = () => { };

  fieldLabels = ['minut', 'ora', 'zi (luna)', 'luna', 'zi (saptamana)'];
  fieldHelpTables = [
    [
      ['*', 'orice valoare'],
      [',', 'separator liste valori'],
      ['-', 'camp de valori'],
      ['/', 'valori pas'],
      ['0–59', 'valori acceptate'],
    ],
    [
      ['*', 'orice valoare'],
      [',', 'separator liste valori'],
      ['-', 'camp de valori'],
      ['/', 'valori pas'],
      ['0–23', 'valori acceptate'],
    ],
    [
      ['*', 'orice valoare'],
      [',', 'separator liste valori'],
      ['-', 'camp de valori'],
      ['/', 'valori pas'],
      ['1–31', 'valori acceptate'],
    ],
    [
      ['*', 'orice valoare'],
      [',', 'separator liste valori'],
      ['-', 'camp de valori'],
      ['/', 'valori pas'],
      ['1–12', 'valori acceptate'],
      ['JAN–DEC', 'valori unitare alternative'],
    ],
    [
      ['*', 'orice valoare'],
      [',', 'separator liste valori'],
      ['-', 'camp de valori'],
      ['/', 'pas valori'],
      ['0–6', 'valori acceptate'],
      ['SUN–SAT', 'valori unitare alternative'],
      ['7', 'duminica (non-standard)'],
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
      this.description = cronstrue.toString(cron, { locale: 'ro' });
      const interval = CronExpressionParser.parse(cron);
      this.nextRunTitle = interval.next().toString();
      this.nextRun = this.translate(this.nextRunTitle);
      this.error = '';
    } catch (err: any) {
      this.description = '';
      this.nextRun = '';
      this.nextRunTitle = '';
      this.error = err.message;
    }
  }
  focusInput(index: number) {
    const input = this.inputs.toArray()[index];
    if (input) {
      input.nativeElement.focus();
    }
  }
  
  // cron datetime translate function
  private translate(dateStr: string) {
    const days = { Sun: 'Dum', Mon: 'Lun', Tue: 'Mar', Wed: 'Mie', Thu: 'Joi', Fri: 'Vin', Sat: 'Sâm' } as const;
    const months = { Jan: 'Ian', Feb: 'Feb', Mar: 'Mar', Apr: 'Apr', May: 'Mai', Jun: 'Iun', Jul: 'Iul', Aug: 'Aug', Sep: 'Sep', Oct: 'Oct', Nov: 'Noi', Dec: 'Dec' } as const;
    const timezones: Record<string, string> = {'Eastern European Summer Time': 'Ora de vară a Europei de Est', 'Eastern European Standard Time': 'Ora standard a Europei de Est'};
    const dayAbbr = dateStr.slice(0, 3) as keyof typeof days;
    const monthAbbr = dateStr.slice(4, 7) as keyof typeof months;
    const rest = dateStr.slice(7);
    const timezoneMatch = dateStr.match(/\(([^)]+)\)/);
    const timezoneFull = timezoneMatch ? timezoneMatch[1] : '';
    const translated = `${days[dayAbbr]} ${months[monthAbbr]}${rest}`;

    if (timezoneFull && timezones[timezoneFull]) {
      return translated.replace(timezoneFull, timezones[timezoneFull]);
    }

    return translated;
  }
}
