
import { TableColumn } from '@swimlane/ngx-datatable';
import { } from 'reflect-metadata';
export interface IonicDataTableLayoutConfig extends TableColumn {
    order?: number;
    visible?: boolean;
}
export function IonicDataTableLayout(config: IonicDataTableLayoutConfig) {
    return (target: any, propertyName: string) => {
        const annotations = Reflect.getMetadata('IonicDataTableLayout', target) || [];
        config.prop = propertyName;
        config.visible = config.visible === undefined ? true : config.visible;
        annotations.push(config);

        Reflect.defineMetadata('IonicDataTableLayout', annotations, target);
    };
}
