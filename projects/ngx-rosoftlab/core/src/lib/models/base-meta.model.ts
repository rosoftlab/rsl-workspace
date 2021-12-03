export class BaseMetaModel {
  public links: Array<any>;
  public meta: any;

  constructor(response: any) {
    this.links = response.links || [];
    this.meta = response.meta;
  }
}
