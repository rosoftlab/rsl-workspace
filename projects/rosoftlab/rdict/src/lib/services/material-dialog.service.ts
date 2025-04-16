import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { NotificationService, NotificationSettings } from '@progress/kendo-angular-notification';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaterialDialogService {
  public state: NotificationSettings = {
    content: "Your data has been saved.",
    type: { style: "success", icon: true },
    animation: { type: "slide", duration: 400 },
    hideAfter: 3000,
  };
  constructor(
    public translate: TranslateService,
    private dialogService: DialogService,
    private notificationService: NotificationService
  ) { }
  confirmDelete(): Observable<boolean> {
    return this.confirm(
      this.translate.instant("Are you sure you want to delete this record ?"),
      this.translate.instant("Delete Record"),
      this.translate.instant("General.Yes"),
      this.translate.instant("General.No")
    );
  }

  confirm(content?: string, title?: string, confirmButtonText?: string, cancelButtonText?: string): Observable<boolean> {
    const dialog: DialogRef = this.dialogService.open({
      title: title || "Confirm",
      content: content || "Are you sure?",
      actions: [
        { text: cancelButtonText || "No", result: false },
        { text: confirmButtonText || "Yes", themeColor: "primary", result: true }
      ],
      width: 450,
      height: 200,
      minWidth: 250,
    });

    // Return an Observable<boolean>
    return new Observable((observer) => {
      dialog.result.subscribe((result) => {
        if (result instanceof DialogCloseResult) {
          // Dialog was closed without an action
          observer.next(false);
        } else {
          const actionResult = result as { text: string, result: boolean };
          observer.next(actionResult.result);
        }
        observer.complete(); // Complete the observable
      });
    });
  }
  showSaveMessage(message?: string): void {
    this.state.content = message || "Your data has been saved.";
    this.state.type = { style: "success", icon: true };
    this.notificationService.show(this.state);
  }
  // showRegisteredMessage(message?: string, title?: string): Observable<boolean> {

  // }
  // showErrorMessage(e: any, message?: string): Observable<boolean> {

  // }
}
