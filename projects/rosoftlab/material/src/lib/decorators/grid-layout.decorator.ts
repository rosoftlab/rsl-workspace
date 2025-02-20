import { CellTextAlign, GridLayoutFormat, MetadataStorage } from '@rosoftlab/core';
export function GridLayout(translateKey: string, width?: number | null,
    grow: 0 | 1 = 0, shrink: 0 | 1 = 0, subProperty?: string | null,
    formating: GridLayoutFormat = GridLayoutFormat.none,
    format: string = '', order: number = 0, textAlign: CellTextAlign = CellTextAlign.left) {
    return (target: any, propertyName: string | symbol) => {
        const annotations = MetadataStorage.getMetadata('GridLayout', target) || [];
        let propName = propertyName
        if (subProperty) {
            propName = propertyName.toString() + '.' + subProperty;
        }
        annotations.push({
            propertyName: propName,
            translateKey,
            width,
            grow,
            shrink,
            formating,
            format,
            order,
            textAlign
        });

        MetadataStorage.setMetadata('GridLayout', annotations, target);
    };
}
