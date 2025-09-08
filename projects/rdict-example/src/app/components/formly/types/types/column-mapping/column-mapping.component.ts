import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldArrayType, FormlyFormBuilder, FormlyModule } from '@ngx-formly/core';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { TranslateModule } from '@ngx-translate/core';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { Keys } from '@progress/kendo-angular-common';
import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
import { AddEvent, CellClickEvent, CellCloseEvent, KENDO_GRID } from '@progress/kendo-angular-grid';
import { KENDO_NUMERICTEXTBOX, KENDO_TEXTBOX } from '@progress/kendo-angular-inputs';
import { KENDO_LABEL } from '@progress/kendo-angular-label';
import { SpreadsheetComponent } from '@progress/kendo-angular-spreadsheet';
import { CompositeFilterDescriptor, process } from '@progress/kendo-data-query';
import { cloneDeep } from 'lodash';
import { SpreadsheetService } from 'projects/rdict-example/src/app/services/spreadsheet.service';
import { ReactiveDictionary } from 'projects/rosoftlab/rdict/src/lib/reactive-dictionary';
import { BehaviorSubject, combineLatest, map, Observable, of, shareReplay, Subscription } from 'rxjs';

@Component({
  selector: 'formly-column-mapping',
  templateUrl: './column-mapping.component.html',
  styleUrls: ['./column-mapping.component.scss'],
  imports: [FormlyModule, ReactiveFormsModule, FormlyKendoModule, TranslateModule, CommonModule, KENDO_GRID, KENDO_DROPDOWNLIST, KENDO_TEXTBOX, KENDO_LABEL, KENDO_NUMERICTEXTBOX, KENDO_BUTTONS],
})
export class ColumnMappingComponent extends FieldArrayType implements OnInit, OnDestroy {
  public fullJoined$: Observable<any> = of([]); // Never emits null
  public joined$: Observable<any> = of([]); // Never emits null
  public formGroup: FormGroup | undefined;

  private subs = new Subscription();
  public gridData: any[] = [];
  public joinedSnapshot: any[] = [];

  public headerRow = 1;
  public spreadsheet: SpreadsheetComponent | null = null;
  private sheetSub: Subscription | undefined;

  private filterSubject = new BehaviorSubject<CompositeFilterDescriptor>({
    logic: 'and',
    filters: [
      {
        field: 'name',
        operator: 'contains',
        value: '',
      },
    ],
  });
  public filter$ = this.filterSubject.asObservable();

  constructor(
    private builder: FormlyFormBuilder,
    private rdict: ReactiveDictionary,
    private svc: SpreadsheetService,
  ) {
    super();
    this.createFormGroup = this.createFormGroup.bind(this);
  }
  ngOnInit() {
    this.sheetSub = this.svc.sheetRef$.subscribe(
      (s) =>
        // console.log('Spreadsheet reference received:', s),
        (this.spreadsheet = s),
    );
    const dataTypes$ = this.rdict.getArray$('administration.data_types');
    const dataSources$ = this.rdict.getArray$('administration.data_sources');

    this.fullJoined$ = combineLatest([
      dataTypes$, // Array<{ oid: string; name: string }>
      dataSources$, // Array<{ oid: string; name: string }>
    ]).pipe(
      map(([types, sources]) => {
        // build all pairs
        const pairs = types.flatMap((type: any) =>
          sources.map((source: any) => ({
            oid: `${source.oid}_${type.oid}`,
            // keep the raw names around for sorting...
            src: source.name,
            typ: type.name,
            // ...and the final display name
            name: `${source.name} ${type.name}`,
          })),
        );

        // sort by source.name, then type.name
        pairs.sort((a: { src: string; typ: string }, b: { src: string; typ: string }) => a.src.localeCompare(b.src) || a.typ.localeCompare(b.typ));

        // strip out the temporary fields if you only want { oid, name }
        const joined = pairs.map((pair: { oid: string; name: string }) => {
          const { oid, name } = pair;
          return { oid, name };
        });
        const headerItems = [
          { oid: '-1', name: 'Date' },
          { oid: '-2', name: 'Time' },
        ];
        const fullList = [...headerItems, ...joined];
        return fullList;
      }),
      shareReplay(1), // Cache the result to avoid recomputing
    );

    this.subs.add(this.fullJoined$.subscribe((list) => (this.joinedSnapshot = list)));

    this.joined$ = combineLatest([this.fullJoined$, this.filter$]).pipe(map(([fullList, filter]) => process(fullList, { filter }).data));

    // this.formControl.valueChanges.subscribe((value) => {
    //   // console.log('Custom value change:', value);
    //   if (value != undefined) {
    //     console.log('Custom value change:', value);
    //     // if (this.isFirstTime) {
    //     //   this.data = value;
    //     //   setTimeout(() => {
    //     //     this.spreadsheetRef.activeSheet = value[0]?.name;
    //     //   }, 1000);
    //     // }
    //   }
    // });
  }
  ngOnDestroy() {
    this.sheetSub?.unsubscribe();
  }
  private getfieldGroup(): any[] {
    return cloneDeep((this.field.fieldArray as any).fieldGroup) as any[];
  }

  public createFormGroup(data: any): FormGroup {
    const group = new FormGroup({});
    // buildForm(form: FormGroup|FormArray, fieldGroup: FormlyFieldConfig[], model: any, options: FormlyFormOptions)

    this.builder.buildForm(
      group,
      this.getfieldGroup(), // your 4 fields: sheet_column, field, isExport, formula
      {
        sheet_column: data.sheet_column, // this is the column name in the spreadsheet, e.g. 'A', 'B', etc.
        sheet_column_name: data.sheet_column_name, // this is the display name for the column, e.g. 'Product Name'
        field: data.field, // this is the field name in the data source, e.g. 'ProductName', 'UnitPrice', etc.
        isExport: data.isExport, // whether this column should be exported
        formula: data.formula, // optional formula to apply, e.g. '=SUM(A1:A10)'
      }, // either the existing row data or an empty object
      this.field.options ?? {}, // FormlyFormOptions, carries things like formState
    );
    return group;
  }
  public addHandler(args: AddEvent): void {
    console.log('Add handler called', args);
    this.items.push(
      this.createFormGroup({
        sheet_column: '',
        field: '',
        isExport: false,
        formula: '',
      }),
    );
  }
  public get items(): FormArray {
    return this.formControl as FormArray;
  }
  public removeHandler(e: any) {
    this.remove(e.rowIndex);
  }
  getJoinedName(oid: string): string {
    let name = '';
    const sources = this.joinedSnapshot || [];
    const match = sources.find((x: any) => x.oid === oid);
    if (match) {
      name = match.name;
    }
    return name;
  }
  /**
   * This method is called when the user types in the filter input.
   * It updates the filterSubject with a new filter descriptor that filters
   * the grid data based on the 'name' field containing the input value.
   * @param value The value entered in the filter input.
   */
  handleFilter(value: any) {
    this.filterSubject.next({
      logic: 'and',
      filters: [
        {
          field: 'name',
          operator: 'contains',
          value,
        },
      ],
    });
  }

  /**
   * This method is called when the user clicks on a cell in the grid.
   * It checks if the cell is not already being edited, and if so, it opens
   * the cell for editing by creating a FormGroup based on the data item.
   */
  public cellClickHandler(args: CellClickEvent): void {
    if (!args.isEdited) {
      args.sender.editCell(args.rowIndex, args.columnIndex, this.createFormGroup(args.dataItem));
    }
  }

  /**
   * This method is called when the user closes an edited cell in the grid.
   * It checks if the form group is valid and dirty, and if so, updates the
   * corresponding item in the items FormArray.
   * If the form group is invalid, it prevents the cell from closing.
   */
  public cellCloseHandler(args: CellCloseEvent): void {
    const { formGroup, dataItem } = args;

    if (!formGroup.valid) {
      // prevent closing the edited cell if there are invalid values.
      args.preventDefault();
    } else if (formGroup.dirty) {
      if (args.originalEvent && args.originalEvent.keyCode === Keys.Escape) {
        return;
      }
      this.items.controls[args.rowIndex].setValue(formGroup.value);
      // this.items[args.rowIndex, formGroup);
      // this.editService.assignValues(dataItem, formGroup.value);
      // this.editService.update(dataItem);
    }
  }
  /**
   * This method is called when the user clicks the "Auto Fill" button.
   * It retrieves the first row of the active sheet in the spreadsheet,
   * extracts all non-null values, and creates a FormGroup for each value
   * that does not already exist in the items array.
   */
  public onAutoFill(): void {
    if (this.spreadsheet) {
      const widget = this.spreadsheet.spreadsheetWidget;
      // 2. Get the active sheet
      const sheet = widget.activeSheet();
      if (sheet) {
        // 3. Select the first row (row 0, all columns)
        //    Here we use numeric parameters: (rowIndex, colIndex, rowCount, colCount)
        const colCount = this.spreadsheet.columns; // e.g. 50 by default
        const lastColLetter = this.colLetterFromIndex(colCount - 1);
        const range = sheet.range(`A${this.headerRow}:${lastColLetter}${this.headerRow}`) as any; // single argument
        if (range) {
          const allValues: any[] = range.values()[0].filter((cell: any) => cell !== null && cell !== undefined);
          const x = allValues.map((value: any, idx: number) => {
            const colLetter = this.colLetterFromIndex(idx);
            return {
              column: `${colLetter}${this.headerRow}`,
              value,
            };
          });
          x.forEach((ctrl, idx) => {
            const group = this.findGroupBySheetColumn(ctrl.column);
            if (!group) {
              this.items.push(
                this.createFormGroup({
                  sheet_column: ctrl.column,
                  sheet_column_name: ctrl.value,
                  field: '',
                  isExport: false,
                  formula: '',
                }),
              );
              // group.get('sheet_column')?.setValue(ctrl.column);
            }
          });
          this.gridData = [...this.items.value];
        }
      }
    }
  }

  /**
   * Finds a FormGroup in the FormArray by the value of the 'sheet_column' control.
   * @param targetValue The value to search for in the 'sheet_column' control.
   * @returns The FormGroup that matches the target value, or null if not found.
   */
  public findGroupBySheetColumn(targetValue: any): FormGroup | null {
    const groups = this.items.controls as FormGroup[];
    const matched = groups.find((group) => {
      const control = group.get('sheet_column');
      return control != null && control.value === targetValue;
    });
    return matched || null;
  }
  /**
   * Converts a zero-based index to a column letter (e.g., 0 -> 'A', 1 -> 'B', ..., 25 -> 'Z', 26 -> 'AA').
   * @param idx The zero-based index of the column.
   * @returns The corresponding column letter(s).
   */
  private colLetterFromIndex(idx: number): string {
    let s = '';
    let n = idx + 1;
    while (n > 0) {
      const mod = (n - 1) % 26;
      s = String.fromCharCode(65 + mod) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }
}
