import { Attribute, BaseModel, BaseModelConfig, GridLayout } from "@rosoftlab/core";

@BaseModelConfig({
    type: 'employee'
})
export class Employee extends BaseModel {

    @Attribute({ serializedName: 'id' })
    override id!: string;

    @GridLayout('Administration.Employee.UserName', 200)
    @Attribute({ serializedName: 'userName', required: true })
    userName: string;

    @GridLayout('Administration.Employee.FirstName', 200)
    @Attribute({ serializedName: 'firstName', required: true })
    firstName: string;

    @GridLayout('Administration.Employee.LastName', 200)
    @Attribute({ serializedName: 'lastName', required: true })
    lastName: string;

    @GridLayout('Administration.Employee.Email')
    @Attribute({ serializedName: 'email', required: true })
    email: string;

    @GridLayout('Administration.Employee.Role', null, 0, 0, 'name')
    @Attribute({ serializedName: 'role', required: true })
    role: any;

    // Used for creating an employee ... need to see if I add here
    @Attribute({ serializedName: 'password' })
    password: string;

    @Attribute({ serializedName: 'confirmPassword' })
    confirmPassword: string;
}

