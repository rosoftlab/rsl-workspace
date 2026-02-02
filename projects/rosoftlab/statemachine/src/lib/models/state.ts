import { BaseModel, BaseModelConfig } from "@rosoftlab/core";
@BaseModelConfig({
    type: 'state',
})
export class State extends BaseModel {

    stateMachineId!: number;

    name!: string;

    code!: string;

    translationKey: string;

}

