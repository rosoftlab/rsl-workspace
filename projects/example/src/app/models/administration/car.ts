import { Attribute, BaseModelConfig } from "@rosoftlab/core";
import { BaseModelFormly, FormlyLayout } from '@rosoftlab/formly';
import { IonicListLayout } from "@rosoftlab/ionic";


export class Address {
    @FormlyLayout({ type: 'input', label: 'Car.address1', placeholder: "Car.address1.Placeholder", required: true })
    address1: string;
    @FormlyLayout({ type: 'input', label: 'Car.country', placeholder: "Car.country.Placeholder", required: true })
    country: string;
    @FormlyLayout({ type: 'input', label: 'Car.state', placeholder: "Car.state.Placeholder", required: true })
    state: string;
    @FormlyLayout({ type: 'input', label: 'Car.city', placeholder: "Car.city.Placeholder", required: true })
    city: string;
    @FormlyLayout({ type: 'input', label: 'Car.zipCode', placeholder: "Car.zipCode.Placeholder", required: true })
    zipCode: string;
    @FormlyLayout({ type: 'input', label: 'Car.email', placeholder: "Car.email.Placeholder", required: true })
    email: string;
    @FormlyLayout({ type: 'input', label: 'Car.phone', placeholder: "Car.phone.Placeholder", required: true })
    phone: string;
}

@BaseModelConfig({
    type: 'car',
    formTitle: 'Administration.Parking.Car.Title'
})
export class Car extends BaseModelFormly {
    @Attribute({ serializedName: 'id' })

    override id: string | undefined;

    @IonicListLayout({ primary: true })
    @FormlyLayout({ type: 'input', label: 'Car.LicensePlate', placeholder: "Car.LicensePlate.Placeholder", required: true })
    @Attribute({ serializedName: 'licensePlate', required: true })
    licensePlate: string | undefined;

    @IonicListLayout({ primary: false, translateKey: 'General.Description' })
    @FormlyLayout({ type: 'textarea', label: 'General.Description' })
    @Attribute({ serializedName: 'description', required: true })

    description: string | undefined;

    @Attribute({ serializedName: 'data' })
    data: any | undefined;

    @Attribute({ serializedName: 'address' })
    @FormlyLayout({ type: 'subobject', label: 'Car.Address' })
    address: Address
}





