import { Injectable } from '@angular/core';
import { BaseModel, BaseService, GridLayoutModel } from '..';

@Injectable({
  providedIn: 'root'
})
export class GridLayoutService<T extends BaseModel> {

  constructor(protected baseService: BaseService<T>) { }
  public getGridLayout(): GridLayoutModel[] {
    var model = this.baseService.newModel();
    return model.getGridLayout();
  }
}
