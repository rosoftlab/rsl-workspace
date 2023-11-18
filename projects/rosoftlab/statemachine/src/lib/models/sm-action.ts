
import { BaseModel, BaseModelConfig } from "@rosoftlab/core";

@BaseModelConfig({
  type: 'statemachine',
})
export class SmAction extends BaseModel {
  public actionID: number
  public buttonName: string
  public buttonTranslationKey: string
  public isAutomatedTransition: boolean
  public props?: string
}
