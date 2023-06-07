import { Component, OnInit } from '@angular/core';
import { DataTablesModule } from "angular-datatables";
import { RslIonicModuleModule } from '../rsl-ionic-module.module';
@Component({
  standalone: true,
  selector: 'rsl-ionic-grid',
  templateUrl: './rsl-ionic-grid.component.html',
  styleUrls: ['./rsl-ionic-grid.component.css'],
  imports: [RslIonicModuleModule, DataTablesModule],
})
export class RslIonicGridComponent implements OnInit {
  public title: string;
  dtOptions: DataTables.Settings = {};
  constructor() { }

  ngOnInit() {
    this.dtOptions = {
      ajax: 'data/data.json',
      columns: [{
        title: 'ID',
        data: 'id'
      }, {
        title: 'First name',
        data: 'firstName'
      }, {
        title: 'Last name',
        data: 'lastName'
      }]
    };
  }
  onAdd() {

  }
}
