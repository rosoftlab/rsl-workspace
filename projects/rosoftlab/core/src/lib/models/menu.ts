import { Attribute, BaseModelConfig } from "../core";
import { BaseModel } from "./base.model";

@BaseModelConfig({
    type: 'user',
    modelEndpointUrl: 'user/menus'
})
export class Menu extends BaseModel {

    @Attribute({ serializedName: 'id' })
    override id!: string;

    @Attribute({ serializedName: 'header' })
    header?: string;

    @Attribute({ serializedName: 'icon' })
    icon?: string;

    @Attribute({ serializedName: 'link' })
    link?: string;

    @Attribute({ serializedName: 'title' })
    title?: string;

    @Attribute({ serializedName: 'sublinks' })
    sublinks?: Menu[];

    @Attribute({ serializedName: 'target' })
    target?: string;

    @Attribute({ serializedName: 'external' })
    external?: boolean;

    @Attribute({ serializedName: 'description' })
    description?: string;

    @Attribute({ serializedName: 'order' })
    order?: number;

    @Attribute({ serializedName: 'translationKey' })
    translationKey!: string;

    @Attribute({ serializedName: 'color' })
    color?: string;
}

