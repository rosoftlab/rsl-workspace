import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { KENDO_GRID } from '@progress/kendo-angular-grid';
import { ReactiveDictionary } from '@rosoftlab/rdict';

/* ========= RAW SERVER ROW ========= */
export interface ServerRow {
  day: string; // 'YYYY-MM-DD'
  entity_id: number;
  data_source_id: number;
  data_type_id: number;
  slot_count: number;
  time_added: string; // ISO
}

/* ========= GRID MODELS ========= */
interface DetailDataTypeRow {
  data_type_id: number;
  slot_count: number; // summed per data_type_id
  time_added: string; // latest per data_type_id
}

interface TopRow {
  day: string;
  data_source_id: number;
  slot_count_sum: number; // summed per day+data_source_id
  time_added: string; // latest per day+data_source_id
  types: DetailDataTypeRow[];
}

@Component({
  selector: 'app-dashboard-grid',
  standalone: true,
  imports: [CommonModule, KENDO_GRID],
  templateUrl: './dashboard-grid.component.html',
  styleUrls: ['./dashboard-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardGridComponent implements OnChanges, OnInit {
  @Input() data: ServerRow[] = [];
  @Input() loading: boolean = false;
  // Accept filters from parent; allow string input safely
  private _fromDate: Date | null = null;
  private _toDate: Date | null = null;
  private _entityId: number | null = null;

  @Input()
  set fromDate(v: Date | string | null) {
    this._fromDate = this.coerceDate(v);
  }
  get fromDate(): Date | null {
    return this._fromDate;
  }

  @Input()
  set toDate(v: Date | string | null) {
    this._toDate = this.coerceDate(v);
  }
  get toDate(): Date | null {
    return this._toDate;
  }

  @Input()
  set entityId(v: number | string | null) {
    this._entityId = this.coerceNumber(v);
  }
  get entityId(): number | null {
    return this._entityId;
  }
  @Input() alertDays = 2; // number of days threshold

  public gridData: TopRow[] = [];
  public dataTypes: any;
  public dataSources: any;

  constructor(
    private rdict: ReactiveDictionary,
    private cdr: ChangeDetectorRef
  ) {}
  async ngOnInit() {
    this.loadDropdowns();
  }
  private async loadDropdowns() {
    if (!this.dataTypes) {
      const dt = await this.rdict.getArray('administration.data_types');
      this.dataTypes = this.getMappedDataTypeName(dt);
    }
    if (!this.dataSources) {
      const ds = await this.rdict.getArray('administration.data_sources');
      this.dataSources = this.getMappedDataTypeName(ds);
    }
  }
  private getMappedDataTypeName(data: any): any {
    const map: Record<number, string> = {};

    Array.from(data.values()).forEach((t: any) => {
      const id = Number(t.get('oid'));
      const name = t.get('name');
      map[id] = name;
    });

    return map;
  }
  async ngOnChanges(_: SimpleChanges): Promise<void> {
    await this.loadDropdowns();
    const filtered = this.filterRows(this.data ?? []);
    this.gridData = this.buildHierarchy(filtered);
    this.cdr.detectChanges();
  }

  /* ========= COERCION ========= */

  private coerceNumber(v: number | string | null): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  }

  private coerceDate(v: Date | string | null): Date | null {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  /* ========= FILTERING ========= */

  private filterRows(rows: ServerRow[]): ServerRow[] {
    const from = this._fromDate;
    const to = this._toDate;

    const fromDay = from ? this.toDayString(from) : null;
    const toDay = to ? this.toDayString(to) : null;

    return rows.filter((r) => {
      if (this._entityId !== null && r.entity_id !== this._entityId) return false;
      if (fromDay && r.day < fromDay) return false;
      if (toDay && r.day > toDay) return false;
      return true;
    });
  }

  // Convert Date -> 'YYYY-MM-DD' in local time
  private toDayString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /* ========= HIERARCHY =========
     Top group: day + data_source_id
     Detail: data_type_id (aggregated)
  */

  private buildHierarchy(rows: ServerRow[]): TopRow[] {
    const topMap = new Map<string, TopRow>();
    const maxIso = (a: string, b: string) => (a > b ? a : b); // ISO compare

    for (const r of rows) {
      const topKey = `${r.day}_${r.data_source_id}`;

      let top = topMap.get(topKey);
      if (!top) {
        top = {
          day: r.day,
          data_source_id: this.dataSources[r.data_source_id],
          slot_count_sum: 0,
          time_added: r.time_added,
          types: []
        };
        topMap.set(topKey, top);
      }

      // Top aggregation (sum + latest time_added)
      top.slot_count_sum += r.slot_count;
      top.time_added = maxIso(top.time_added, r.time_added);

      // Detail aggregation by data_type_id
      let dt = top.types.find((x) => x.data_type_id === r.data_type_id);
      if (!dt) {
        dt = {
          data_type_id: this.dataTypes[r.data_type_id],
          slot_count: 0,
          time_added: r.time_added
        };
        top.types.push(dt);
      }

      dt.slot_count += r.slot_count;
      dt.time_added = maxIso(dt.time_added, r.time_added);
    }

    // Sort detail rows and top rows
    return Array.from(topMap.values())
      .map((t) => ({
        ...t,
        types: [...t.types].sort((a, b) => a.data_type_id - b.data_type_id)
      }))
      .sort((a, b) => (a.day === b.day ? a.data_source_id - b.data_source_id : a.day.localeCompare(b.day)));
  }

  private isOlderThanAlertDays(day: string, timeAddedIso: string): boolean {
    if (!day || !timeAddedIso || !this.alertDays) {
      return false;
    }

    const dayDate = new Date(`${day}T00:00:00`);
    const timeAdded = new Date(timeAddedIso);

    if (isNaN(dayDate.getTime()) || isNaN(timeAdded.getTime())) {
      return false;
    }

    const diffMs = dayDate.getTime() - timeAdded.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays > this.alertDays;
  }

  public rowClass = (context: { dataItem: any }): string => {
    const row = context.dataItem;

    return this.isOlderThanAlertDays(row.day, row.time_added) ? 'row-alert' : '';
  };
}
