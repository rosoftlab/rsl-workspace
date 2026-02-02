import { BaseModelConfig } from "../core";
import { BaseModel } from "./base.model";

@BaseModelConfig({
    type: 'right',
    modelEndpointUrl: 'right'
})
export class Right extends BaseModel {

    name!: string;

    rightKey!: string;

    pagePath!: string;

    order!: number;

    isMenu!: boolean;

    resourceName!: string;

    parentId!: string;

    color!: string;

    defaultRoles!: string;

    icon?: string;

}
