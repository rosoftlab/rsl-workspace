import { MetadataStorage } from "../models/metadata-storage";

export function BaseDatastoreConfig(config: any = {}) {
  // tslint:disable-next-line:only-arrow-functions
  return (target: any) => {
    MetadataStorage.setMetadata('BaseDatastoreConfig', config, target);
  };
}
