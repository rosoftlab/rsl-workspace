import { Injectable } from '@angular/core';
import { BaseService } from '@rosoftlab/core';
import { Datastore } from 'projects/example/src/app/services/datastore.service';
import { User } from './user';


@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<User> {

  constructor(datastore: Datastore) {
    super(datastore);
    this.setModelType(User);
  }

}
