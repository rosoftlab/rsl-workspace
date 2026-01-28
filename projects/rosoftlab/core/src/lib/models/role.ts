import { Attribute, BaseModelConfig } from '../core';
import { BaseModel } from './base.model';

@BaseModelConfig({
  type: 'role'
})
export class Role extends BaseModel {

  @Attribute({ serializedName: 'name' })
  name: string;

  @Attribute({ serializedName: 'roleDetail' })
  roleDetail: any;
}
