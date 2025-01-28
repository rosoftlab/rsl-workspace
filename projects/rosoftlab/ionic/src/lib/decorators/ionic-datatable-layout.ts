
import { MetadataStorage } from '@rosoftlab/core';
import { TableColumn } from '@swimlane/ngx-datatable';
export interface IonicDataTableLayoutConfig extends TableColumn {
    order?: number;
    visible?: boolean;
    isTranslated?: boolean;
}
export function IonicDataTableLayout(config: IonicDataTableLayoutConfig) {
    return (target: any, propertyName: string) => {
        const annotations = MetadataStorage.getMetadata('IonicDataTableLayout', target) || [];
        config.prop = propertyName;
        config.visible = config.visible === undefined ? true : config.visible;
        annotations.push(config);

        MetadataStorage.setMetadata('IonicDataTableLayout', annotations, target);
    };
}
