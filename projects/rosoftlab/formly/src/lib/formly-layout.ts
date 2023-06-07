import { } from 'reflect-metadata';
import { FormlyModelConfig } from "./interfaces/formly-model-config";
export function FormlyLayout(config: FormlyModelConfig) {
    return (target: any, propertyName: string) => {
        const annotations = Reflect.getMetadata('FormlyLayout', target) || [];
        config.key=propertyName;
        annotations.push(config);

        Reflect.defineMetadata('FormlyLayout', annotations, target);
    };
}
