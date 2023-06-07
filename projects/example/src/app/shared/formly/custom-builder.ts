import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyConfigBuilder, FormlyFieldConfigKeyed } from './formly-builder';
// import { SubModel } from './model';

/** Example custom builder demonstrating how to take advantage of the FormlyConfigBuilder. */
export class AppFormlyConfigBuilder<T> extends FormlyConfigBuilder<T> {

    // Setup label if it is not defined
    private applyDefaultLabel<S>(fieldConfig: FormlyFieldConfigKeyed<T, S>) {
        return this.build({
            ...fieldConfig,
            templateOptions: {
                label: camelToTitle(fieldConfig.key),
                ...fieldConfig.templateOptions
            }
        });
    }

    input(fieldConfig: FormlyFieldConfigKeyed<T, string>): FormlyFieldConfig {
        return this.applyDefaultLabel({ type: "input", ...fieldConfig });
    }

    number(
        fieldConfig: FormlyFieldConfigKeyed<T, number>
    ): FormlyFieldConfig {
        return this.applyDefaultLabel({
            type: "input",
            ...fieldConfig,
            templateOptions: { type: "number", ...fieldConfig.templateOptions },
        });
    }

    textArea(
        fieldConfig: FormlyFieldConfigKeyed<T, string>
    ): FormlyFieldConfig {
        return this.applyDefaultLabel({ type: "textarea", ...fieldConfig });
    }

    date(fieldConfig: FormlyFieldConfigKeyed<T, Date>): FormlyFieldConfig {
        return this.applyDefaultLabel({ type: "datepicker", ...fieldConfig });
    }

    checkbox(
        fieldConfig: FormlyFieldConfigKeyed<T, boolean>
    ): FormlyFieldConfig {
        return this.applyDefaultLabel({ type: "checkbox", ...fieldConfig });
    }

    //   subProp(fieldConfig: FormlyFieldConfigKeyed<T, SubModel>): FormlyFieldConfig {
    //     // Get type safety for sub form model here
    //     const subBuilder = new AppFormlyConfigBuilder<SubModel>();
    //     return {
    //       templateOptions: { label: 'Sub Form'},
    //       fieldGroup:[ subBuilder.number({key: 'number'}), subBuilder.input({key: 'street'})],
    //       ...fieldConfig
    //     };
    //   }
}

const camelToTitle = (camelCase?: string) =>
    camelCase?.replace(/([A-Z])/g, match => ` ${match}`)
        .replace(/^./, match => match.toUpperCase())
        .trim();
