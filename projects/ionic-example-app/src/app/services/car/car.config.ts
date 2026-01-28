import { FormlyFieldConfig } from "@ngx-formly/core";
import { CarService } from "./car.service";

export function CarFieldsConfig(baseService: CarService): FormlyFieldConfig[] {
    return [
        {
            key: "licensePlate",
            type: "input",
            props: {
                translate: true,
                label: "Car.LicensePlate",
                required: true,
                // labelPosition: "floating",
            }
        },
        {
            key: "description",
            type: "input",
            props: {
                translate: true,
                label: "General.Description",
                // labelPosition: "floating",
            }
        },
        {
            key: "fields.itp.expirationDate",
            type: "datetime",
            props: {
                presentation: "date",
                translate: true,
                label: "Car.ITP.ExpirationDate",
                // labelPosition: "floating",
            }
        },
        {
            key: "fields.rovinieta.expirationDate",
            type: "datetime",
            props: {
                presentation: "date",
                translate: true,
                label: "Car.Rovinieta.ExpirationDate",
                // labelPosition: "floating",
            }
        }
    ];
}