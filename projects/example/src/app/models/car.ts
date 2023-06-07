import { Attribute, BaseModelConfig, GridLayout } from "@rosoftlab/core";
import { BaseModelFormly, FormlyLayout } from '@rosoftlab/formly';
@BaseModelConfig({
    type: 'car',
    formTitle:'Administration.Parking.Car.Title'
})
export class Car extends BaseModelFormly {
    @Attribute({ serializedName: 'id' })

    override id: string | undefined;

    @GridLayout('Car.LicensePlate', null, 1)
    @FormlyLayout({ type: 'input', label: 'Car.LicensePlate', placeholder: "Car.LicensePlate.Placeholder", required: true })
    @Attribute({ serializedName: 'licensePlate', required: true })
    licensePlate: string | undefined;

    @GridLayout('General.Description', null, 1)
    @FormlyLayout({ type: 'textarea', label: 'General.Description' })
    @Attribute({ serializedName: 'description', required: true })
    description: string | undefined;

    @Attribute({ serializedName: 'data' })
    data: any | undefined;
}





