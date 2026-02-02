import { BaseModelConfig } from '../core';
import { BaseModel } from './base.model';

@BaseModelConfig({
  type: 'role'
})
export class Role extends BaseModel {

  name: string;

  roleDetail: any;
}
