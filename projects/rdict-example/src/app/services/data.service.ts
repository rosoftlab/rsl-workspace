import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import { ReactiveDictionary } from 'projects/rosoftlab/rdict/src/public-api';
import { from, Observable } from 'rxjs';

interface CellDescriptor {
  value: string | number | null;
  textAlign?: string;
  verticalAlign?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private rdict: ReactiveDictionary) {}
  public getData$(
    startDate: Date,
    endDate: Date,
    locationId?: number,
    dataSourceId?: number,
    sourceList?: any[],
    dataTypes?: any[]
  ): Observable<any[]> {
    return from(this.getData(startDate, endDate, locationId, dataSourceId, sourceList, dataTypes));
  }

  public getAvaibleColumns$(
    startDate: Date,
    endDate: Date,
    locationId?: number,
    dataSourceId?: number,
    sourceList?: any[],
    dataTypes?: any[]
  ): Observable<any[]> {
    return from(this.getAvaibleColumns(startDate, endDate, locationId, dataSourceId, sourceList, dataTypes));
  }

  public async getAvaibleColumns(
    startDate: Date,
    endDate: Date,
    locationId?: number,
    dataSourceId?: number,
    sourceList?: any[],
    dataTypes?: any[]
  ) {
    let filters = '';
    const newStartDate = format(startDate, 'yyyy-MM-dd') + 'T00:00:00';
    const newEndDate = format(endDate, 'yyyy-MM-dd') + 'T23:59:59';

    if (startDate && endDate) {
      filters += `timeBETWEEN${newStartDate}..${newEndDate}`;
    }
    if (locationId) {
      filters += `,entity_id=${locationId}`;
    }
    if (dataSourceId) {
      filters += `,data_source_id=${dataSourceId}`;
    }
    var query = (await this.rdict.asyncGet('data.query')) as ReactiveDictionary;
    await query.asyncSet('filters', filters);
    var result = (await query.asyncGet('columns')) as ReactiveDictionary;
    var data = await result.getTableWithoutGuid('records');
    var msg = await result.asyncGet('filter_state');
    // console.log(data)
    const tableData = this.transformToTreeviewDescriptor(data, sourceList, dataTypes);
    console.log(msg);
    return tableData;
  }
  private transformToTreeviewDescriptor(data: any[], sourceList?: any[], dataTypes?: any[]) {
    const parsedData = data.map((item) => ({
      ...item,
      data_source_name: this.getNameFromList(String(item.data_source_id), sourceList, 'Unknown Source'),
      data_type_name: this.getNameFromList(String(item.data_type_id), dataTypes, 'Unknown Type')
    }));


     const result: any[] = [];
  let idCounter = 1;

  // Group parsedData by data_source_id
  const grouped = new Map<number, { name: string; children: any[] }>();

  for (const item of parsedData) {
    if (!grouped.has(item.data_source_id)) {
      grouped.set(item.data_source_id, {
        name: item.data_source_name,
        children: [],
      });
    }
    grouped.get(item.data_source_id)!.children.push(item);
  }

  // Sort root groups by data_source_name
  const sortedRoots = Array.from(grouped.entries()).sort((a, b) =>
    a[1].name.localeCompare(b[1].name)
  );

  const idMap = new Map<number, number>(); // maps data_source_id -> root node id

  for (const [sourceId, group] of sortedRoots) {
    // Add root node
    const rootId = idCounter++;
    result.push({
      id: rootId,
      data_source_id: sourceId,
      desc: group.name,
    });
    idMap.set(sourceId, rootId);

    // Sort children by data_type_name
    const sortedChildren = group.children.sort((a, b) =>
      a.data_type_name.localeCompare(b.data_type_name)
    );

    for (const child of sortedChildren) {
      result.push({
        id: idCounter++,
        parentId: rootId,
        data_type_id: child.data_type_id,
        desc: child.data_type_name,
         checkKey: `${child.data_source_id}_${child.data_type_id}`
      });
    }
  }

    return result;
  }
  public async getData(startDate: Date, endDate: Date, locationId?: number, dataSourceId?: number, sourceList?: any[], dataTypes?: any[]) {
    let filters = '';
    const newStartDate = format(startDate, 'yyyy-MM-dd') + 'T00:00:00';
    const newEndDate = format(endDate, 'yyyy-MM-dd') + 'T23:59:59';

    if (startDate && endDate) {
      filters += `timeBETWEEN${newStartDate}..${newEndDate}`;
    }
    if (locationId) {
      filters += `,entity_id=${locationId}`;
    }
    if (dataSourceId) {
      filters += `,data_source_id=${dataSourceId}`;
    }
    var query = (await this.rdict.asyncGet('data.query')) as ReactiveDictionary;
    await query.asyncSet('filters', filters);
    var result = (await query.asyncGet('result')) as ReactiveDictionary;
    var data = await result.getTableWithoutGuid('records');
    var msg = await result.asyncGet('filter_state');
    console.log('msg', msg);
    const start = performance.now();
    const tableData = this.transformToSheetDescriptor(data, sourceList, dataTypes);
    const end = performance.now();
    const durationInSeconds = (end - start) / 1000;
    console.log(`Function transformToSheetDescriptor took ${durationInSeconds.toFixed(3)} seconds`);
    return tableData;
  }

  private transformToSheetDescriptor(data: any[], sourceList?: any[], dataTypes?: any[]): any {
    if (!data.length) return [];

    // Step 1: Build a sorted list of unique x_y keys from the first row
    const keySet = new Set<string>();
    const headerMap = new Map<number, number[]>(); // x -> list of y

    data.forEach((entry) => {
      Object.keys(entry).forEach((key) => {
        if (key === 'time' || key === '__idx') return;
        keySet.add(key);

        const [xStr, yStr] = key.split('_');
        const x = parseInt(xStr);
        const y = parseInt(yStr);
        if (!headerMap.has(x)) {
          headerMap.set(x, []);
        }
        if (!headerMap.get(x)!.includes(y)) {
          headerMap.get(x)!.push(y);
        }
      });
    });

    // Sort headers
    const sortedHeader = Array.from(headerMap.entries())
      .sort(([x1], [x2]) => x1 - x2)
      .map(([x, ys]) => [x, ys.sort((a, b) => a - b)] as const);

    // Step 2: Build header rows
    const row1: CellDescriptor[] = [
      { value: 'Date', verticalAlign: 'center' },
      { value: 'Hour', verticalAlign: 'center' }
    ];
    const row2: CellDescriptor[] = [
      { value: 'Date', verticalAlign: 'center' },
      { value: 'Hour', verticalAlign: 'center' }
    ];
    const mergedCells: string[] = ['A1:A2', 'B1:B2'];

    let currentCol = 2;
    const getExcelCol = (n: number): string => {
      let s = '';
      while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
      }
      return s;
    };

    const colOrder: string[] = [];

    for (const [x, ys] of sortedHeader) {
      const startCol = getExcelCol(currentCol);
      for (const y of ys) {
        const key = `${x}_${y}`;
        colOrder.push(key);
        row1.push({
          value: this.getNameFromList(String(x), sourceList),
          textAlign: 'center'
        });
        row2.push({
          value: this.getNameFromList(String(y), dataTypes),
          textAlign: 'center'
        });
        currentCol++;
      }
      const endCol = getExcelCol(currentCol - 1);
      if (startCol !== endCol) {
        mergedCells.push(`${startCol}1:${endCol}1`);
      }
    }

    // Build data rows
    const dataRows = data.map((entry) => {
      const date = new Date(entry.time);
      const dateStr = date.toISOString().split('T')[0];
      const hourStr = date.toISOString().split('T')[1].substring(0, 5);

      const cells: CellDescriptor[] = [
        { value: dateStr, textAlign: 'center' },
        { value: hourStr, textAlign: 'center' }
      ];

      for (const key of colOrder) {
        cells.push({ value: entry[key] ?? null });
      }

      return { cells };
    });

    // Step 4: Final sheet
    return [
      {
        name: 'Data',
        frozenRows: 2,
        frozenColumns: 2,
        rows: [{ cells: row1 }, { cells: row2 }, ...dataRows],
        mergedCells,
        columns: [
          { index: 0, width: 100 },
          { index: 1, width: 100 }
        ]
      }
    ];
  }

  private getNameFromList(key: string, dataTypes?: { oid: string; name: string }[], defaultName: string | null = null): string {
    const match = (dataTypes ?? []).find((dt) => dt.oid.toString() === key.toString());
    if (match?.name != null) {
      return match.name;
    }

    return defaultName ?? key;
  }
}
