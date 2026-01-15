import { Inject, Injectable } from '@angular/core';
import { FilterRequest } from '@rosoftlab/core';
import { defer, filter, first, fromEvent, map, mergeMap, Observable, race, Subject, timeout } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../socket-config.token';
type Kwargs = Record<string, any>;
interface ExecPayload {
  did: string;
  function_name: string;
  args?: any[]; // optional; send only if non-empty
  kwargs?: Kwargs; // optional; send only if non-empty
}
interface ExecAck {
  ok: boolean;
  status?: 'started';
  job_id?: string;
  error?: any;
}

interface FunctionResult {
  ok: true;
  job_id: string;
  did: string;
  function_name: string;
  result: any;
}

interface FunctionError {
  ok: false;
  job_id: string;
  did: string;
  function_name: string;
  error: any;
  traceback?: string;
}
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private socketUrl: string;
  private disconnect$ = new Subject<void>();

  // shared event streams
  private result$!: Observable<FunctionResult>;
  private error$!: Observable<FunctionError>;
  private disconnected$!: Observable<string | undefined>;
  constructor(@Inject(SOCKET_URL) socketUrl: string) {
    this.socketUrl = socketUrl;
    // Replace with your actual server URL
    // this.socket.on("connect", () => {
    //   const engine = this.socket.io.engine;
    //   (engine.transport.name); // in most cases, prints "polling"

    //   engine.once("upgrade", () => {
    //     // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
    //     (engine.transport.name); // in most cases, prints "websocket"
    //   });

    // });
  }
  initSocket(authToken: string) {
    if (this.socket == null && authToken !== null) {
      this.socket = io(this.socketUrl, {
        reconnectionDelayMax: 10000,
        transports: ['websocket'],
        withCredentials: true,
        //ackTimeout: 60000,
        timeout: 60000,
        //retries: 50,
        // parser: msgpackParser,
        auth: {
          token: authToken // Include the authentication token
        }
      });
      this.result$ = fromEvent<FunctionResult>(this.socket, 'function_result');
      this.error$ = fromEvent<FunctionError>(this.socket, 'function_error');
      this.disconnected$ = fromEvent<string | undefined>(this.socket, 'disconnect');

      // When socket disconnects, push to our teardown subject
      this.disconnected$.subscribe(() => this.disconnect$.next());
    }
  }
  getInitialData(): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      this.socket.on('init', (data: any) => {
        if (data) {
          resolve(data['dict_data']);
        } else {
          reject('No data received from init event');
        }
      });
    });
  }
  getSetEvent(rdict: any) {
    this.socket.on('set', (data: any) => {
      // (rdict.get('__guid'), data, this.socket.id)
      if (rdict.get('__guid') === data.did) {
        // ('Set the data')
        if (data.key === 'transactions') {
          for (const [key, record] of Object.entries(data.value)) {
            rdict.set_new_dict(key, record);
          }
        } else {
          rdict.asyncSet(data.key, data.value, false);
        }
      }
    });
  }
  getDeleteEvent(rdict: any) {
    this.socket.on('delete', (data: any) => {
      // (rdict.get('__guid'), data, this.socket.id)
      if (rdict.get('__guid') === data.did) {
        // ('Set the data')
        rdict.asyncDelete(data.key, false);
      }
    });
  }
  // Emit the 'lazy_load' event with callback to get the response
  requestLazyLoad(did: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('lazy_load', { did, key }, (response: any) => {
        if (response && response.error) {
          reject(response.error); // Handle error if present
        } else {
          resolve(response); // Resolve with the response data
        }
      });
    });
  }
  notify_new_key(did: string, new_key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('notify_new_key', { did, new_key }, (response: any) => {
        if (response && response.error) {
          reject(response.error); // Handle error if present
        } else {
          resolve(response); // Resolve with the response data
        }
      });
    });
  }
  commit_transaction(did: string, values: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('commit_transaction', { did: did, value: values }, (response: any) => {
        if (response && response.error) {
          reject(response.error); // Handle error if present
        } else {
          resolve(response); // Resolve with the response data
        }
      });
    });
  }

  // Observable wrapper for requestFilteredData
  // This allows you to use it in an RxJS pipeline
  requestFilteredData(guid: string, key: string, request: FilterRequest): Observable<any> {
    return new Observable<any>((observer) => {
      this.socket.emit('get_filtered_views', { did: guid, key, request }, (response: any) => {
        if (response && response.error) {
          observer.error(response.error);
        } else {
          const transformedResponse = this.convertDates(response);
          observer.next(transformedResponse);
          observer.complete();
        }
      });

      // teardown logic if subscriber unsubscribes before callback fires
      return () => {
        // no direct way to cancel a single emit/callback in socket.io,
        // but you could optionally remove a listener here if you used on(...)
      };
    });
  }
  convertDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertDates(item));
    }

    if (typeof obj === 'object') {
      const newObj: any = {};
      for (const key of Object.keys(obj)) {
        const value = obj[key];

        // detect ISO date strings
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}[ T]\d/.test(value)) {
          newObj[key] = new Date(value.replace(' ', 'T')); // replace space with T for safety
        } else {
          newObj[key] = this.convertDates(value); // recurse
        }
      }
      return newObj;
    }

    return obj;
  }

  // Emit the 'set' event to update the data on the server
  emitSet(did: string, key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('set', { did, key, value }, (response: any) => {
        if (response && response.error) {
          reject(response.error);
        } else {
          resolve();
        }
      });
    });
  }

  // Emit the 'set' event to update the data on the server
  emitDelete(did: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('delete', { did, key }, (response: any) => {
        if (response && response.error) {
          reject(response.error);
        } else {
          resolve();
        }
      });
    });
  }

  transformDatesForEncoding(obj: any): any {
    if (obj instanceof Date) {
      return { __date__: obj.toISOString() };
    } else if (Array.isArray(obj)) {
      return obj.map(this.transformDatesForEncoding);
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = this.transformDatesForEncoding(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  }

  transformDatesForDecoding(obj: any): any {
    if (typeof obj === 'object' && obj !== null) {
      if ('__date__' in obj) {
        return new Date(obj.__date__);
      }
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = this.transformDatesForDecoding(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  }
  //#region executeFunction

  executeFunction_old(did: string, functionName: string, args: any[] = [], kwargs: Kwargs = {}): Observable<any> {
    const payload: ExecPayload = {
      did,
      function_name: functionName,
      ...(args && args.length ? { args } : {}),
      ...(kwargs && Object.keys(kwargs).length ? { kwargs } : {})
    };
    return new Observable<any>((observer) => {
      this.socket.emit('execute_function', payload, (response: any) => {
        if (response && response.error) {
          observer.error(response.error);
        } else {
          observer.next(response);
          observer.complete();
        }
      });

      // teardown logic if subscriber unsubscribes before callback fires
      return () => {
        // no direct way to cancel a single emit/callback in socket.io,
        // but you could optionally remove a listener here if you used on(...)
      };
    });
  }

  executeFunction(
    did: string,
    functionName: string,
    args: any[] = [],
    kwargs: Record<string, any> = {},
    waitMs = 120_000,
    awaitResult: boolean = true
  ): Observable<any> {
    const payload = {
      did,
      function_name: functionName,
      ...(args?.length ? { args } : {}),
      ...(kwargs && Object.keys(kwargs).length ? { kwargs } : {})
    };

    const ack$ = new Observable<{ ok: boolean; job_id?: string; error?: any }>((observer) => {
      this.socket.emit('execute_function', payload, (ack: any) => {
        observer.next(ack);
        observer.complete();
      });
      return () => {};
    });

    if (!awaitResult) {
      // Return immediately with the server ACK
      return ack$;
    }

    // Wait for function_result / function_error matching the job_id
    return defer(() => ack$).pipe(
      mergeMap((ack) => {
        if (!ack?.ok || !ack.job_id) {
          const msg = ack?.error ?? 'Bad ACK or missing job_id';
          throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
        const jobId = ack.job_id!;
        const jobResult$ = this.result$.pipe(filter((e: any) => e.job_id === jobId));
        const jobError$ = this.error$.pipe(filter((e: any) => e.job_id === jobId));

        return race(jobResult$, jobError$).pipe(
          first(),
          map((evt: any) => {
            if (evt?.ok === false) {
              const msg = evt.error ?? `Server error for ${functionName} (job ${jobId})`;
              throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
            }
            return evt.result;
          })
        );
      }),
      timeout(waitMs)
      // takeUntil(this.disconnect$)
    );
  }

  //#endregion
}
