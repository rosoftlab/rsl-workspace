import { BaseService } from "@rosoftlab/core";
import { BaseModelFormly } from "./base-model-formly";

export class BaseServiceFormly<T extends BaseModelFormly> extends BaseService<T> {

    public getFormlyFields(model: T) {
        return model.getFormlyFields(this);
    }
}
