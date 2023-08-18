import { Injectable } from '@angular/core';
import { BaseService } from '@rosoftlab/core';
import { MaterialBaseModel } from '../models';
import { GridLayoutModel } from '../models/grid-layout';

@Injectable({
  providedIn: 'root'
})
export class GridLayoutService<T extends MaterialBaseModel> {

  constructor(protected baseService: BaseService<T>) { }
  public getGridLayout(): GridLayoutModel[] {
    var model = this.baseService.newModel();
    return model.getGridLayout();
  }
}
