export class MetadataStorage {
    private static metadataMap = new WeakMap<object, Record<string, any>>();
  
    static getMetadata(key: string, target: object, propertyKey?: string): any {
      const metadata = this.metadataMap.get(target) || {};
      return propertyKey ? metadata[`${key}:${propertyKey}`] : metadata[key];
    }
  
    static setMetadata(key: string, value: any, target: object, propertyKey?: string): void {
      let metadata = this.metadataMap.get(target);
      if (!metadata) {
        metadata = {};
        this.metadataMap.set(target, metadata);
      }
      if (propertyKey) {
        metadata[`${key}:${propertyKey}`] = value;
      } else {
        metadata[key] = value;
      }
    }
  }