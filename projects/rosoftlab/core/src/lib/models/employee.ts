import { BaseModelConfig } from "../core";
import { BaseModel } from "./base.model";

@BaseModelConfig({
    type: 'employee'
})
export class Employee extends BaseModel {

    userName: string;

    firstName: string;

    lastName: string;

    email: string;

    role: any;

    // Used for creating an employee ... need to see if I add here
    password: string;

    confirmPassword: string;

    extraData: string;

}

