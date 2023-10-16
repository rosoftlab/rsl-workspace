import { parseISO } from 'date-fns';
import { PropertyConverter } from '../../interfaces/property-converter.interface';

export class DateConverter implements PropertyConverter {
  mask(value: any) {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }
    const d = parseISO(value);
    if (d instanceof Date && !isNaN(d.getTime())) {
      return d
    } else {
      return value;
    }
  }
  unmask(value: any) {
    // const result = format(value, 'YYYY-MM-DDTHH:mm:ssZ');
    return value;
  }
}
