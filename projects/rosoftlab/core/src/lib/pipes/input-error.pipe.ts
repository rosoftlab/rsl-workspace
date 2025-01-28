import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'inputError',
    standalone: false
})
export class InputErrorPipe implements PipeTransform {
  constructor(protected translate: TranslateService) {

  }
  transform(value: any, filedTranslationKey: any): string {
    let rvalue = '';
    if (value !== null) {
      if (value['invalid'] === true) {
        rvalue = 'ERROR.INVALID';
      }
      if (value['mustMatch'] === true) {
        rvalue = 'Account.Password.MustMach';
      }
      if (value['required'] === true) {
        const field = this.translate.instant(filedTranslationKey.field);
        rvalue = this.translate.instant('General.Field.Required', { field });
      }
      if (value['minlength']) {
        const field = this.translate.instant(filedTranslationKey.field);
        rvalue = this.translate.instant('General.Field.MinLength', { field, requiredLength: value.minlength.requiredLength });
      }
    }
    return rvalue;
  }

}