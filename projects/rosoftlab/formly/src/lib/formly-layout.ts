import { MetadataStorage } from "@rosoftlab/core";
import { FormlyModelConfig } from "./interfaces/formly-model-config";
export function FormlyLayout(config: FormlyModelConfig) {
    return (target: any, propertyName: string) => {
        const annotations = MetadataStorage.getMetadata('FormlyLayout', target) || [];
        config.key = propertyName;
        annotations.push(config);

        MetadataStorage.setMetadata('FormlyLayout', annotations, target);
    };
}
