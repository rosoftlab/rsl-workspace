
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[translatedElement]',
})
export class TranslatedElementDirective {

  @Input('translatedElement')
  public elementKey: string;

  constructor(
    public readonly viewRef: ViewContainerRef,
    public readonly templateRef: TemplateRef<any>,
  ) {}
}