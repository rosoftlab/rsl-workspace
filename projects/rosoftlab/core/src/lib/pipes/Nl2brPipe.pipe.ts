import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'nl2br',
    standalone: false
})
export class Nl2brPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    // return value.replace(/\n/g, '<br />');
    if (value) {
      value = value.replace(/(?:\r\n\r\n|\r\r|\n\n)/g, '</p><p>');
      return '<p>' + value.replace(/(?:\r\n|\r|\n)/g, '<br>') + '</p>';
    }
    return value;
  }
}