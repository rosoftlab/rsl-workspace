import { Component, OnInit, Type } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig, FormlyFieldProps } from '@ngx-formly/core';
import { FormlyFieldInput } from '@ngx-formly/ionic/input';
import { TranslateService } from '@ngx-translate/core';
import { SmAction, SmActionService, State, StateService } from '@rosoftlab/statemachine';
import { Observable } from 'rxjs';
import { WrappersModule } from '../../wrappers/wrappers.module';
interface InputProps extends FormlyFieldProps { }

export interface FormlyInputFieldConfig extends FormlyFieldConfig<InputProps> {
  type: 'input' | Type<FormlyFieldInput>;
}
@Component({
  standalone: true,
  selector: 'app-ionic-sm-buttons',
  templateUrl: './ionic-sm-buttons.component.html',
  styleUrls: ['./ionic-sm-buttons.component.css'],
  imports: [
    WrappersModule
  ]
})
export class RslIonicSmButtonsComponent extends FieldType<FieldTypeConfig<InputProps>> implements OnInit {
  smActions$: Observable<SmAction[]>
  currentState: State;

  objectType: string;
  objectId: string;
  constructor(
    public smActionService: SmActionService,
    private stateService: StateService,
    public translate: TranslateService) {
    super()
  }
  ngOnInit() {
    this.objectType = this.props.attributes['objectType'] as string
    this.objectId = this.field.parent.model.id
    this.loadCurrentState(this.field.model.currentStateId);
    this.smActions$ = this.smActionService.getActions(this.objectId, this.objectType)
    // console.log(this.field)
  }
  executeAction(action: SmAction) {
    // this.currentState = null
    // this.smActions$ = null
    // console.log(action.actionID)
    this.smActionService.executeAction(this.objectId, this.objectType, action.actionID, "")
      .subscribe(
        response => {
          // console.log(response)
          if (this.field.props['onStateCahnged'])
            this.field.props['onStateCahnged']({ model: this.field.parent.model, response });
          this.model['currentStateId'] = response.currentStateId
          this.smActionService.getActions(this.objectId, this.objectType)

          this.options.resetModel()
          // this.field.formControl.updateValueAndValidity()         
          this.smActions$ = this.smActionService.getActions(this.objectId, this.objectType)
          // //this.smActions = []
          this.loadCurrentState(response.currentStateId);
        }
      )
    // console.log(action);
  }
  loadCurrentState(stateId: any) {
    this.stateService.get(stateId).subscribe(
      state => this.currentState = state
    )
  }
  getColor(action: SmAction) {
    if (action.props) {
      return action.props["Color"] ? action.props["Color"] : "primary";
    }
    return "primary"
  }
  getCurrentState() {
    return this.translate.instant('General.State.CurrentState', { field: this.currentState.name });
  }
}
