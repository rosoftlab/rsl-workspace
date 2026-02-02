import { BaseModelConfig } from "../core";
import { BaseModel } from "./base.model";

@BaseModelConfig({
    type: 'user',
    modelEndpointUrl: 'user/menus'
})
export class Menu extends BaseModel {

    header?: string;

    icon?: string;

    link?: string;

    title?: string;

    sublinks?: Menu[];

    target?: string;

    external?: boolean;

    description?: string;

    order?: number;

    translationKey!: string;

    color?: string;
}

