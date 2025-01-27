import { Attribute, BaseModel, BaseModelConfig } from 'projects/rosoftlab/core/src/lib';

@BaseModelConfig({
    type: 'user'
})
export class User extends BaseModel {

    @Attribute({ serializedName: 'id' })
    override id!: string;

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

