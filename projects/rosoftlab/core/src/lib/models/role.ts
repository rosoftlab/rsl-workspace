
import { Attribute } from "../decorators/attribute.decorator";
import { BaseModelConfig } from "../decorators/base-model-config.decorator";
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
