import { BaseModel } from '@rosoftlab/core';
import { GridLayoutModel } from './grid-layout';
export class MaterialBaseModel extends BaseModel {

    public getGridLayout(): GridLayoutModel[] {
        const result = Array<GridLayoutModel>();
        const gridLayout: any = Reflect.getMetadata('GridLayout', this);
        if (gridLayout) {
            for (const layout of gridLayout) {
                const data = new GridLayoutModel(layout.propertyName, layout.translateKey,
                    layout.width, layout.shrink, layout.grow,
                    layout.formating, layout.format, layout.order, layout.textAlign);
                result.push(data);
            }
        }
        return result.sort(function (a, b) { return a.order - b.order; })
        //result;
    }
}
