import { Attribute, BaseModel, BaseModelConfig } from "@rosoftlab/core";

@BaseModelConfig({
    type: 'employee'
})
export class Employee extends BaseModel {

    @Attribute({ serializedName: 'id' })
    override id!: string;

    @Attribute({ serializedName: 'userName', required: true })
    userName: string;

    @Attribute({ serializedName: 'firstName', required: true })
    firstName: string;

    @Attribute({ serializedName: 'lastName', required: true })
    lastName: string;

    @Attribute({ serializedName: 'email', required: true })
    email: string;

    @Attribute({ serializedName: 'role', required: true })
    role: any;

    // Used for creating an employee ... need to see if I add here
    @Attribute({ serializedName: 'password' })
    password: string;

    @Attribute({ serializedName: 'confirmPassword' })
    confirmPassword: string;
}

