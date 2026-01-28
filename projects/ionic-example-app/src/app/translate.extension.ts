import { FormlyExtension, FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';

export class TranslateExtension implements FormlyExtension {
  constructor(private translate: TranslateService) {}
  prePopulate(field: FormlyFieldConfig) {
    console.log('Test translate');
    const props = field.props || {};
    if (!props['translate'] || props['_translated']) {
      return;
    }

    props['_translated'] = true;
    field.expressions = {
      ...(field.expressions || {}),
      'props.label': props.label ? this.translate.stream(props.label) : '',
    };
    if (props.placeholder) {
      field.expressions = {
        ...(field.expressions || {}),
        'props.placeholder': props.placeholder ? this.translate.stream(props.placeholder) : '',
      };
    }
    if (props.description) {
      field.expressions = {
        ...(field.expressions || {}),
        'props.description': props.description ? this.translate.stream(props.description) : '',
      };
    }
  }
}

export function registerTranslateExtension(translate: TranslateService) {
  return {
    validationMessages: [
      {
        name: 'required',
        message(error: any, field: FormlyFieldConfig) {
          // console.log(field);
          return translate.stream('General.Field.Required', { field: field.props?.label });
        },
      },
    ],
    extensions: [
      {
        name: 'translate',
        extension: new TranslateExtension(translate),
      },
    ],
  };
}
