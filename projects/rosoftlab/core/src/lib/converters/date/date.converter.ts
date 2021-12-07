import { format, parse, parseISO } from 'date-fns';
import { PropertyConverter } from '../../interfaces/property-converter.interface';

export class DateConverter implements PropertyConverter {
  mask(value: any) {
    const d = parseISO(value);
    return d;
  }
  unmask(value: any) {
    // const result = format(value, 'YYYY-MM-DDTHH:mm:ssZ');
    return value;
  }
}
