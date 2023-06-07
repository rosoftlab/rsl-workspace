import 'reflect-metadata';
// import * as Reflect from 'reflect-metadata';
import { AttributeMetadata } from '../constants/symbols';
import { DateConverter } from '../converters/date/date.converter';
import { AttributeDecoratorOptions } from '../interfaces/attribute-decorator-options.interface';

export function Attribute(options: AttributeDecoratorOptions = {}): PropertyDecorator {
  return (target: any, propertyName: string) => {

    const converter = (dataType: any, value: any, forSerialisation = false): any => {
      let attrConverter;
      if (dataType) {
        if (options.converter) {
          attrConverter = options.converter;
        } else if (dataType === Date) {
          attrConverter = new DateConverter();
        } else {
          const datatype = new dataType();

          if (datatype.mask && datatype.unmask) {
            attrConverter = datatype;
          }
        }

        if (attrConverter) {
          if (!forSerialisation) {
            return attrConverter.mask(value);
          }
          return attrConverter.unmask(value);
        }
      }
      return value;
    };

    const saveAnnotations = () => {
      const metadata = Reflect.getMetadata('Attribute', target) || {};

      metadata[propertyName] = {
        marked: true
      };

      Reflect.defineMetadata('Attribute', metadata, target);

      const mappingMetadata = Reflect.getMetadata('AttributeMapping', target) || {};
      const serializedPropertyName = options.serializedName !== undefined ? options.serializedName : propertyName;
      mappingMetadata[serializedPropertyName] = propertyName;
      Reflect.defineMetadata('AttributeMapping', mappingMetadata, target);

      const requiredMetadata = Reflect.getMetadata('AttributeRequired', target) || {};
      requiredMetadata[serializedPropertyName] = options.required !== undefined ? options.required : false;
      Reflect.defineMetadata('AttributeRequired', requiredMetadata, target);

      const defaultMetadata = Reflect.getMetadata('AttributedefaultValue', target) || {};
      defaultMetadata[serializedPropertyName] = options.defaultValue !== undefined ? options.defaultValue : null;
      Reflect.defineMetadata('AttributedefaultValue', defaultMetadata, target);

      const formSubGroupMetadata = Reflect.getMetadata('AttributeformSubGroup', target) || {};
      formSubGroupMetadata[serializedPropertyName] = options.formSubGroup !== undefined ? options.formSubGroup : null;
      Reflect.defineMetadata('AttributeformSubGroup', formSubGroupMetadata, target);

    };

    const setMetadata = (
      hasDirtyAttributes: boolean,
      instance: any,
      oldValue: any,
      newValue: any,
      isNew: boolean
    ) => {
      const targetType = Reflect.getMetadata('design:type', target, propertyName);

      if (!instance[AttributeMetadata]) {
        instance[AttributeMetadata] = {};
      }

      const propertyHasDirtyAttributes = typeof oldValue === 'undefined' && !isNew ? false : hasDirtyAttributes;

      instance[AttributeMetadata][propertyName] = {
        newValue,
        oldValue,
        serializedName: options.serializedName,
        hasDirtyAttributes: propertyHasDirtyAttributes,
        serialisationValue: converter(targetType, newValue, true)
      };
    };

    const getter = function () {
      return this['_' + (propertyName as string)];
    };

    const setter = function (newVal: any) {
      const targetType = Reflect.getMetadata('design:type', target, propertyName);
      const convertedValue = converter(targetType, newVal);

      if (convertedValue !== this['_' + (propertyName as string)]) {
        setMetadata(true, this, this['_' + (propertyName as string)], newVal, !this.id);
        this['_' + (propertyName as string)] = convertedValue;
      }
    };

    if (delete target[propertyName]) {
      saveAnnotations();
      Object.defineProperty(target, propertyName, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
      });
    }
  };
}
