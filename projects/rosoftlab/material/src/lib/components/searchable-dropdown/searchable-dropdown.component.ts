import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl, UntypedFormControl } from '@angular/forms';
import { BaseModel, BaseQueryData, BaseService } from '@rosoftlab/core';
import { Subject } from 'rxjs';
import { debounceTime, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'rsl-searchable-dropdown',
    templateUrl: './searchable-dropdown.component.html',
    host: {
        '[class.example-floating]': 'shouldLabelFloat',
        '[id]': 'id',
        '[attr.aria-describedby]': 'describedBy',
    },
    standalone: false
})
export class SearchableDropdownComponent<T extends BaseModel> implements OnInit, OnDestroy, ControlValueAccessor {
  static nextId = 0;
  onChange = (_: any) => { };
  onTouched = () => { };
  stateChanges = new Subject<void>();
  focused = false;
  errorState = false;
  id = `rsl-searchable-dropdown-${SearchableDropdownComponent.nextId++}`;

  // label for the search dropdown
  @Input() label: string = '';

  //Name of the form control
  @Input() fControlName: string;

  //Reference of the service
  @Input() serviceRef: BaseService<T>;

  //Fields for filtering
  @Input() searchFields: string;

  //Fields for display 
  @Input() displayFields: string;

  //Fields for sorting the API data
  @Input() sortFields: string = '';

  // The value used to populate the control value
  @Input() valueField: string = 'id';

  // The minumum char for search
  @Input() minLengthTerm: number = 3;

  // The preload x elements
  @Input() preloadElementsCount: number;

  @Output() modelSelected: EventEmitter<BaseModel> = new EventEmitter();


  get empty() {
    return !this.value;
  }


  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _disabled = false;



  @Input()
  get value(): any | null {
    return this._value;
  }
  set value(value: any | null) {
    if (value)
      if (this._value !== value) {
        this.loadModel(value);
      }
    this._value = value;
    this.stateChanges.next();
  }
  private _value: any;
  // Search form control
  searchControl: AbstractControl;

  showSerach = true;
  isLoading = false;
  options = [];
  filteredOptions = [];
  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  constructor(
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl
  ) {

    this.searchControl = new UntypedFormControl('');
    _focusMonitor.monitor(_elementRef, true).subscribe(origin => {
      if (this.focused && !origin) {
        this.onTouched();
      }
      this.focused = !!origin;
      this.stateChanges.next();
    });

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {

    if (!this.displayFields)
      this.displayFields = this.searchFields;

    this.loadModel(this.ngControl.value)

    if (this.preloadElementsCount) {
      this.serviceRef.getAll(1, this.preloadElementsCount).subscribe({
        next: (data: BaseQueryData<T>) => {
          this.showSerach = false;
          this.options = data.getModels();
          this.filteredOptions = this.options;
        }
      })
    }

    this.searchControl.valueChanges
      .pipe(
        filter((res) => {
          const result = res !== null && res.length >= this.minLengthTerm;
          if (!result) {
            this.options = [];
            this.filteredOptions = [];
          }
          this.showSerach = !result;
          return result;
        }),
        debounceTime(300),
        tap(() => {
          this.filteredOptions = [];
          this.isLoading = true;
        }),
        switchMap((value: string) =>
          this.serviceRef
            .getAll(1, 10, this.sortFields, `${this.searchFields.replace(',', '|')}@=*${value}`)
            .pipe(
              finalize(() => {
                this.isLoading = false;
              })
            )
        ),
        takeUntil(this._onDestroy)
      )
      .subscribe((options: any) => {
        this.filteredOptions = options.getModels();
      });
  }

  onSelected($event) {
    const value = $event.option.value;
    this.searchControl.setValue(value);
    this.modelSelected.emit(value);
    if (this.valueField in value) {
      this.setControlValue(value[this.valueField]);
    }

  }
  setControlValue(value: any) {
    this.value = value;
    this.ngControl.control.setValue(value);
  }
  displayWith(value: any) {
    return this.getConcatedFields(value);
  }

  clearSelection() {
    this.modelSelected.emit(null);
    this.setControlValue(null);
    this.searchControl.setValue(null);
    this.filteredOptions = this.options;
  }

  getConcatedFields(option): string {
    if (!option) return null;
    const filtersArr = this.displayFields.split(',');
    return filtersArr.reduce((acc, cv) => {
      return acc.concat(option[cv] + ' ');
    }, '');
  }

  ngOnDestroy() {
    this.searchControl = null;
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  getSearchText(): string {
    return `Enter ${this.minLengthTerm} characters to start search`;

  }
  writeValue(model: T | null): void {
    console.log(model);
    this.value = model;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  private loadModel(id: string) {
    //Load the model from API to display the value
    let needLoad = false;
    if (id) {
      if (!this.searchControl.value)
        needLoad = true
      else {
        if (this.searchControl.value[this.valueField] !== id) {
          needLoad = true
        }
      }
    }
    if (needLoad) {
      this.serviceRef.get(id).subscribe({
        next: (model: T) => {
          this.options.push(model);
          this.filteredOptions = this.options;
          this.searchControl.setValue(model);
        }
      })
    }
  }
}
