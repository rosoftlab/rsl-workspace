import { Inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../core';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private socketUrl: string
  constructor(
    @Inject(SOCKET_URL) socketUrl: string,) {
    this.socketUrl = socketUrl
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
        withCredentials: true,
        // parser: msgpackParser,
        auth: {
          token: authToken, // Include the authentication token
        }
        // ,
        // query: {
        //   "access_token": authToken
        // }
      });

      // const originalEmit = this.socket.emit;
      // this.socket.emit = (event, ...args) => {
      //   // Transform dates before sending
      //   const transformedData = this.transformDatesForEncoding(args[0]);
      //   originalEmit.call(this.socket, event, transformedData);
      //   return this.socket;
      // };

      // Intercept incoming data and apply date transformation
      // this.socket.onAny((event, data) => {
      //   const transformedData = this.transformDatesForDecoding(data);
      //   this.socket.emit(event, transformedData);  // Emit the transformed data back
      // });
    }
  }
  getInitialData(): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      this.socket.on('init', (data: any) => {
        if (data) {
          resolve(data["dict_data"]);
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
        rdict.asyncSet(data.key, data.value, false)
      }
    });
  }
  getDeleteEvent(rdict: any) {
    this.socket.on('delete', (data: any) => {
      // (rdict.get('__guid'), data, this.socket.id)
      if (rdict.get('__guid') === data.did) {
        // ('Set the data')
        rdict.asyncDelete(data.key, false)
      }
    });
  }
  // Emit the 'lazy_load' event with callback to get the response
  requestLazyLoad(did: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('lazy_load', { did, key }, (response: any) => {
        if (response && response.error) {
          reject(response.error);  // Handle error if present
        } else {
          resolve(response);  // Resolve with the response data
        }
      });
    });
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
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = this.transformDatesForEncoding(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  }

  transformDatesForDecoding(obj: any): any {
    if (typeof obj === "object" && obj !== null) {
      if ("__date__" in obj) {
        return new Date(obj.__date__);
      }
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = this.transformDatesForDecoding(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  }


}
