import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { KENDO_LAYOUT } from '@progress/kendo-angular-layout';
import { FormEditorComponent } from '../form-editor/form-editor.component';
import { GridEditorComponent } from '../grid-editor/grid-editor.component';
import { ModelTreeComponent } from '../model-tree/model-tree.component';
@Component({
  selector: 'app-model-editor',
  templateUrl: './model-editor.component.html',
  styleUrls: ['./model-editor.component.scss'],
  imports: [CommonModule, KENDO_LAYOUT, ModelTreeComponent, GridEditorComponent, FormEditorComponent],
})
export class ModelEditorComponent implements OnInit {
  jsonData: any[] = [];
  selectedItem: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('assets/layouts/data.json').subscribe((data) => {
      this.jsonData = data;
    });
  }

  onSelect(item: any) {
    this.selectedItem = item;
  }
}
