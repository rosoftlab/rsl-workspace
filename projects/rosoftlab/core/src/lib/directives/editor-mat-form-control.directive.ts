import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { AutofillMonitor } from '@angular/cdk/text-field';
import {
  Directive, DoCheck, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, NgZone, Optional,
  Output, Self
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CanUpdateErrorState, CanUpdateErrorStateCtor, ErrorStateMatcher, mixinErrorState } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { Subject } from 'rxjs';
import { Editor } from 'tinymce';

let nextUniqueId: number = 0;

class EditorControlBase {
  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) { }
}

export interface EditorChange {
  textContent: string;
  displayContent: string;
}

const _EditorInputMixinBase: CanUpdateErrorStateCtor & typeof EditorControlBase = mixinErrorState(EditorControlBase);

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[tinyMatFormControl]',
  providers: [{ provide: MatFormFieldControl, useExisting: EditorMatFormControlDirective }]
})

export class EditorMatFormControlDirective extends _EditorInputMixinBase
  implements MatFormFieldControl<any>, CanUpdateErrorState, DoCheck {
  @HostBinding('[attr.id]')
  @HostBinding('[attr.aria-describedby]')
  @HostBinding('[attr.aria-invalid]')
  @HostBinding('[attr.aria-required]')
  @Input()
  get disabled(): boolean {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled;
    }
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);

    // Browsers may not fire the blur event if the input is disabled too quickly.
    // Reset from here to ensure that the element doesn't become stuck.
    if (this.focused) {
      this.focused = false;
      this.stateChanges.next();
    }
  }
  private _disabled = false;

  @Input()
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value || this.uid;
  }
  private _id: string;

  /**
   * This input just provides the placeholder to the mat-form-field.
   * Placeholder setup will still have to be done according to the
   * TinyMCE placeholder plugin being used.
   */
  @Input() placeholder: string;

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
  }
  private _required = false;

  @Input()
  get value(): string {
    return this.editor ? this.editor.getContent() : null;
  }
  set value(value: string) {
    if (value !== this.value && this.editor) {
      this.editor.setContent(value);
      this.stateChanges.next();
    }
  }

  @Output() editorChange = new EventEmitter<EditorChange>();

  empty: boolean = false;

  focused: boolean = false;

  controlType: string = 'tinymce-editor';

  readonly stateChanges: Subject<void> = new Subject<void>();

  ariaDescribedby: string | null;

  shouldLabelFloat: boolean = true;

  autofilled: boolean = false;

  private uid = `tinymce-mat-form-control-${nextUniqueId++}`;

  private editor: Editor;

  private editorElement: HTMLElement;

  constructor(
    private elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() parentForm: NgForm,
    @Optional() parentFormGroup: FormGroupDirective,
    errorStateMatcher: ErrorStateMatcher,
    @Self() @Inject(NG_VALUE_ACCESSOR) private valueAccessor: EditorComponent,
    private platform: Platform,
    private autofillMonitor: AutofillMonitor,
    private ngZone: NgZone
  ) {
    super(errorStateMatcher, parentForm, parentFormGroup, ngControl);
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  @HostListener('onInit', ['$event'])
  onEditorInit({ editor }: { editor: Editor }) {
    // Cache a copy of the editor so that we have access to it
    // elsewhere. This won't be necessary once the '_editor'
    // property on EditorComponent has a public getter. This was
    // added in TINY-3772, but it's not published to npm yet.
    this.editor = editor;

    // Cache the editor element so that we can focus it on container clicks
    this.editorElement = editor.getElement() as HTMLElement;

    if (this.platform.isBrowser) {
      this.autofillMonitor.monitor(this.editorElement).subscribe((event) => {
        this.autofilled = event.isAutofilled;
        this.stateChanges.next();
      });
    }
  }

  setDescribedByIds(ids: string[]) {
    this.ariaDescribedby = ids.join(' ');
  }

  onContainerClick() {
    if (!this.focused && this.editorElement) {
      this.editorElement.focus();
    }
  }
}
