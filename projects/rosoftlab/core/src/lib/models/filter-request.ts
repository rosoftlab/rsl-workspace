export interface FilterRequest {
  page?: number;
  page_size?: number;
  filters?: string;
  sorts?: any;
  group_by?: any;
  distinct_columns?: any;
}
