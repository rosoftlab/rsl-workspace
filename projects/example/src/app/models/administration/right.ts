import { Attribute, BaseModel, BaseModelConfig } from '@rosoftlab/core';

@BaseModelConfig({
    type: 'right',
    modelEndpointUrl: 'user/rights'
})
export class Right extends BaseModel {

    @Attribute({ serializedName: 'id' })
    override id!: string;

    @Attribute({ serializedName: 'name' })
    name!: string;

    @Attribute({ serializedName: 'rightKey' })
    rightKey!: string;

    @Attribute({ serializedName: 'pagePath' })
    pagePath!: string;

    @Attribute({ serializedName: 'order' })
    order!: number;

    @Attribute({ serializedName: 'isMenu' })
    isMenu!: boolean;

    @Attribute({ serializedName: 'resourceName' })
    resourceName!: string;

    @Attribute({ serializedName: 'parentId' })
    parentId!: string;

    @Attribute({ serializedName: 'color' })
    color!: string;

    @Attribute({ serializedName: 'defaultRoles' })
    defaultRoles!: string;

    @Attribute({ serializedName: 'icon' })
    icon?: string;

}
