import { Inject, Injectable } from '@angular/core';
import { BaseService, DATASTORE_PORT } from '@rosoftlab/core';
import type { DatastorePort } from '@rosoftlab/core';
import { Observable } from 'rxjs';
import { SmAction } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SmActionService extends BaseService<SmAction> {
  constructor(@Inject(DATASTORE_PORT) datastore: DatastorePort) {
    super(datastore);
    this.setModelType(SmAction);
  }
  public getActions(objectId: string, objectType: string): Observable<SmAction[]> {
    const url = `${this.datastore.buildUrl(SmAction)}/actions`
    return this.getCustom<SmAction[]>({ objectId, objectType, bypassCache: true }, null, url);
  }

  public executeAction(objectId: string, objectType: string, actionId: number, logMessage: string): Observable<any> {
    const url = `${this.datastore.buildUrl(SmAction)}/executeaction`
    return this.postCustom({ objectId, objectType, actionId, logMessage }, null, null, url);
  }


}
