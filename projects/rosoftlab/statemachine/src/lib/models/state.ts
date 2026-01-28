import { Attribute, BaseModel, BaseModelConfig } from "@rosoftlab/core";
@BaseModelConfig({
    type: 'state',
})
export class State extends BaseModel {

    @Attribute({ serializedName: 'stateMachineId' })
    stateMachineId!: number;

    @Attribute({ serializedName: 'name' })
    name!: string;

    @Attribute({ serializedName: 'code' })
    code!: string;

    @Attribute({ serializedName: 'translationKey' })
    translationKey: string;

}

