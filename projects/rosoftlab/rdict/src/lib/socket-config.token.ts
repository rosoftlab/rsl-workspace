// projects/my-library/src/lib/socket-config.token.ts
import { InjectionToken } from '@angular/core';

export const SOCKET_URL = new InjectionToken<string>('SocketUrl');
