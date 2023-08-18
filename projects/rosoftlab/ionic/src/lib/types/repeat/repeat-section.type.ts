import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicDialogService } from '../../ionic-dialog.service';
import { WrappersModule } from '../../wrappers/wrappers.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  standalone: true,
  selector: 'formly-repeat-section',
  templateUrl: './repeat-section.html',
  styleUrls: ['./repeat-section.scss'],
  imports: [
    WrappersModule
  ]
})
export class RepeatTypeComponent extends FieldArrayType {
  /**
   *
   */
  deleteMessage: string
  deleteButton: string
  cancelButton: string
  constructor(
    public dialogService: IonicDialogService,
    public translate: TranslateService) {
    super();
    this.deleteMessage = this.translate.instant("General.Delete.Question")
    this.deleteButton = this.translate.instant("General.Delete.Button")
    this.cancelButton = this.translate.instant("General.Cancel.Button")
  }
  override remove(i: number, { markAsDirty } = { markAsDirty: true }) {
    this.dialogService.confirm(this.deleteMessage, null, this.deleteButton, this.cancelButton).then(
      (value: any) => {
        if (value.data) {
          super.remove(i);
        }
      }
    )
  }
}