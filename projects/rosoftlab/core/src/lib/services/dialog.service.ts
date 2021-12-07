import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import Swal from 'sweetalert2';
declare var $: any;

/**
 * Async modal dialog service
 * DialogService makes this app easier to test by faking this service.
 * TODO: better modal implementation that doesn't use window.confirm
 */
@Injectable()
export class DialogService {
  /**
   * Ask user to confirm an action. `message` explains the action and choices.
   * Returns observable resolving to `true`=confirm or `false`=cancel
   */
  constructor() { }
  confirm(message?: string, text?: string,
    confirmButtonText: string = 'löschen',
    cancelButtonText: string = 'abbrechen'): Observable<boolean> {
    const confirmation = Swal.fire({
      title: message || 'Are you sure?',
      //icon: 'warning',
      text: text || '',
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      customClass: {
        confirmButton: 'btn btn-red btn-fill btn-wd',
        cancelButton: 'btn btn-grey btn-fill btn-wd',
      },
      buttonsStyling: false,
      reverseButtons: true
    })

      .then((result: any) => {
        if (result.value) {
          return true;
        } else {
          return false;
        }
      }).catch();
    return from(confirmation);
  }
  showSaveMessage(message?: string, title?: string): Observable<boolean> {
    const confirmation = Swal.fire({
      icon: 'success',
      title: message,
      timer: 2000,
      showConfirmButton: false,
      // customClass: 'overflow-hidden',
      buttonsStyling: false
    }).then(() => {
      return true;
    }, () => {
      return false;
    }).catch();
    return from(confirmation);
  }
  showRegisteredMessage(message?: string, title?: string): Observable<boolean> {
    const confirmation = Swal.fire({
      icon: 'success',
      title: message,
      showConfirmButton: true,
      customClass: {
        confirmButton: 'btn btn-success',
      },
      buttonsStyling: false
    }).then(() => {
      return true;
    }, () => {
      return false;
    }).catch();
    return from(confirmation);
  }

  // notification(message?: string, type?: NotificationType, fromPosition?: NotificationFrom, align?: NotificationAlign, timer?: number) {

  //   if (!type) {
  //     type = NotificationType.success;
  //   }
  //   if (!fromPosition) {
  //     fromPosition = NotificationFrom.bottom;
  //   }
  //   if (!align) {
  //     align = NotificationAlign.center;
  //   }
  //   if (!timer) {
  //     timer = 3000;
  //   }

  //   $.notify({
  //     icon: 'notifications',
  //     message: message
  //   }, {
  //       type: type,
  //       timer: 3000,
  //       placement: {
  //         from: from,
  //         align: align
  //       }
  //     });
  // }
  showErrorMessage(e: any, message?: string): Observable<boolean> {
    if (!message) {
      message = 'Validation errors';
    }
    if (e instanceof HttpErrorResponse) {
      // Validation errors
      if (e.status === 400) {
        const errors = e.error.errors;
        if (errors) {
          errors.forEach(error => {
            message += error.field + ' ' + error.detail + '\n';
          });
          // message = errors.detail;
          // if (detail.relationships) {
          //   detail.relationships.forEach(relation => {
          //     console.log(relation);
          //   });
          // }
        }
      }
    }
    const confirmation = Swal.fire({
      icon: 'error',
      title: message,
      // timer: 2000,
      showConfirmButton: true,
      customClass: {
        confirmButton: 'btn btn-success',
      },
      buttonsStyling: false
    }).then(() => {
      return true;
    }, () => {
      return false;
    }).catch();
    return from(confirmation);
  }
  getTextTranslation(translationKey: string) {
    // // const result = await promise;
    // // return result;
    // const result = this.translate.instant(translationKey);
    // if (result === translationKey) {
    return translationKey;
    // }
    // return result;
  }
}

