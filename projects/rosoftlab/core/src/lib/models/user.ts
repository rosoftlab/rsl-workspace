import { BaseModelConfig } from "../core";
import { BaseModel } from "./base.model";
@BaseModelConfig({
    type: 'user'
})
export class User extends BaseModel {

    firstName!: string;

    lastName!: string;

    email!: string;

    get fullName(): string {
        return this.firstName + ' ' + this.lastName;
    }
}

