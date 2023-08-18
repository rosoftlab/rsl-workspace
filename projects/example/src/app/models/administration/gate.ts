import { Attribute, BaseModelConfig } from "@rosoftlab/core";
import { BaseModelFormly, FormlyLayout } from '@rosoftlab/formly';
import { IonicListLayout } from "@rosoftlab/ionic";

@BaseModelConfig({
    type: 'gate',
    formTitle: 'Administration.Parking.Gate.Title'
})
export class Gate extends BaseModelFormly {

    @Attribute({ serializedName: 'id' })

    override id: string | undefined;

    @IonicListLayout({ primary: true })
    @FormlyLayout({ type: 'input', label: 'General.Name', placeholder: "General.Name.Placeholder", required: true })
    @Attribute({ serializedName: 'name', required: true })
    name: string | undefined;

    @IonicListLayout({ primary: false, translateKey: 'Gate.Direction' })
    @FormlyLayout({ type: "select", label: 'Gate.Direction' })
    @Attribute({ serializedName: 'gateDirection', required: true })

    gateDirection: boolean | undefined;

}





