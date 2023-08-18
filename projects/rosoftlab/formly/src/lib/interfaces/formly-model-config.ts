export interface FormlyModelConfig {
    key?: string;
    type: 'input' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'datetime' | 'range' | 'toggle' | 'subobject' | any;
    label: string;
    required?: boolean;
    placeholder?: string;
    description?: string;
    defaultValue?: any;

    valueProp?: string;
    labelProp?: string;

}
