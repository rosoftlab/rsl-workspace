import { Attribute, BaseModelConfig } from '../core';
import { BaseModel } from './base.model';

@BaseModelConfig({
  type: 'role'
})
export class Role extends BaseModel {
  @Attribute({ serializedName: 'id' })
  id: string;

  @Attribute({ serializedName: 'name' })
  name: string;
}
