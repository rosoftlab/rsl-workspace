import { Attribute, BaseModelConfig } from "../core";
import { BaseModel } from "./base.model";
@BaseModelConfig({
    type: 'user'
})
export class User extends BaseModel {

    @Attribute({ serializedName: 'firstName' })
    firstName!: string;

    @Attribute({ serializedName: 'lastName' })
    lastName!: string;

    @Attribute({ serializedName: 'email' })
    email!: string;

    get fullName(): string {
        return this.firstName + ' ' + this.lastName;
    }
}

