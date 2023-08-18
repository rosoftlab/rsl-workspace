import { CellTextAlign, GridLayoutFormat } from '@rosoftlab/core';
export class GridLayoutModel {
    constructor(
        propertyName: string, translateKey: any = null, width: any = null, grow: 0 | 1 = 0, shrink: 0 | 1 = 0,
        formating: GridLayoutFormat = GridLayoutFormat.none, format = '', order = 0,
        textAlign: CellTextAlign = CellTextAlign.left) {
        this.propertyName = propertyName;
        this.translateKey = translateKey;
        this.width = width;
        this.grow = grow;
        this.shrink = shrink;
        this.formating = formating;
        this.format = format;
        this.order = order;
        this.textAlign = textAlign;
    }
    public propertyName: string;
    public translateKey: string;
    public width: number;
    public grow: 0 | 1;
    public shrink: 0 | 1;
    public formating: GridLayoutFormat = GridLayoutFormat.none;
    public format: string;
    public order: number = 0;
    public textAlign: CellTextAlign = CellTextAlign.left;
}
