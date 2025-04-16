import { Injectable } from '@angular/core';
import { from, mergeMap, Observable, Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { SocketService } from './services/socket.service';
// import { mergeMap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root' // This makes the service a singleton and available throughout the app
})
export class ReactiveDictionary extends Map<string, any> {
  private static instance: Map<string, ReactiveDictionary> = new Map<string, ReactiveDictionary>();
  private _socketService: SocketService;
  private changes$: Subject<any> = new Subject<any>();
  private deletes$: Subject<any> = new Subject<any>();

  private isInitialized: boolean = false;
  private _authToken: string = null;
  constructor(socketService: SocketService) {
    super();

    this._socketService = socketService;
    // this._socketService.initSocket(authToken)

    // this._socketService.getSetEvent(this)
  }
  public async initialize(authToken: string) {
    this._authToken = authToken;
    this._socketService.initSocket(authToken);
    this._socketService.getSetEvent(this);
    this._socketService.getDeleteEvent(this);
    await this.asyncInit();
  }

  // override keys(): IterableIterator<string> {
  //   const excludedKeys = ['__guid', '__type']; // Key to exclude
  //   const iterator = super.keys();

  //   const filteredIterator = {
  //     [Symbol.iterator]: () => ({
  //       next: () => {
  //         let result;

  //         // Loop until we find a valid key or run out of keys
  //         do {
  //           result = iterator.next(); // Get the next entry ([key, value])
  //           if (result.done) return { done: true }; // Stop if done

  //           const key = result.value; // Destructure the entry
  //           const value = super.get(key);
  //           // Check if the key is in excludedKeys or if the value is an object
  //           if (!excludedKeys.includes(key) && !(typeof value === 'object' && value !== null)) {
  //             return { value: key, done: false }; // Return the valid key
  //           }
  //         } while (true); // Continue until a valid key is found
  //       }
  //     })
  //   };

  //   return filteredIterator as IterableIterator<string>;
  // }
  // Asynchronous method to get a value by key
  async asyncGet(key: string): Promise<any> {
    // console.log('Get key: ', key);
    const keys = key.split('.');
    if (keys.length === 1) {
      if (this.has(key)) {
        const value = this.get(key);
        if (value instanceof ReactiveDictionary) {
          return value;
        }
        if (typeof value === 'object' && value !== null) {
          const dict_type = value['__type'];
          // console.log('value type : ', dict_type);
          if (dict_type === 'dict' || dict_type === 'lazy') {
            const lazyLoadData = await this.lazyLoadSync(this.get('__guid'), key);
            // console.log(lazyLoadData)
            if (lazyLoadData) {
              const dict = new ReactiveDictionary(this._socketService);
              dict.initialize(this._authToken);
              await dict.asyncInit(lazyLoadData.data);
              this.set(key, dict);
              return dict;
            }
          }
        }
        return value;
      } else {
        const dict = new ReactiveDictionary(this._socketService);
        dict.initialize(this._authToken);
        dict.set('__guid', uuidv4());
        dict.set('__type', 'dict');
        this.set(key, dict);
        await this._socketService.emitSet(this.get('__guid'), key, this.transform_for_serialization(dict));
        return dict;
      }
    } else {
      const obj = (await this.asyncGet(keys[0])) as ReactiveDictionary;
      if (obj) return await obj.asyncGet(keys.slice(1).join('.'));
      else return null;
    }
  }
  transform_for_serialization(value: any) {
    // Transform a value to a format that can be serialized.
    const dict_type = value['__type'];
    if (dict_type === 'lazy') return { __type: 'lazy' };
    else if (value instanceof ReactiveDictionary) return { __type: 'dict', __guid: value.get('__guid') };
    else return value;
  }
  // Asynchronous method to set a value by key
  async asyncSet(key: string, value: any, emmit_event: boolean = true): Promise<void> {
    if (emmit_event) {
      try {
        await this._socketService.emitSet(this.get('__guid'), key, value);
      } catch (error) {
        console.error('Error emitting set event:', error);
      }
    }
    this.set(key, value);
    this.changes$.next({ key, value });
  }
  async asyncDelete(key: string, emmit_event: boolean = true): Promise<void> {
    if (this.has(key)) {
      if (emmit_event) {
        try {
          await this._socketService.emitDelete(this.get('__guid'), key);
        } catch (error) {
          console.error('Error emitting set event:', error);
        }
      }
      this.delete(key);
      this.deletes$.next({ key });
    }
  }
  deleteAsObservable(key: string, emmit_event: boolean = true): Observable<any> {
    return from(this.asyncDelete(key, emmit_event));
  }
  // Asynchronous method to initialize with a set of key-value pairs
  async asyncInit(initialData?: Record<string, any>) {
    if (!this.isInitialized) {
      try {
        // If initial data is not provided, fetch it
        const data = initialData || (await this._socketService.getInitialData());
        // this.known_dicts.set(data.__guid,data);
        // Set the initial properties on the proxy
        for (const [key, value] of Object.entries(data)) {
          this.set(key, value);
        }
        this.isInitialized = true;
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    }
  }

  async lazyLoadSync(guid: string, prop: string | symbol): Promise<any> {
    try {
      const data = await this._socketService.requestLazyLoad(guid, String(prop));
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
  public getPlainObject(): Record<string, any> {
    const plainObject: Record<string, any> = {};
    this.forEach((value, key) => {
      if (value instanceof ReactiveDictionary) {
        plainObject[key] = value.getPlainObject();
      } else if (typeof value === 'string') {
        const formattedValue = value
          .replace(/'/g, '"') // Convert single quotes to double quotes
          .replace(/\bNone\b/g, 'null') // Replace None with null
          .replace(/\bFalse\b/g, 'false') // Replace False with false
          .replace(/\bTrue\b/g, 'true'); // Replace True with true
        try {
          const parsedValue = JSON.parse(formattedValue, this.jsonDateReviver);
          plainObject[key] = parsedValue;
        } catch {
          plainObject[key] = value; // Keep as string if not valid JSON
        }
      } else {
        plainObject[key] = value;
      }
    });
    return plainObject; // Return the plain object
  }
  private jsonDateReviver(key: string, value: any): any {
    // Check if the value is a valid ISO date string
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
      return new Date(value); // Convert to JavaScript Date object
    }
    return value;
  }
  getAsObservable(key: string): Observable<any> {
    return from(this.asyncGet(key));
  }

  getTableAsObservable(key: string, data: any = null): Observable<any[]> {
    return from(this.getTable(key, data)).pipe(
      mergeMap((dictionaryMap) => {
        if (!(dictionaryMap instanceof Map)) {
          throw new Error('Expected a Map but received something else');
        }

        const values = Array.from(dictionaryMap.values());

        const isValid = values.every((item) => item instanceof ReactiveDictionary);

        if (!isValid) {
          throw new Error('Expected a Map of ReactiveDictionary instances but found invalid entries');
        }

        return from(this.processTableData(values));
      })
    );
  }

  getTableAsObservable_old(key: string, data: any = null): Observable<any[]> {
    return from(this.getTable(key, data)).pipe(
      mergeMap((dictionary) => {
        if (!Array.isArray(dictionary)) {
          throw new Error('Expected an array but received something else');
        }

        const isArrayOfReactiveDictionaries = dictionary.every((item) => item instanceof ReactiveDictionary);

        if (!isArrayOfReactiveDictionaries) {
          throw new Error('Expected an array of ReactiveDictionary instances but received something else');
        }

        // ✅ WRAP THIS IN from(...) to make it emit real data, not a Promise
        return from(this.processTableData(dictionary));
      })
    );
  }
  async getTable(key: string, data: any = null): Promise<Map<string, ReactiveDictionary>> {
    if (!data) data = await this.asyncGet(key);
    if (!data) return new Map();

    console.log('getTable', data);

    const entries = await Promise.all(
      Array.from(data.entries()).map(async ([k, v]) => {
        const entry = (await data.asyncGet(k)) as ReactiveDictionary;
        if (entry instanceof ReactiveDictionary) {
          entry.set('__idx', k);
          return [k, entry] as [string, ReactiveDictionary];
        }
        return null;
      })
    );

    // Filter out any nulls (non-ReactiveDictionary entries)
    const validEntries = entries.filter((e): e is [string, ReactiveDictionary] => e !== null);

    return new Map(validEntries);
  }

  async getTable_old(key: string, data: any = null): Promise<any[]> {
    if (!data) data = await this.asyncGet(key); // Get rooms from the ReactiveDictionary
    if (!data) return []; // Return an empty array if data is undefined
    console.log('getTable', data);
    // Filter and get only entries that are instances of ReactiveDictionary
    const result =
      (await Promise.all(
        Array.from(data.entries()).map(async (key: any, index: number) => {
          const entry = (await data.asyncGet(key[0])) as ReactiveDictionary;
          if (entry instanceof ReactiveDictionary) {
            entry.set('__idx', key[0]);
          }
          return entry;
        })
      )) || []; // Return an empty array if the above yields undefined

    return result.filter((entry: any) => entry instanceof ReactiveDictionary);
  }
  async getTableWithoutGuid(key: string): Promise<any[]> {
    const data = await this.asyncGet(key);
    if (!data) return [];

    // Reuse the common processing logic
    return this.processTableData(data);
  }
  async processTableData(data: any): Promise<any[]> {
    if (data instanceof ReactiveDictionary) {
      const result =
        (await Promise.all(
          Array.from(data.entries()).map(async ([key]) => {
            const entry = (await data.asyncGet(key)) as ReactiveDictionary;
            if (entry instanceof ReactiveDictionary) {
              entry.set('__idx', key);
            }
            return entry;
          })
        )) || [];

      return result
        .filter((entry: any) => entry instanceof ReactiveDictionary)
        .map((dictionary) => {
          const filteredObject: Record<string, any> = {};
          for (const [key, value] of dictionary.entries()) {
            if (key !== '__guid') {
              filteredObject[key] = value;
            }
          }
          return filteredObject;
        });
    } else if (Array.isArray(data)) {
      // Directly process array of ReactiveDictionary instances
      return data.map((dictionary) => {
        const filteredObject: Record<string, any> = {};
        for (const [key, value] of dictionary.entries()) {
          if (key !== '__guid') {
            filteredObject[key] = value;
          }
        }
        return filteredObject;
      });
    } else {
      console.warn('processTableData received unexpected data:', data);
      return [];
    }
  }

  // async processTableData(data: any): Promise<any[]> {
  //     // Filter and get only entries that are instances of ReactiveDictionary
  //     const result = await Promise.all(
  //         Array.from(data.entries()).map(async ([key]) => {
  //             const entry = await data.asyncGet(key) as ReactiveDictionary
  //             if (entry instanceof ReactiveDictionary) {
  //                 entry.set('__idx', key);
  //                 }
  //             return entry;
  //         })
  //     ) || [];

  //     // Filter out entries that are not ReactiveDictionary instances
  //     const filteredResults = result.filter((entry: any) => entry instanceof ReactiveDictionary);

  //     // Remove __guid from each dictionary and return the plain object
  //     return filteredResults.map(dictionary => {
  //         const filteredObject: Record<string, any> = {};
  //         for (const [key, value] of dictionary.entries()) {
  //             if (key !== '__guid') {
  //                 filteredObject[key] = value;
  //             }
  //         }
  //         return filteredObject;
  //     });
  // }

  onChanges(): Observable<any> {
    return this.changes$.asObservable();
  }
  onDelete(): Observable<any> {
    return this.deletes$.asObservable();
  }
  private getNextOid(): string | null {
    const numericKeys = Array.from(this.keys())
      .filter((k) => /^\d+$/.test(k)) // keep only purely numeric keys
      .map((k) => parseInt(k, 10));

    if (numericKeys.length === 0) return null;

    const maxKey = Math.max(...numericKeys);
    return (maxKey + 1).toString();
  }

  async update(record: Record<string, any>, key: string = null): Promise<void> {
    if (!key) key = this.getNextOid();
    const dict = await this.asyncGet(key);
    for (const key in record) {
      if (record.hasOwnProperty(key)) {
        const currentValue = await dict.asyncGet(key);
        if (currentValue !== record[key]) await dict.asyncSet(key, record[key]);
      }
    }
  }
  modelFormList(property: string, value: any): any {
    return this.get('__modelFormList');
  }
}
