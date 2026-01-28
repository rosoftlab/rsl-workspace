import { Attribute, BaseModel, BaseModelConfig } from "@rosoftlab/core";

@BaseModelConfig({
    type: 'warehouse',
    formTitle: 'Administration.Catalog.Warehouse'
})
export class Warehouse extends BaseModel {

    @Attribute({ serializedName: 'name', required: true })
    name: string | undefined;
}





