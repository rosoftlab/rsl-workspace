import { BaseMetaModel } from '../models/base-meta.model';
import { MetadataStorage } from '../models/metadata-storage';

export function BaseModelConfig(config: any = {}) {
  return (target: any) => {
    if (typeof config['meta'] === 'undefined' || config['meta'] == null) {
      config['meta'] = BaseMetaModel;
    }

    MetadataStorage.setMetadata('BaseModelConfig', config, target);
  };
}
