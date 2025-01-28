import { MetadataStorage } from "../models/metadata-storage";

export function CustomType(config: any = {}) {
    return (target: any, propertyName: string | symbol) => {
        const annotations = MetadataStorage.getMetadata('CustomType', target) || [];

        annotations.push({
            propertyName,
            relationship: config.key || propertyName
        });

        MetadataStorage.setMetadata('CustomType', annotations, target);
    };
}
