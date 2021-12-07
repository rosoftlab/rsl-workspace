export function BaseDatastoreConfig(config: any = {}) {
  // tslint:disable-next-line:only-arrow-functions
  return (target: any) => {
    Reflect.defineMetadata('BaseDatastoreConfig', config, target);
  };
}
