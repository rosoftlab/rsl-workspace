import { BaseMetaModel } from '../models/base-meta.model';

export function BaseModelConfig(config: any = {}) {
  return (target: any) => {
    if (typeof config['meta'] === 'undefined' || config['meta'] == null) {
      config['meta'] = BaseMetaModel;
    }

    Reflect.defineMetadata('BaseModelConfig', config, target);
  };
}
