import { FormlyFieldConfig } from "@ngx-formly/core";

/** Ensure that the key is a valid property of the model T and that the type of the value for that property is V */
export type FormlyFieldKeyOfType<Model, FieldType> = {
  [Key in keyof Model]: Model[Key] extends FieldType ? Key & string : never
}[keyof Model];

/** Extension of FormlyFieldConfig with a restricted key type that is a string but also is a valid key of T and T[key] is of type V */
export interface FormlyFieldConfigKeyed<Model, FieldType>
  extends FormlyFieldConfig {
  key: FormlyFieldKeyOfType<Model, FieldType>;
}

/** Formly type safe config builder for given Model interface.
 */
export class FormlyConfigBuilder<Model> {
  /** fieldConfig must have key property that is a valid keyOf Model and its type equals FieldType */
  public build<FieldType>(
    fieldConfig: FormlyFieldConfigKeyed<Model, FieldType>
  ): FormlyFieldConfig;
  /** fieldConfig must have key property that is a valid keyOf Model */
  public build(
    fieldConfig: FormlyFieldConfigKeyed<Model, any>
  ): FormlyFieldConfig {
    return fieldConfig;
  }
}

/** Function to build config which applies keyOf and value type check to config based of the Model and FieldType */
export function buildConfig<Model, FieldType>(
  fieldConfig: FormlyFieldConfigKeyed<Model, FieldType>
): FormlyFieldConfig {
  return fieldConfig;
}
