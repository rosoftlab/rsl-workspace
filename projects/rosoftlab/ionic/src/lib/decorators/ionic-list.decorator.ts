import { MetadataStorage } from '@rosoftlab/core';
import { IonicListLayoutConfig } from '../interfaces/ionic-list-layout-config';
export function IonicListLayout(config: IonicListLayoutConfig) {
    return (target: any, propertyName: string) => {
        const annotations = MetadataStorage.getMetadata('IonicListLayout', target) || [];
        config.key = propertyName;
        annotations.push(config);

        MetadataStorage.setMetadata('IonicListLayout', annotations, target);
    };
}
