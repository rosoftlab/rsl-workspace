export interface JsonBaseError {
  id?: string;
  links ?: Array<any>;
  status ?: string;
  code ?: string;
  title ?: string;
  detail ?: string;
  source ?: {
    pointer ?: string;
    parameter ?: string
  };
  meta ?: any;
}

export class ErrorResponse {
  errors?: JsonBaseError[] = [];

  constructor(errors ?: JsonBaseError[]) {
    if (errors) {
      this.errors = errors;
    }
  }
}
