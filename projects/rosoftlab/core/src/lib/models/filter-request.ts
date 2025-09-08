export interface FilterRequest {
  page?: number;
  pageSize?: number;
  filters?: string;
  sorts?: any;
  groupBy?: any;
  distinctColumns?: any;
}
