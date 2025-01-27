import { Inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import * as msgpackParser from 'socket.io-msgpack-parser';
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
        parser: msgpackParser,
        auth: {
          token: authToken, // Include the authentication token
        }
        ,
        query: {
          "access_token": authToken
        }
      });
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
}
