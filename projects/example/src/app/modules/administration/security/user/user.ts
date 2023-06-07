import { Attribute, BaseModel, BaseModelConfig, GridLayout } from "@rosoftlab/core";

@BaseModelConfig({
    type: 'user'
})
export class User extends BaseModel {

    @Attribute({ serializedName: 'id' })
    override id!: string;

    @GridLayout('Administration.User.FirstName', 200, 0, 1)
    @Attribute({ serializedName: 'firstName', required: true })
    firstName!: string;

    @GridLayout('Administration.User.LastName', 200, 0, 1)
    @Attribute({ serializedName: 'lastName', required: true })
    lastName!: string;

    @GridLayout('Administration.User.Email', 300, 0, 1)
    @Attribute({ serializedName: 'email', required: true })
    email!: string;

    @GridLayout('Administration.User.Role', 200, 0, 1)
    @Attribute({ serializedName: 'roleName', required: true })
    roleName!: string;

    // Used for creating an user ... need to see if I add here
    @Attribute({ serializedName: 'password' })
    password!: string;

    @Attribute({ serializedName: 'confirmPassword' })
    confirmPassword!: string;

    get employeName(): string {
        return this.firstName + ' ' + this.lastName;
    }
}

