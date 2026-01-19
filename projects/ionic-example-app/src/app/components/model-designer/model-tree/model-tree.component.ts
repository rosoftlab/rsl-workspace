import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KENDO_TREEVIEW } from '@progress/kendo-angular-treeview';

@Component({
  selector: 'app-model-tree',
  templateUrl: './model-tree.component.html',
  imports: [CommonModule, KENDO_TREEVIEW],
})
export class ModelTreeComponent {
  @Input() data: any[] = [];
  @Output() modelSelected = new EventEmitter<any>();

  onNodeSelect(e: any) {
    this.modelSelected.emit(e.item.dataItem);
  }
}
