import { BaseModel, BaseModelConfig } from "@rosoftlab/core";

@BaseModelConfig({
    type: 'warehouse',
    formTitle: 'Administration.Catalog.Warehouse'
})
export class Warehouse extends BaseModel {

    name: string | undefined;
}





