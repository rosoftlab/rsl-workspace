export class MetadataStorage {
    private static metadataMap = new WeakMap<object, Record<string, any>>();
  
    static getMetadata(key: string, target: object, propertyKey?: string): any {
      const metadata = this.metadataMap.get(target) || {};
      return propertyKey ? metadata[`${key}:${propertyKey}`] : metadata[key];
    }

    static getMergedMetadata(key: string, target: object): any {
      const chain: object[] = [];
      let current: object | null = target;
      while (current && current !== Object.prototype) {
        chain.push(current);
        current = Object.getPrototypeOf(current);
      }

      const merged: any = {};
      for (let i = chain.length - 1; i >= 0; i--) {
        const metadata = this.getMetadata(key, chain[i]);
        if (metadata && typeof metadata === 'object') {
          Object.assign(merged, metadata);
        }
      }

      return Object.keys(merged).length ? merged : undefined;
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
