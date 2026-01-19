import { FormlyFieldConfig, FormlyFieldProps } from "@ngx-formly/core";
import { Attribute, BaseModelConfig, BaseService } from "@rosoftlab/core";
import { BaseModelFormly, FormlyLayout } from "@rosoftlab/formly";
import { IonicDataTableLayout } from "@rosoftlab/ionic";
import { EmployeefieldsAdd, EmployeefieldsEdit } from "./employee-config";

@BaseModelConfig({
    type: 'employee',
    formTitle: 'Administration.Security.User'
})
export class Employee extends BaseModelFormly {

    @Attribute({ serializedName: 'id' })
    override id!: string;

    @IonicDataTableLayout({ name: 'Employee.Fullname' })
    get fullName(): string {
        return this.firstName + ' ' + this.lastName;
    }

    @IonicDataTableLayout({ name: 'Employee.UserName' })
    @FormlyLayout({ type: 'input', label: 'User.UserName',  required: true })
    @Attribute({ serializedName: 'userName', required: true })
    userName: string;

    @FormlyLayout({ type: 'input', label: 'General.FirstName',  required: true })
    @Attribute({ serializedName: 'firstName', required: true })
    firstName: string;

    @FormlyLayout({ type: 'input', label: 'General.LastName',  required: true })
    @Attribute({ serializedName: 'lastName', required: true })
    lastName: string;
    @IonicDataTableLayout({ name: 'General.Email' })
    @FormlyLayout({ type: 'input', label: 'General.Email',  required: true })
    @Attribute({ serializedName: 'email', required: true })
    email: string;

    @Attribute({ serializedName: 'role', required: true })
    role: any;

    // Used for creating an employee ... need to see if I add here
    @Attribute({ serializedName: 'password' })
    @FormlyLayout({ type: 'input', label: 'User.Password',  required: true })
    password: string;

    @Attribute({ serializedName: 'confirmPassword' })
    @FormlyLayout({ type: 'input', label: 'User.ConfirmPassword',  required: true })
    confirmPassword: string;




    override getFormlyFields(baseService: BaseService<BaseModelFormly>): FormlyFieldConfig<FormlyFieldProps & { [additionalProperties: string]: any; }>[] {
        if (this.id)
            return EmployeefieldsEdit()
        else
            return EmployeefieldsAdd()
        // const x = super.getFormlyFields(baseService)
        // console.log(JSON.stringify(x))
        // return x;
    }
}

