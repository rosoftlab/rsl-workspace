export function CustomType(config: any = {}) {
    return (target: any, propertyName: string | symbol) => {
        const annotations = Reflect.getMetadata('CustomType', target) || [];

        annotations.push({
            propertyName,
            relationship: config.key || propertyName
        });

        Reflect.defineMetadata('CustomType', annotations, target);
    };
}
