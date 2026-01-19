import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Kendo UI Standalone Imports
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_DROPDOWNS } from '@progress/kendo-angular-dropdowns';
import { CreateFormGroupArgs, KENDO_GRID } from '@progress/kendo-angular-grid';
import { KENDO_INPUTS } from '@progress/kendo-angular-inputs';
import { KENDO_LABEL } from '@progress/kendo-angular-label';

// SVG Icons
import { checkIcon, pencilIcon, plusIcon, trashIcon, xIcon } from '@progress/kendo-svg-icons';

@Component({
  selector: 'app-grid-editor',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, KENDO_GRID, 
    KENDO_BUTTONS, KENDO_INPUTS, KENDO_DROPDOWNS, KENDO_LABEL
  ],
  template: `
    <div class="p-3">
      <div class="mb-4 p-3 bg-light border rounded">
        <kendo-label text="Table Layout Title Mapping">
          <kendo-textbox [value]="title" (valueChange)="titleUpdated.emit($event)"></kendo-textbox>
        </kendo-label>
      </div>

      <kendo-grid
        [data]="columns"
        [height]="600"
        [kendoGridReactiveEditing]="createFormGroup"
        (save)="onSave($event)"
        (remove)="onRemove($event)"
      >
        <ng-template kendoGridToolbarTemplate>
          <button kendoGridAddCommand [svgIcon]="plusIcon" themeColor="primary">Add Column</button>
        </ng-template>

        <kendo-grid-column field="propertyName" title="Property" [width]="150"></kendo-grid-column>
        <kendo-grid-column field="header" title="Header" [width]="180"></kendo-grid-column>
        
        <kendo-grid-column field="reference" title="Ref Entity" [width]="130"></kendo-grid-column>
        <kendo-grid-column field="referenceKey" title="Ref Key" [width]="130"></kendo-grid-column>

        <kendo-grid-column field="format" title="Format" [width]="180">
          <ng-template kendoGridCellTemplate let-dataItem>
            {{ getFormatLabel(dataItem.format) }}
          </ng-template>
          <ng-template kendoGridEditTemplate let-formGroup="formGroup">
            <kendo-combobox
              [formControl]="formGroup.get('format')"
              [data]="formatPresets"
              [allowCustom]="true"
              textField="label"
              valueField="value"
              [valuePrimitive]="true">
            </kendo-combobox>
          </ng-template>
        </kendo-grid-column>

        <kendo-grid-command-column title="Actions" [width]="220">
          <ng-template kendoGridCellTemplate let-isNew="isNew">
            <button kendoGridEditCommand [svgIcon]="pencilIcon" [primary]="true">Edit</button>
            <button kendoGridRemoveCommand [svgIcon]="trashIcon">Remove</button>
            <button kendoGridSaveCommand [svgIcon]="checkIcon">{{ isNew ? 'Add' : 'Update' }}</button>
            <button kendoGridCancelCommand [svgIcon]="xIcon">Cancel</button>
          </ng-template>
        </kendo-grid-command-column>
      </kendo-grid>
    </div>
  `
})
export class GridEditorComponent {
  @Input() columns: any[] = [];
  @Input() title: string = '';
  @Output() gridUpdated = new EventEmitter<any[]>();
  @Output() titleUpdated = new EventEmitter<string>();

  public plusIcon = plusIcon; public pencilIcon = pencilIcon;
  public trashIcon = trashIcon; public checkIcon = checkIcon; public xIcon = xIcon;

  public formatPresets = [
    { label: 'Date & Time', value: '{0:dd.MM.yyyy HH:mm:ss}' },
    { label: 'Short Date', value: '{0:dd/MM/yyyy}' }
  ];

  public getFormatLabel(val: string): string {
    if (!val) return 'None';
    const preset = this.formatPresets.find(p => p.value === val);
    return preset ? preset.label : val;
  }

  public createFormGroup = (args: CreateFormGroupArgs): FormGroup => {
    const item = args.isNew ? { 
      propertyName: '', header: '', type: 'text', propertyType: 'System.String',
      reference: null, referenceKey: null, format: null, textAlign: 'left',
      width: null, order: this.columns.length, isSortable: true, 
      isFilterable: true, isReorderable: true, isHidden: false,
      grow: 0, shrink: 0, file_id_property: null
    } : args.dataItem;
    
    return new FormGroup({
      propertyName: new FormControl(item.propertyName, Validators.required),
      header: new FormControl(item.header, Validators.required),
      type: new FormControl(item.type),
      propertyType: new FormControl(item.propertyType),
      reference: new FormControl(item.reference),
      referenceKey: new FormControl(item.referenceKey),
      format: new FormControl(item.format), 
      textAlign: new FormControl(item.textAlign),
      width: new FormControl(item.width),
      order: new FormControl(item.order),
      isSortable: new FormControl(item.isSortable),
      isFilterable: new FormControl(item.isFilterable),
      isReorderable: new FormControl(item.isReorderable),
      isHidden: new FormControl(item.isHidden),
      grow: new FormControl(item.grow),
      shrink: new FormControl(item.shrink),
      file_id_property: new FormControl(item.file_id_property)
    });
  };

  onSave(e: any): void {
    const updated = [...this.columns];
    e.isNew ? updated.push(e.formGroup.value) : Object.assign(e.dataItem, e.formGroup.value);
    this.gridUpdated.emit(updated);
  }

  onRemove(e: any): void {
    this.gridUpdated.emit(this.columns.filter(c => c !== e.dataItem));
  }
}