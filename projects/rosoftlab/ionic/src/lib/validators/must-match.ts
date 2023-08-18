import { AbstractControl } from '@angular/forms';

export function fieldMatchValidator(control: AbstractControl) {
    const { password, confirmPassword } = control.value;

    // avoid displaying the message error when values are empty
    if (!confirmPassword || !password) {
        return null;
    }

    if (confirmPassword === password) {
        return null;
    }

    return { fieldMatch: { message: 'Fields.Not.Matching' } };
}