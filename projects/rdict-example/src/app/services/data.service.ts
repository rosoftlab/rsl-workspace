import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import { ReactiveDictionary } from 'projects/rosoftlab/rdict/src/lib/reactive-dictionary';
import { from, Observable } from 'rxjs';

interface CellDescriptor {
  value: string | number | null;
  textAlign?: string;
  verticalAlign?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private rdict: ReactiveDictionary) {}
  public getData$(startDate: Date, endDate: Date, locationId?: number): Observable<any[]> {
    return from(this.getData(startDate, endDate, locationId));
  }
  /**
   * Fetches data based on the provided parameters and transforms it into a sheet descriptor format.
   * @param startDate - The start date for the data query.
   * @param endDate - The end date for the data query.
   * @param locationId - Optional location ID to filter the data.
   * @param sourceList - Optional list of sources to map names.
   * @param dataTypes - Optional list of data types to map names.
   * @param selectedProcessingLayout - Optional processing layout configuration.
   * @returns A promise that resolves to the transformed table data.
   */
  public async getData(startDate: Date, endDate: Date, locationId?: number) {
    let filters = '';
    const newStartDate = format(startDate, 'yyyy-MM-dd') + 'T00:00:00';
    const newEndDate = format(endDate, 'yyyy-MM-dd') + 'T23:59:59';

    if (startDate && endDate) {
      filters += `timeBETWEEN${newStartDate}..${newEndDate}`;
    }
    if (locationId) {
      filters += `,entity_id=${locationId}`;
    }

    var query = (await this.rdict.asyncGet('data.query')) as ReactiveDictionary;
    await query.asyncSet('filters', filters);
    var result = (await query.asyncGet('result')) as ReactiveDictionary;
    var data = await result.getArrayWithoutGuid('records');
    // var msg = await result.asyncGet('filter_state');
    // console.log('data', data);
    return data;
  }
}
