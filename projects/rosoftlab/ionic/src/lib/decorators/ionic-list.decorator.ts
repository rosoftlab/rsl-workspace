import { } from 'reflect-metadata';
import { IonicListLayoutConfig } from '../interfaces/ionic-list-layout-config';
export function IonicListLayout(config: IonicListLayoutConfig) {
    return (target: any, propertyName: string) => {
        const annotations = Reflect.getMetadata('IonicListLayout', target) || [];
        config.key = propertyName;
        annotations.push(config);

        Reflect.defineMetadata('IonicListLayout', annotations, target);
    };
}
