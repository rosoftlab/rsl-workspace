export interface Overrides {
  getDirtyAttributes?: (attributedMetadata: any, model?: any) => object;
  getAllAttributes?: (attributedMetadata: any, model?: any) => object;
  toQueryString?: (params: any) => string;
}
