// src/app/shared/services/date-filter.service.ts
import { Injectable } from '@angular/core';

export interface UtcDayRange {
  startUtc: string;
  endUtc: string;
  sourceTimeZone: string;
}

@Injectable({ providedIn: 'root' })
export class DateFilterService {

  /**
   * Builds a UTC day range from a date selected in a source timezone.
   * If no timezone is provided, the browser timezone is used.
   */
  getUtcDayRange(
    date: Date | string | number,
    sourceTimeZone?: string
  ): UtcDayRange {
    const d = this.toDate(date);
    const tz = sourceTimeZone ?? this.getBrowserTimeZone();

    // Build "local day" boundaries in source TZ
    const localStart = this.zonedDate(d, tz, 0, 0, 0);
    const localEnd   = this.zonedDate(d, tz, 23, 59, 59);

    return {
      startUtc: this.formatUtc(localStart),
      endUtc: this.formatUtc(localEnd),
      sourceTimeZone: tz,
    };
  }

  /**
   * Builds your API filter string:
   * timeBETWEEN<startUtc>..<endUtc>
   */
  buildBetweenUtcDay(
    field: string,
    date: Date | string | number,
    sourceTimeZone?: string
  ): string {
    const { startUtc, endUtc } = this.getUtcDayRange(date, sourceTimeZone);
    return `${field}BETWEEN${startUtc}..${endUtc}`;
  }

  /**
   * Returns the browser timezone (IANA)
   * e.g. "Europe/Bucharest"
   */
  getBrowserTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  // ---------- Internals ----------

  /**
   * Creates a Date that represents the given Y/M/D at H:M:S
   * in the source timezone, then returns the equivalent UTC instant.
   */
  private zonedDate(
    base: Date,
    timeZone: string,
    h: number,
    m: number,
    s: number
  ): Date {
    const y = base.getFullYear();
    const mo = base.getMonth();
    const d = base.getDate();

    // Create date as if in local browser TZ first
    const local = new Date(y, mo, d, h, m, s);

    // Convert to UTC instant by removing source TZ offset
    const tzOffset = this.getTimeZoneOffset(local, timeZone);
    return new Date(local.getTime() - tzOffset);
  }

  /**
   * Returns timezone offset in milliseconds for a given date & timezone
   */
  private getTimeZoneOffset(date: Date, timeZone: string): number {
    const locale = date.toLocaleString('en-US', { timeZone });
    const tzDate = new Date(locale);
    return date.getTime() - tzDate.getTime();
  }

  private formatUtc(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return (
      `${d.getUTCFullYear()}-` +
      `${p(d.getUTCMonth() + 1)}-` +
      `${p(d.getUTCDate())}T` +
      `${p(d.getUTCHours())}:` +
      `${p(d.getUTCMinutes())}:` +
      `${p(d.getUTCSeconds())}`
    );
  }

  private toDate(value: Date | string | number): Date {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) {
      throw new Error(`DateFilterService: invalid date value: ${String(value)}`);
    }
    return d;
  }
}
